// import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
// import { Subscription } from "../models/subscription.models.js"
// import {ApiError} from "../utils/ApiError.js"
// import {ApiResponse} from "../utils/ApiResponse.js"
// import {asyncHandler} from "../utils/asyncHandler.js"












// const toggleSubscription = asyncHandler(async (req, res) => {
//     const {channelId} = req.params
//     // TODO: toggle subscription
    
// })

//  controller to return subscriber list of a channel
// const getUserChannelSubscribers = asyncHandler(async (req, res) => {
//     const {channelId} = req.params
    
// })

// // controller to return channel list to which user has subscribed
// const getSubscribedChannels = asyncHandler(async (req, res) => {
//     const { subscriberId } = req.params
// })

// export {
//     toggleSubscription,
//     getUserChannelSubscribers,
//     getSubscribedChannels
// }

import { Subscription } from '../models/subscription.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Video } from '../models/video.models.js';
import {asyncHandler} from "../utils/asyncHandler.js"


// Controller to return the subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;

    // Find subscriptions for the specified channel
    const subscriptions = await Subscription.find({ channel: subscriberId }).select('subscriber');

    if (!subscriptions || subscriptions.length === 0) {
        // If no subscriptions found, respond with appropriate message
        return res.status(404).json(new ApiResponse(404, null, "No subscribers found for the channel"));
    }

    // Extract subscriber details from subscriptions
    const subscribers = subscriptions.map(subscription => subscription.subscriber);
    console.log(subscribers)
    // Respond with the list of subscribers for the channel
    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers retrieved successfully"));
});
// Controller to get the subscribed channels for a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Assuming the user ID is available in req.user

    // Find subscriptions for the specified user
    const subscriptions = await Subscription.find({ subscriber: userId }).select('channel');
 //console.log(subscriptions)
    if (!subscriptions || subscriptions.length === 0) {
        // If no subscriptions found, respond with appropriate message
        return res.status(404).json(new ApiResponse(404, null, "No subscribed channels found for the user"));
    }

    // Extract unique channel IDs from subscriptions
    const channelIds = subscriptions.map(subscription => subscription.channel);
    console.log(channelIds)
    
    // Respond with the list of subscribed channels for the user
    res.status(200).json(new ApiResponse(200, channelIds, "Subscribed channels retrieved successfully"));
})

    
    
    // Controller to toggle subscription status
    const toggleSubscription = asyncHandler(async (req, res) => {
        const userId = req.user._id; // Assuming the user ID is available in req.user
        const {channelId }= req.params;
    
        // Check if the user is already subscribed to the channel
        const existingSubscription = await Subscription.findOne({ channel: channelId, subscriber: userId });
    
        if (existingSubscription) {
            // If user is already subscribed, unsubscribe them
            await Subscription.findByIdAndDelete(existingSubscription._id); // Remove the existing subscription
            res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
        } else {
            // If user is not subscribed, subscribe them
            
            const newSubscription = await Subscription.create({
                channel: channelId,
                subscriber: userId
            });
    
            if (!newSubscription) {
                throw new ApiError(500, "Failed to create subscription");
            }
    
            res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
        }
    });
    

    

export {toggleSubscription ,getUserChannelSubscribers,getSubscribedChannels};
