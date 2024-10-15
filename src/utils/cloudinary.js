import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY, // Make sure to have these values in your .env file
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload file to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log('cloudinary UploadResponse', uploadResponse);  // Successfully uploaded
        fs.unlinkSync(localFilePath); // Remove the file from local storage
        return uploadResponse;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the file from local storage
            console.log("File removed from local server due to upload failure.");
        }
        return null;
    }
};
export { uploadOnCloudinary };






























