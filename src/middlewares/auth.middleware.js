import User from '../models/usermodels.js';
import { apiError } from '../utils/apiError.js';
import asyncHandler from './../utils/asyncHandler.js';
import jwt from "jsonwebtoken"; // For managing tokens


export const verifyJwt = asyncHandler(async (req, res,next) => {
    try {
        const token = req.cookies?.accessToken || req.headers['authorization']?.replace("Bearer", "");
        if (!token) {
            throw new apiError(401, "Access denied no token provided");
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded?._id).select('-password -refreshToken');
        if (!user) {
            throw new apiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Access Token");
    }
});
