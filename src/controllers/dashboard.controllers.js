import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const channelId = req.user._id; // Assuming the channel ID is available in req.user
        console.log(channelId)
        // Calculate total video views
        const totalVideoViews = await Video.aggregate([
            { $match: { owner: channelId } },
            { $group: { _id: "$owner", totalviews: { $sum: "$views" } } }
        ]);

        // Count total subscribers
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

        // Count total videos
        const totalVideos = await Video.countDocuments({ owner: channelId });

        
        
        // Construct the response object
        const channelStats = {
            totalVideoViews: totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
            totalSubscribers,
            totalVideos
            
        };

        // Respond with the channel statistics
        res.status(200).json(new ApiResponse(200, channelStats, "Channel statistics retrieved successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id; // Assuming the channel ID is available in req.user
        console.log(channelId)

    // TODO: Query the database to find all videos uploaded by the specified channel
    const channelVideos = await Video.find({ owner: channelId });
    console.log(channelVideos);

    if (!channelVideos) {
        return res.status(404).json({ message: "No videos found for the specified channel" });
    }

    res.status(200).json({ videos: channelVideos });
});


export {
    getChannelStats, 
    getChannelVideos
    }