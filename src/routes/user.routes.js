import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword , getProfile, updateAccount, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewae.js";
import { get } from "mongoose";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/Logout").post( verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post( verifyJWT, changeCurrentPassword)
router.route("/getProfile").get( verifyJWT, getProfile)
router.route("/updateAccount").patch( verifyJWT, updateAccount)
router.route("/Avatar").patch( verifyJWT, upload.single('avatar'), updateAvatar)
router.route("/CoverImage").patch( verifyJWT, upload.single('coverImage'), updateCoverImage)
router.route("/c/:username").get( verifyJWT, getUserChannelProfile)
router.route("/watchHistory").get( verifyJWT, getWatchHistory)



export default router;