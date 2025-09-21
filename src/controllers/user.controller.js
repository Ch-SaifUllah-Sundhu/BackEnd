import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadResult } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { Subscription } from '../models/subscription.models.js';
import mongoose from 'mongoose';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

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

    const { email, username, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

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
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken },
                "User logged in Successfully")
        )
});

const logoutUser = asyncHandler(async (req, res) => {
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken?._id) {
            throw new ApiError(401, "Invalid refresh token")
        }
        const user = await User.findById(decodedToken?._id)
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "Access token generated successfully")
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully"))
})

const updateAccount = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    //console.log(fullName, email);
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    return res.status(200).json(
        new ApiResponse(200, "User updated successfully", updatedUser)
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadResult(avatarLocalPath)
    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }
    const coverImage = await uploadResult(coverImageLocalPath)
    if (!coverImage?.url) {
        throw new ApiError(500, "Error while uploading cover image")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    // 🟢 Decide what param you want (channelId or username)
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    // 🟢 Run aggregation
    const user = await User.aggregate([
        // 1. Match the channel
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        // 2. Get all subscribers of this channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        // 3. Get all channels this user has subscribed to
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriptions"
            }
        },
        // 4. Add counts and isSubscribed field
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscriptionsCount: { $size: "$subscriptions" },
                isSubscribed: {
                    $in: [new mongoose.Types.ObjectId(req.user._id), "$subscribers.subscriber"]
                }
            }
        },
        // 5. Keep only selected fields
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscriptionsCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    if (!user || user.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user[0], "Channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) // find the current user
            }
        },
        {
            $lookup: {
                from: "videos",              // join with videos collection
                localField: "watchHistory",  // user's watchHistory array (video IDs)
                foreignField: "_id",         // match with _id in videos
                as: "watchHistory",
                pipeline: [                  // <-- spelling should be pipeline (not pipline)
                    {
                        $lookup: {
                            from: "users",      // join with users collection
                            localField: "owner", // video.owner (the uploader)
                            foreignField: "_id", // match with user._id
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {   // pick only some fields
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {            // take first element of owner array
                            owner: { $arrayElemAt: ["$owner", 0] }
                        }
                    }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, user[0].watchHistory, "User watch history fetched successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
    , changeCurrentPassword
    , getProfile
    , updateAccount
    , updateAvatar
    , updateCoverImage
    , getUserChannelProfile,
    getWatchHistory
};