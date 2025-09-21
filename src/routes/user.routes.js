import { Router } from "express";
import {
    loginUser, logoutUser, registerUser,
    refreshAccessToken, changeCurrentPassword,
    getProfile, updateAccount, updateAvatar,
    updateCoverImage, getUserChannelProfile, getWatchHistory
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"; // For file uploads
import { verifyJWT } from "../middlewares/auth.middlewae.js"; // Auth middleware

const router = Router();

// ---------------- AUTH ROUTES ----------------
router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

// ---------------- USER ROUTES ----------------
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/getProfile").get(verifyJWT, getProfile);
router.route("/updateAccount").patch(verifyJWT, updateAccount);

// ---------------- UPLOAD ROUTES ----------------
router.route("/Avatar").patch(verifyJWT, upload.single('avatar'), updateAvatar);
router.route("/CoverImage").patch(verifyJWT, upload.single('coverImage'), updateCoverImage);

// ---------------- CHANNEL & HISTORY ----------------
router.route("/c/:channelId").get(verifyJWT, getUserChannelProfile);
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;
