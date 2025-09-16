import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { uploadResult } from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js';
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate user details - not empty
    // check if user already exists
    // check for images, check for avatar
    // upload image to cloudinary , avatar
    // create user in db
    // remove password from response and refreshToken
    // check for user created or not
    // return response
    const {fullName,email,username,password} = req.body
    console.log(fullName,email,username,password);
    if(!fullName || !email || !username || !password){
        throw new ApiError(400,"All fields are required")
    }
    const existedUser = User.findOne({email}).then((user)=>{
        if(user){
            throw new ApiError(400,"User already exists")
        }
    })
    if(existedUser){
        throw new ApiError(409, "user with email or username")
        
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Ávatar file is required")
    }

    const avatar = await uploadResult(avatarLocalPath)
    const coverImages = await uploadResult(coverimageLocalPath);

    if(!avatar?.url){
        throw new ApiError(500,"Error while uploading avatar")
    }
    
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImages: coverImages?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
            throw new ApiError(500,"User not created")
    }

    return res.this.status(201).json(
        new ApiResponse(201,"User registered successfully",createdUser)
    )

    
});

export { registerUser };