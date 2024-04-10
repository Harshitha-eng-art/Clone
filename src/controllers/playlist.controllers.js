import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Check if both name and description are provided
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    try {
        // Access the user ID of the authenticated user
        const ownerId = req.user._id;

        // Create a new playlist document
        const newPlaylist = await Playlist.create({
            name,
            description,
            owner: ownerId
        });

        // Respond with the newly created playlist
        res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that occur during the creation process
        throw new ApiError(500, "Failed to create playlist");
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        // Find playlists owned by the specified user
        const userPlaylists = await Playlist.find({ owner: userId });

        // Check if playlists are found
        if (!userPlaylists || userPlaylists.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "User playlists not found"));
        }

        // Respond with the found playlists
        res.status(200).json(new ApiResponse(200, userPlaylists, "User playlists retrieved successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId);

        // Check if the playlist is found
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        // Respond with the found playlist
        res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    try {
        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId);

        // Check if the playlist is found
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        // Check if the video already exists in the playlist
        if (playlist.videos.includes(videoId)) {
            return res.status(400).json(new ApiResponse(400, null, "Video already exists in the playlist"));
        }

        // Add the video to the playlist's videos array
        playlist.videos.push(videoId);

        // Save the updated playlist
        await playlist.save();

        // Respond with the updated playlist
        res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    try {
        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId);

        // Check if the playlist is found
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        // Check if the video exists in the playlist
        const videoIndex = playlist.videos.indexOf(videoId);
        if (videoIndex === -1) {
            return res.status(400).json(new ApiResponse(400, null, "Video not found in the playlist"));
        }

        // Remove the video from the playlist's videos array
        playlist.videos.splice(videoIndex, 1);

        // Save the updated playlist
        await playlist.save();

        // Respond with the updated playlist
        res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId);

        // Check if the playlist exists
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        // Delete the playlist from the database
        await Playlist.findByIdAndDelete(playlistId);

        // Respond with a success message
        res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    try {
        // Find the playlist by its ID
        let playlist = await Playlist.findById(playlistId);

        // Check if the playlist exists
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        // Update the playlist's name and description
        playlist.name = name;
        playlist.description = description;

        // Save the updated playlist to the database
        playlist = await playlist.save();

        // Respond with the updated playlist
        res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
    } catch (error) {
        console.error(error);
        // Handle any errors that might occur during the process
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}