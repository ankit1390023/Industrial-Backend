import mongoose from "mongoose"
import { Video } from "../models/videomodels.js"
import { Subscription } from "../models/subscription.model.js"
import { Likes } from "../models/likesmodels.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from './../utils/apiResponse.js';
import { apiError } from './../utils/apiError.js';


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats,
    getChannelVideos
}