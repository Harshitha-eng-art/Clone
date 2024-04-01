import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {upload} from "../middlewares/multer.middleware.js"

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



export {
     registerUser,
     }