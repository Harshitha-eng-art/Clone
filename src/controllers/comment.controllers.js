import mongoose from "mongoose"
import {Comment} from "../models/comments.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"




const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        
        // Aggregate comments for the specified video with pagination
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            allowDiskUse: true // Optional: Allow disk use for large datasets
        };

        const aggregation = Comment.aggregate([
            { $match: { video:new mongoose.Types.ObjectId(videoId) } },
            { $sort: { createdAt: -1 } }, // Sort comments by creation date in descending order
        ]);

        const result = await Comment.aggregatePaginate(aggregation, options);

        // Respond with paginated comments
        res.status(200).json(new ApiResponse(200, result.docs, 'Comments retrieved successfully'));
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, null, 'Internal Server Error'));
    }
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body
    const {videoId}=req.params
    if (!videoId || !content) {
        return res.status(400).json({ success: false, message: "Video ID and content are required" });
    }
    
  try {
      const comment=await Comment.create(
          {
              video:videoId,
              content:content,
              owner:req.user._id
          }
      )
      res.status(200).json(new ApiResponse(200,comment,"added comment succesfully"))
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500,{},"internal server error"))
  }
})

const updateComment = asyncHandler(async (req, res) => {
    // Extract the comment ID from the request parameters
    const { commentId } = req.params;
     console.log(commentId)
    try {
        // Retrieve the updated content from the request body
        const { content } = req.body;

        // Check if the content is provided
        if (!content) {
            // Throw an ApiError if content is not provided
            throw new ApiError(400, "Content is required for updating the comment");
        }
        
        // Find the comment by ID and update its content
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { content },
            { new: true } // Return the updated comment after update
        );
     console.log(updateComment)
        // Check if the comment exists
        if (!updatedComment) {
            // Throw an ApiError if the comment is not found
            throw new ApiError(404, "Comment not found");
        }

        // Respond with the updated comment using ApiResponse
        res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
    } catch (error) {
        console.error(error);
        // Handle any unexpected errors and respond with an appropriate ApiResponse
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


const deleteComment = asyncHandler(async (req, res) => {
    // Extract the comment ID from the request parameters
    const { commentId } = req.params;

    try {
        // Find the comment by its ID and delete it
        const deletedComment = await Comment.findOneAndDelete({ _id: commentId });

        // Respond with a success message and the deleted comment
        res.status(200).json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }