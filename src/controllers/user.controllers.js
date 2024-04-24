import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {upload} from "../middlewares/multer.middlewares.js"
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';



const generateAccessAndRefreshTokens=async(userId) =>
{
    try{
        //console.log("abc")
       const user= await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()
      
      user.refreshToken=refreshToken
      await user.save({validateBeforeSave: false})
    return {accessToken,refreshToken}
      

    }catch(error)
    {
        throw new ApiError(500,"Something went roung while refreshing token" )
    }
}

const registerUser = asyncHandler(async(req,res)=>
{
    //get user details from frontend( from postman here)
    //validation-not empty
    //check if user alredy exit :username ,email
    //check for images ,chehk for avatar
    //upload then to cloudinary,avatar
    //create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return  response

   const { fullname,email,username,password} =req.body
   console.log("email:",email);

   if([fullname,email,username,password].some((field)=>
   field?.trim() === ""
   ))
   {
    throw new ApiError(400,"All fields are required")
   }
    

   const existedUser= await User.findOne({
    $or: [{username} ,{email}]
   })

   if(existedUser)
   {
    throw new ApiError(409,"username already exist")
   }
   //console.log(req.files);
   const avatarLocalPath=req.files?.avatar[0]?.path ;  // we are taking the path that multer has uploaded for some destination in server
   //const coverIamgepath=req.files?.coverImage[0]?.path;


   let coverImagepath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0)
   {
    coverImagepath=req.files.coverImage[0]?.path
   }
   //console.log(avatarLocalPath);
   if(!avatarLocalPath)
   {
    throw new ApiError(400,"Avtar is required")
   }

   const avatar=await uploadonCloudinary(avatarLocalPath)
   const coverImage=await uploadonCloudinary(coverImagepath)

   if(!avatar)
   {
    throw new ApiError(400,"avatar file is required")
   }
    
    const user=await User.create(
    {
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    }
   )
   const createdUser= await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser)
   {
    throw new ApiError(500,"something went roung when creating user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User Register succesfully")
   )

})

const loginUser = asyncHandler(async(req,res) =>
{
    //req body ->data
    //username or email
    //find the user
    //if user is present check password
    //access and refresh token 
    //send cookie 
    console.log(req.body)
    const { email,username,password } = req.body
    console.log(username)
    if(!username && !email)
    {
        throw new  ApiError (400,"username or email required")
    }
   const user= await User.findOne({
        $or: [{username,email}]
    })
    if(!user)
    {
        throw new ApiError(404,"user not exit")
    }
   const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid)
   {
    throw new ApiError(401,"invalid Password")
   }
   console.log(user._id)
   const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
 //select is for selecting which all field u don'nt want
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    //cokkie
    const options =
    {
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken

            },
            
                "Userlogged in Successfully"
            
        )
    )
})

const logoutUser=asyncHandler(async(req,res) =>
{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options =
    {
        httpOnly:true,
        secure:true
    }
    const { accessToken, refreshToken } = req.cookies;

    return res.status(200).clearCookie("accessToken",accessToken,options).clearCookie("refreshToken",refreshToken,options ).json(new ApiResponse(200,
        {},"Userlogged Out"))
}
)

const refreshAccessToken=asyncHandler(async(req,res) =>
{
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"unauthorizes request")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )
       const user= User.findById(decodedToken?._id)
       if(!user)
       {
        throw new ApiError(401,"Invalid refresh token")
       }
       if(incomingRefreshToken !== user?.refreshToken)
       {
        throw new ApiError(401,"Refresh token is expired or used")
       }
    
       const options=
       {
        httpOnly:true,
        secure:true
       }
       const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
       return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newrefreshToken,options).json(
        new ApiResponse(
            200,
            {
                accessToken,refreshToken:newrefreshToken},"access Token Refreshed"
            
        )
       )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
        
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>
{
    const{oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(401,"Invalid OldPassword")
    }
    user.password=newPassword
    await user.save({ validateBeforeSave: true })
    res.status(200).json(new ApiResponse(
        200,{},"Password Changed Successsfully"
    ))
})



const getCurrentUser = asyncHandler(async (req, res) => {
    // Send the current user as a response
    res.status(200).json({
        user: req.user,
        message: "Current user fetched successfully"
    });
});

const updateAccountDetails=asyncHandler(async(req,res )=>
{
    const{ fullname ,email}=req.body
    if(!fullname || !email)
    {
        throw new ApiError (401,"fullname and email required")
    }
    User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname,
            email:email
        }
    },{new:true}
        
        ).select("-password")
        res.status(200).json(new ApiResponse(200,req.user,"Account detalis updated"))
})

const updateUseravatar=asyncHandler(async(req,res) =>
{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"avatar file missing")
    }
    const avatar= await uploadonCloudinary (avatarLocalPath)
    if(!avatar.url)
    {
      throw new ApiError(400,"error while uploading")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },{new:true}).select("-password")
        res.status(200).json(new ApiResponse(200,user,"avatar update successfully"))

})


const updateUserCoverImage=asyncHandler(async(req,res) =>
{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"coverIamge file missing")
    }
    const coverImage= await uploadonCloudinary (coverImageLocalPath)
    if(!coverImage.url)
    {
      throw new ApiError(400,"error while uploading")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:coverImage.url
            }
        },
        {new:true}
        ).select("-password")
        res.status(200).json(new ApiResponse(200,user,"coverImage update successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1, // Corrected typo here
                email: 1
            }
        }
    ]);
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});


const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})




export {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     getCurrentUser,
     updateAccountDetails,
     updateUseravatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory,
     changeCurrentPassword
     }