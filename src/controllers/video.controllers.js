import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import {upload} from "../middlewares/multer.middlewares.js"

import ffprobeStatic from 'ffprobe-static';
import { exec } from 'child_process';
import { title } from "process"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Aggregation pipeline stages
    const pipeline = [];

    // Match stage to filter based on query conditions
    const matchStage = {};
    if (query) {
        matchStage.title = { $regex: query, $options: "i" };
    }
    if (userId) {
        matchStage.userId = userId;
    }
    pipeline.push({ $match: matchStage });

    // Sort stage
    if (sortBy && sortType) {
        const sortField = sortBy === 'title' ? sortBy : 'createdAt'; // Adjust sorting fields as needed
        const sortOrder = sortType === 'asc' ? 1 : -1;
        pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    try {
        // Execute aggregation query
        const result = await Video.aggregate(pipeline);

        // Paginate the results
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResult = result.slice(startIndex, endIndex);

        // Sending response with fetched videos
        res.json({ success: true, videos: paginatedResult });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

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
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    // Retrieve the path of the thumbnail file from the request
    console.log(req.files);
    const thumbnailPath = req.file?.path;

    console.log(thumbnailPath)

    if (!thumbnailPath) {
        // If thumbnailPath is not available, return an error response
        return res.status(400).json({ success: false, message: "Thumbnail file path is required" });
    }

    try {
        // Upload the thumbnail to Cloudinary
        const thumbnail = await uploadonCloudinary(thumbnailPath);
        
        if (!thumbnail || !thumbnail.url) {
            // If thumbnail upload failed, throw an error
            throw new Error("Thumbnail upload failed");
        }

        // Update video details in the database
        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url,
            }
        }, { new: true });

        if (!updatedVideo) {
            // If video was not found, return a 404 error response
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // Respond with success message and updated video object
        res.status(200).json({ success: true, message: "Video details updated", video: updatedVideo });
    } catch (error) {
        // Handle errors
        console.error("Error updating video:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


const deleteVideo = asyncHandler(async (req, res) => {
    // Extract the video ID from the request parameters
    const { videoId } = req.params;

    try {
        // Find the video by its ID and delete it
        const deletedVideo = await Video.findOneAndDelete({ _id: videoId });

        // Respond with a success message and the deleted video
        res.status(200).json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});

// Controller to toggle the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    try {
        // Find the video by its ID
        const video = await Video.findById( videoId );

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (video.isPublished) {
            // If video is already published, unpublish it
            video.isPublished = false;
            await video.save();
            res.status(200).json({ success: true, message: "Video unpublished successfully", video });
        } else {
            // If video is not published, publish it
            video.isPublished = true;
            
            await video.save();
            res.status(200).json({ success: true, message: "Video published successfully", video });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}