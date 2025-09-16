import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const uploadResult = async (filePath) => {
    try {
        if(!localFilePath) throw new Error('File path is required');
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type: 'auto',
        })
        console.log("file is uploaded to cloudinary",response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Error while uploading file to cloudinary",error);
        throw error;
    }
}