import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // Extract user ID and content from the request
    const userId = req.user?._id;
    const { content } = req.body;
    if (!userId || !content) {
        throw new ApiError(400, "User ID and content are required");
    }

    try {
        // Create a new tweet
        const newTweet = await Tweet.create({
            content: content,
            owner: userId
        });

        // Check if the tweet was successfully created
        if (!newTweet) {
            throw new ApiError(500, "Failed to create tweet");
        }

        // Respond with a 201 status code and the newly created tweet
        res.status(201).json(new ApiResponse(201, newTweet, "Tweet successfully created"));
    } catch (error) {
        // Handle any errors and respond with an appropriate status code
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


const getUserTweets = asyncHandler(async (req, res) => {
    // Extract the user ID from the request parameters
    const { userId } = req.params;

    try {
        // Find tweets owned by the specified user
        const userTweets = await Tweet.find({ owner: userId }).select('content');

        // Check if any tweets were found for the user
        if (!userTweets || userTweets.length === 0) {
            // Respond with a 404 status code and a message indicating no tweets found
            return res.status(404).json({ message: "User tweets not found" });
        }

        // Respond with the user's tweets
        res.status(200).json(new ApiResponse(200, userTweets, "Got all user tweets"));
    } catch (error) {
        // Handle any unexpected errors and respond with a 500 status code
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
     
    try {
        const { content } = req.body;
        if (!content) {
          throw new ApiError(400, "Content is required for updating the tweet");
        }
    
        const updatedtweet = await Tweet.findByIdAndUpdate(
            req.params.tweetId,
            { content },
            { new: true } 
        );
     //console.log(updatetweet)
        
        if (!updatedtweet) {
           
            throw new ApiError(404, "tweet not found");
        }
        res.status(200).json(new ApiResponse(200, updatedtweet, "tweet updated successfully"));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    try {
        // Find the comment by its ID and delete it
        const deletedtweet = await Tweet.findOneAndDelete({ _id: tweetId });

        // Respond with a success message and the deleted comment
        res.status(200).json(new ApiResponse(200, deletedtweet, "tweet deleted successfully"));
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}