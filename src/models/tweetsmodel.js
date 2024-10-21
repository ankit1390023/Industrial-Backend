import mongoose from "mongoose";
import {User} from './usermodels.js';
const tweetsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content: {
        type: String,
        required:true,
    }
}, {
    timestamps: true,
})
const Tweets = mongoose.model('Tweets', tweetsSchema);
export { Tweets };