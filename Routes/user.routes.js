import { Router } from "express";
// import { approveuser, deleteuser, delunverifiedusers, getallusers, login, registeruser, getallusersController, } from "../controllers/admin.controller.js";
import { getAdminWithdrawalRequests, approveWithdrawalRequest, approveUser, delUnverifiedUsers, getAllUsers, deleteUser, getAllReferrals, getUnverifiedUsers, getVerifiedUsers } from "../controllers/admin.controller.js";
import { signUpWithReferral } from "../controllers/referral.controller.js";
import { upload } from '../middelwares/multer.middelware.js';
import profileController from '../controllers/profile.controller.js';
import {withdrawController} from "../controllers/withdraw.controller.js"
import {registeruser,login} from "../controllers/user.controller.js"
const router = Router();

router.route('/signup').post(upload.single('ss'), registeruser)
router.route('/login').post(login)

router.route('/delunverifiedusers').delete(delUnverifiedUsers)
// router.route('/updateprofile').post(updateprofile)
router.route('/approve').post(approveUser)
router.route('/deleteuser/:id').post(deleteUser)

///route for getting all users details
router.route('/getallusers').get(getAllUsers)
router.route('/getallrefferals').get(getAllReferrals)
router.route('/getUnverifiedUsers').get(getUnverifiedUsers)
router.route('/getVerifiedUsers').get(getVerifiedUsers)

// Route for user signup with referral
router.route('/signup/refferal').post(signUpWithReferral)
///profile route
router.route('/profile/:id').get(profileController)
//withdrawal request from user
router.route('/withdraw').post(withdrawController)

//////withdrawal request to admin
router.route('/getAdminWithdrawalRequests').get(getAdminWithdrawalRequests)
router.route('/approveWithdrawalRequest/:id').get(approveWithdrawalRequest)


export default router