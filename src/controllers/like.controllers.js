import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id; // Assuming the user ID is available in req.user
          // Check if the user has already liked the video
          const existinglike = await Like.findOne({ video: videoId,likedBy: userId });
    
          if (existinglike) {
      
              await Like.findByIdAndDelete(existinglike._id); // Remove the existing subscription
              res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
          } else {
              
              
              const like = await Like.create({
                  video:videoId,
                  likedBy:userId
              });
      
              if (!like) {
                  throw new ApiError(500, "Failed to like");
              }
      
              res.status(200).json(new ApiResponse(200, like, "liked successfully"));
          }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming the user ID is available in req.user

    try {
        // Check if the user has already liked the comment
        const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

        if (existingLike) {
            // If the user has already liked the comment, remove the like
            await Like.findByIdAndDelete(existingLike._id);
            res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
        } else {
            // If the user has not liked the comment, add a new like
            const like = await Like.create({ comment: commentId ,likedBy:userId});

            if (!like) {
                throw new ApiError(500, "Failed to like the comment");
            }

            res.status(200).json(new ApiResponse(200, like, "Liked successfully"));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id; // Assuming the user ID is available in req.user

    try {
        // Check if the user has already liked the tweet
        const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

        if (existingLike) {
            // If the user has already liked the tweet, remove the like
            await Like.findByIdAndDelete(existingLike._id);
            res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
        } else {
            // If the user has not liked the tweet, add a new like
            const like = await Like.create({ tweet: tweetId,likedBy:userId});

            if (!like) {
                throw new ApiError(500, "Failed to like the tweet");
            }

            res.status(200).json(new ApiResponse(200, like, "Liked successfully"));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Assuming the user ID is available in req.user

    try {
        // Find all likes associated with the user
        const userLikes = await Like.find({likedBy: userId ,video: { $ne: null }});

        // Extract the video IDs from the likes
        const videoIds = userLikes.map(like => like.video);

        
       
        // Respond with the list of liked videos
        res.status(200).json(new ApiResponse(200, videoIds, "Liked videos retrieved successfully"));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}