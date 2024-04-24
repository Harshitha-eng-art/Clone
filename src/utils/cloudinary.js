// import {v2 as cloudinary} from "cloudinary"

// //file system
// import fs from "fs"


          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

// const uploadonCloudinary=async(localfilepath) => {
//     try{
//         if(!localfilepath) return null
//         //upload the file to cloudinary
//         const response = await cloudinary.uploader.upload(localfilepath ,{
//             resource_type :"auto"
//         })
//         //file has been uploaded successfuly
//         console.log("file uploaded sucessfully on cloudinary",response.url);
//         return response;

//      }catch(error)
//      {//file not uploaded means 
//         fs.unlinkSync(localfilepath) //removw the locally saved temprory file as the upload operation falied
//         return null;

//      }

// }


// export { uploadonCloudinary }




import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadonCloudinary = async (localFilePath) => {
    try {
        // Check if local file path is provided
        if (!localFilePath) {
            throw new Error("Local file path is required");
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log("File uploaded successfully on Cloudinary:", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // Handle upload error
        console.error("Error uploading file to Cloudinary:", error.message);
    }

        // Remove the locally saved temporary file if the upload operation failed
        if (localFilePath) {
            try {
                fs.unlinkSync(localFilePath);
                console.log("Local temporary file removed:", localFilePath);
            } catch (unlinkError) {
                console.error("Error removing local temporary file:", unlinkError.message);
            }
        }

        return null;
    
};

export { uploadonCloudinary };
