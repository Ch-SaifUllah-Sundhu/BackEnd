import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadResult } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refersh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    //console.log(fullName, email, username, password);

    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadResult(avatarLocalPath);

    let coverImage = "";
    if (coverImageLocalPath) {
        const coverUpload = await uploadResult(coverImageLocalPath);
        coverImage = coverUpload?.url || "";
    }

    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User not created");
    }

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and referseh token
    // send cookie
    // send response

    const {email,username,password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user =  await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
    throw new ApiError(401, "Password incorrect")
    }   

    const  {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken}),
        "User logged in Successfully"
    )
});

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(req.user._id,
    {
        $set: {
            refreshToken: undefined
        }
    },
    {
        new: true
    }
        
)
    
    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

export { registerUser,
    loginUser,
    logoutUser
 };