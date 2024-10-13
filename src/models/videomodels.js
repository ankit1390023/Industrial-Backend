import User from "./usermodels";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true,
        default: '',
        unique:true,
    },
    thumbnail: {
        type: String,
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
        default: '',
       
    },
    description: {
        type: String,
        required: true,
        default: '',
    },
    duration: {
        type: Number,
        required: true,
        default: '',
    },
    isPublished: {
        type: Boolean,
        default:false,
    },
    views: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'User',
            },
            timeStamp: {
                type: Date,
                default:Date.now,
            }
        }
    ],
},{ timestamps: true })
const Video = mongoose.models('Video', videoSchema);
export default Video;