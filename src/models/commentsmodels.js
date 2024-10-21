import mongoose from "mongoose";
import {User} from './usermodels.js';
import { Video } from './videomodels.js';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });
CommentSchema.plugin(mongooseAggregatePaginate);
const Comment = mongoose.model('Comment', CommentSchema);
export { Comment };