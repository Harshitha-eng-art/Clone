// import { Router} from "express";
// import { registerUser} from "../controllers/user.controllers.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router=Router()



// router.route("/register").post(
//     upload.fields([
//      {
//         name:"avatar",
//         maxCount:1
//      },
//      {
//         name:"coverImage",
//         maxCount:1
//      }
//     ]),
//     registerUser)


// export default router

import { Router} from "express";
import { registerUser} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser } from "../controllers/user.controllers.js";
import { logoutUser } from "../controllers/user.controllers.js";
import { changeCurrentPassword } from "../controllers/user.controllers.js";
import {getCurrentUser} from "../controllers/user.controllers.js";
import {updateAccountDetails} from "../controllers/user.controllers.js";
import {  updateUseravatar} from "../controllers/user.controllers.js";
import {updateUserCoverImage } from "../controllers/user.controllers.js";
import { getUserChannelProfile} from "../controllers/user.controllers.js";
import { getWatchHistory } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { refreshAccessToken } from "../controllers/user.controllers.js";





const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
        console.log("Files uploaded:", req.files); // Inspect req.files object
        next(); // Pass control to the next middleware
    },
    registerUser
);




router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUseravatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router;


