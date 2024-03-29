import {v2 as cloudinary} from "cloudinary"

//file system
import fs from "fs"


          
cloudinary.config({ 
  cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
  api_key: 'process.env.CLOUDINARY_API_KEY', 
  api_secret: '4process.env.CLOUDINARY_API_SECRET' 
});

const uploadonCloudinary=async(localfilepath) => {
    try{
        if(!localfilepath) return null
        //upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localfilepath ,{
            resource_type :"auto"
        })
        //file has been uploaded successfuly
        console.log("file uploaded sucessfully on cloudinary",response.url);
        return response;

     }catch(error)
     {//file not uploaded means 
        fs.unlinkSync(localfilepath) //removw the locally saved temprory file as the upload operation falied
        return null;

     }

}


export {uploadonCloudinary}