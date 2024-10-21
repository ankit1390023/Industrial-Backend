import asyncHandler from './../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/usermodels.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from './../utils/apiResponse.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mongoose } from 'mongoose';




const generateAcessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(user)
        const accessToken = await user.genAccessToken();
        const refreshToken = await user.genRefreshToken();
        // console.log("genAccessToken",accessToken);
        // console.log("genRefreshToken",refreshToken);
        user.refreshToken = refreshToken; //yha hum ,user database me refreshToken save kra rhe h
        console.log("user.refreshToken", user.refreshToken)
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

    const { email, username, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: email }, { username: username }]
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
        // sameSite: "Strict", // CSRF protection
        // maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (e.g., 1 day)
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
const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
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
const refreshAccessToken = asyncHandler(async (req, res) => {
    // console.log(req.cookies.refreshToken)

    //ydi koi mobile app  use kr rha h ,to incomingRefreshToken req.body.refreshToken k through milega
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError(401, 'Unauthorized request due to invalid incomingRefreshToken');
    }
    //check if refresh token is valid
    // console.log(process.env.REFRESH_TOKEN_SECRET);
    // console.log("incomingRefreshToken",incomingRefreshToken);
    // console.log("refresh acess token", process.env.REFRESH_TOKEN_RECRET)

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new apiError(401, "Unauthorized access due to invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new apiError(401, "Refresh token is expired or used");
    }
    const { accessToken, refreshToken } = await generateAcessTokenAndRefreshToken(user._id);
    console.log("received refreshToken", refreshToken);
    const options = {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: true,
        // sameSite: "Strict", // CSRF protection
        // maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (e.g., 1 day)
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken: refreshToken }, "Token Refreshed Successfully")
        )

})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new apiError(401, "Old password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
})
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User data fetched successfully"));

})
const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;
    console.log(fullName, email);
    if (!fullName || !email) {
        throw new apiError(400, "All fields are required");
    }
    console.log(req.user?._id);
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName, //direct fullName bhi send kr skte h
                email: email,
            },
        }, { new: true }
    ).select('-password');
    console.log(user);
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User Account Details Updated Successfully")
        )
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    console.log(req.file);
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new apiError(401, "Error while Uploading avatar on Cloudinary");
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url,
        }
    }, { new: true }).select('-password');
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User Avatar Upadated Successfully")
        )
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    console.log(req.file);
    const coverImageLocalPath = req.file?.path; //it is from multer
    console.log("cover Image Local Path is --",coverImageLocalPath);
    if (!coverImageLocalPath) {
        throw new apiError(400, "CoverImage File Is Missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new apiError(401, "Error while uploading coverImage file on cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            }
        },
        { new: true }
    ).select('-password');
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User CoverImage Updated Succesfully")
        )
})
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    console.log(username);
        if (!username?.trim()) {
            throw new apiError(400, "username is missing");
        }
        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"//channel ke kitne subscriber h
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subcriber",
                    as: "subscribedTo"//user i.e subscriber ne kitne ko subscibe kiya h
                }
            },
            {
                $addFields: {
                    subsciberCount: {
                        $size: "$subscribers"
                    }, channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribedTo.subscriber"] },
                            then: true,
                            else: false,
                        }
                    }
                }
            }
        ])
    console.log(channel)
        if (!channel?.length) {
            throw new apiError(404, "User Not Found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, channel[0], "User channel fetched successfully")
            )
})
const getWatchHistory = asyncHandler(async (req, res) => {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        if (!user || user.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "User not found or no watch history available"));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, user[0]?.watchHistory, "User watch history fetched successfully")
            );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};







