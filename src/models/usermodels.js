import mongoose from "mongoose";
import bcrypt from "bcrypt"; // For hashing passwords
import jwt from "jsonwebtoken"; // For managing tokens

const userSchema = new mongoose.Schema({
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video' // Assuming watch history refers to a video or similar model
    }],
    username: {
        type: String,
        required: true,
        unique: true, // Ensure unique usernames
    },
    fullname: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        default: '', // Default value if no cover image is provided
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // lowercase: true, // Store email in lowercase
    },
    password: {
        type: String,
        required: true,
        select: false, // Don't return the password by default
    },
    refreshToken: {
        type: String,
        default: null // Default value for refreshToken if not provided
    }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash the password if it has been modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

// Method to add to watch history
userSchema.methods.addToWatchHistory = function (videoId) {
    if (!this.watchHistory.includes(videoId)) {
        this.watchHistory.push(videoId);
    }
};

// Method to remove from watch history
userSchema.methods.removeFromWatchHistory = function (videoId) {
    this.watchHistory = this.watchHistory.filter(id => id.toString() !== videoId.toString());
};

const User = mongoose.model('User', userSchema);
export default User;
