import mongoose from 'mongoose';
import {User} from './usermodels.js';
import { Video } from './videomodels.js'
const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true })
const Playlist = mongoose.model('Playlist', playlistSchema);
export { Playlist };
