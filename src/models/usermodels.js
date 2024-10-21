import mongoose from "mongoose";
import bcrypt, { genSalt } from "bcrypt"; // For hashing passwords
import jwt from "jsonwebtoken"; // For managing tokens

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure unique usernames
        lowercase: true,
        trim: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,  //cloudinary pr url store hoga
        required: true,
    },
    coverImage: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // lowercase: true, // Store email in lowercase
    },
    password: {
        type: String,
        required: [true, 'Password  is  required'],
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video' // Assuming watch history refers to a video or similar model
    }],
    refreshToken: {
        type: String,
    }
}, { timestamps: true });
// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash the password if it has been modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
//custom Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
// Method to generate JWT
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};
userSchema.methods.genAccessToken =async function () {
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullName,
    }

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

}
userSchema.methods.genRefreshToken = async function () {
    const payload = {
        _id: this._id,
    }
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}
const User = mongoose.model('User', userSchema);
export { User };