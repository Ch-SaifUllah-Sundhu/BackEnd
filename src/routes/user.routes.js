import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../utils/multer.middlewarw.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverimages', maxCount: 5 }
    ]),
    registerUser
)

export default router;