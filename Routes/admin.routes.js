import { Router } from "express";
import { login } from "../controllers/user.controller.js";
import { approveUser, delUnverifiedUsers, getAdminWithdrawalRequests, approveWithdrawalRequest , deleteUser , getAllUsers, getUserReferralDetails } from "../controllers/admin.controller.js";


const router = Router();
// router.route('/updateprofile').post(updateprofile)
router.route('/approve').post(approveUser)
router.route('/deleteuser').post(deleteUser)
router.route('/getallusers').get(getAllUsers)
router.route('/getUserReferralDetail/:userId').get(getUserReferralDetails)
router.route('/getAdminWithdrawalRequests').get(getAdminWithdrawalRequests)
router.route('/approveWithdrawalRequest').post(approveWithdrawalRequest)
router.route('/delunverifiedusers').delete(delUnverifiedUsers)

export default router