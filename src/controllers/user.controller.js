import asyncHandler from './../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import User from '../models/usermodels.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from './../utils/apiResponse.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



const generateAcessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
       
        const accessToken = await user.genAccessToken();
        const refreshToken = await user.genRefreshToken();

        user.refreshToken = refreshToken; //yha hum ,user database me refreshToken save kra rhe h
        await user.save({ validateBeforeSave: false })//vaidation nhi lagao sidha ja k save kr do.
        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, error, 'Something went wrong while  generating Access & Refresh token');
    }
}
const registerUser = asyncHandler(async (req, res) => {

    //get user details from backend
    //validation check  -not empty
    //check  if user already exist:username,email
    //check for  images ,check  for  avatar
    //upload them cloudinary,avatar
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for  user cretaion
    //send response back to frontend

    const { username, fullName, email, password } = req.body;
    console.log({ username, fullName, email });

    // Validation for empty fields
    if ([username, fullName, email, password].some((field) => field.trim() === '')) {
        throw apiError(400, 'All fields are required');
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // Check for both username and email
    });
    if (existedUser) {
        throw new apiError(409, "User with email or username already exists");
    }



    // console.log("req.files:", req.files, 'ha aa gya hu'); // Debugging file upload
    // console.log("req.files.avatar:", req.files.avatar, 'ha aa gya hu'); // Debugging file upload
    // console.log("req.files.avatar[0]:", req.files.avatar[0], 'ha aa gya hu'); // Debugging file upload
    // console.log("req.files.avatar[0].path:", req.files.avatar[0].path, 'ha aa gya hu'); // Debugging file upload

    // Check for files (avatar and coverImage)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // console.log('avatarLocalPath',avatarLocalPath);
    // console.log('coverImageLoaclPath',coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    // Upload images to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new apiError(400, "Avatar upload failed");
    }

    // Create user
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // Default to empty string if no coverImage
    });

    // Fetch and remove sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user");
    }

    // Send response back
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
    // console.log('Im response', response);
    // return response;
});
const loginUser = asyncHandler(async (req, res) => {

    const { email,username, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: email }, { username:username }]
    });
   

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new apiError(401, "Invalid email or password");
    }
    console.log(user.id);
    const { accessToken, refreshToken } = await generateAcessTokenAndRefreshToken(user._id);
    console.log(accessToken, refreshToken);
    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    //options for cookies
    //cookie by default frontend se modifiable hoti,2 dono option true hone se,only can modify from server.
    const options = {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: true, // Use secure cookies in production
        sameSite: "Strict", // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (e.g., 1 day)
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        )
});
const logoutUser = asyncHandler(async(req,res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
              refreshToken:undefined,
          }
        }, { new: true }
    )
    const options = {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: true, // Use secure cookies in production
        sameSite: "Strict", // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (e.g., 1 day)
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out Successfully"));
    
})
const refreshAccessToken = asyncHandler(async(req,res) => {
   try {
     //ydi koi mobile app  use kr rha h ,to incomingRefreshToken req.body.refreshToken k through milega
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
     if (!incomingRefreshToken) {
         throw new apiError(401, 'Unauthorized request due to invalid incomingRefreshToken');
     }
     //check if refresh token is valid
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id);
     if (!user) {
         throw new apiError(401, "Unauthorized access due to invalid refresh token");
     }
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new apiError(401, "Refresh token is expired or used");
     }
     const { accessToken, newrefreshToken } =await generateAcessTokenAndRefreshToken(user._id);
 
     const options = {
         httpOnly: true, // Prevents client-side access to the cookie
         secure: true,
         sameSite: "Strict", // CSRF protection
         maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (e.g., 1 day)
     }
       return res
           .status(200)
           .cookie("accessToken", accessToken, options)
           .cookie("refreshToken", newrefreshToken, options)
           .json(
               new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Token Refreshed Successfully")
         )
   } catch (error) {
       throw new apiError(401, error?.message||"REFRESH ACCESS TOKEN CODE FAILED");
   }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };







