import mongoose from "mongoose";
import User from "./usermodels";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, //cloudinary url
        required: true,
    },
    thumbnail: {
        type: String, //cloudinary url
        required: true,
        default: '',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,       
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default:false,
    },
    views: {
        type: Number,
        default:0,
        
    }
}, { timestamps: true })
videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.models('Video', videoSchema);
export default Video;