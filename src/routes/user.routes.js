import { Router } from 'express';
const router = Router();

import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, changeCurrentPassword } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJwt } from './../middlewares/auth.middleware.js';


// router.all('/change-password', (req, res) => {
//     return res.status(405).send('Method Not Allowed');
// });

router.route("/register").post(
    upload.fields([  //middleware hi to h,by multer
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJwt, logoutUser);
router.route('/refresh-Token').post(refreshAccessToken)//yha verifyJwt middleware ki koi need nhi h,kyuki iski logic refreshAccessToken ke ander hi kr lia gya h,ho ki verify ka tha
router.route('/profile').get(verifyJwt, getCurrentUser);
router.route('/change-password').post(verifyJwt, changeCurrentPassword);
router.route('/update-account').patch(verifyJwt, updateAccountDetails);
router.route('/avatar').patch(verifyJwt, upload.single("avatar"), updateUserAvatar);//single(),array(),fields(),any() is a multer method : When you expect a single file from a specific field.
router.route('/coverImage').post(verifyJwt, upload.single("coverImage"), updateUserCoverImage);
router.route('/c/:username').get(verifyJwt, getUserChannelProfile);
router.route('/history').get(verifyJwt, getWatchHistory);


export default router;