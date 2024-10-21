import mongoose from "mongoose";
import { User } from './usermodels'
import { Video } from './postmodels'
const likesSchema = new mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }
}, { timestamps: true });
const Likes = mongoose.model('Likes', likesSchema);
export { Likes };