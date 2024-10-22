import mongoose, { isValidObjectId } from "mongoose"
import { Tweets } from "../models/tweetsmodel.js"
import { User } from "../models/usermodels.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from './../utils/apiResponse.js';
import { apiError } from './../utils/apiError.js';


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}