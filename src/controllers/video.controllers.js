import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"

import ffprobeStatic from 'ffprobe-static';
import { exec } from 'child_process';
import { title } from "process"

const gentrateduration=async(videolocalPath)=>{
    
        let durationInSeconds;
        const ffprobePath = ffprobeStatic.path;
        exec(`${ffprobePath} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videolocalPath}"`, async (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err.message}`);
                return;
            }
        
            durationInSeconds = parseFloat(stdout.trim());
            console.log(`Video duration: ${durationInSeconds} seconds`);
        });
        return durationInSeconds;
        

        
    
}

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videolocalPath=req.files?.videoFile[0]?.path
    const thumbnailPath=req.files?.thumbnail[0]?.path
    
    if(!videolocalPath)
    {
        throw new ApiError("video required")
    }
    if(!thumbnailPath)
    {
        throw new ApiError("thumbnail required")
    }
    
    
    const durationInSeconds=await gentrateduration(videolocalPath)
    
    
   
      
      
    

    const videoFile=await uploadonCloudinary(videolocalPath)
    const thumbnail= await uploadonCloudinary(thumbnailPath)
    if(!videoFile)
    {
        throw new ApiError("video required in cloudinar")
    }
    if(!thumbnail)
    {
        throw new ApiError("thumbnail required cloudinary")
    }

  // console.log(videoFile.url);




    const ownerid=req.user._id
    const video=await Video.create(
        {
            videoFile:videoFile.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration: durationInSeconds,
            views:0,
            isPublished:true,
            owner:ownerid



          
        }
    )
    const createdVideodb=await Video.findById(video._id)
    if(!createdVideodb)
   {
    throw new ApiError(500,"something went roung when creating videodb")
   }

   return res.status(201).json(
    new ApiResponse(200,createdVideodb,"video published succesfully")
   )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const wantedvideo=await Video.findById(videoId)
    if(!wantedvideo)
    {
        throw new ApiError(401,"the vedio with sent id is not avilabel")
    }
   return  res.status(200).json(new ApiResponse(200,wantedvideo,"successful"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const{title,description}=req.body
    
    const thumbnailpath=req.files?.thumbnail[0]?.path
    
   
    const thumbnail= await uploadonCloudinary(thumbnailpath)
    
    if(!thumbnail)
    {
        throw new ApiError("thumbnail required cloudinary")
    }
    const UpdatedVideo= await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail:thumbnail.url,
            
        }},{new:true}
        
        )
        res.status(200).json(new ApiResponse(200,UpdatedVideo,"video detalis updated"))
        

    

    


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deletevid=await Video.findById(videoId,{
        $unset:{
            videoId
            
        }

    },{new:true})

    res.status(200).json(new ApiResponse(200,deletevid,"video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}