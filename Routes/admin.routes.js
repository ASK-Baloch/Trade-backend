import { Router } from "express";
import { login } from "../controllers/user.controller.js";
import { approveUser, delUnverifiedUsers , deleteUser , getAllUsers } from "../controllers/admin.controller.js";


const router = Router();

router.route('/login').post(login)

router.route('/approve').post(approveUser)
router.route('/getallusers').get(getAllUsers)
router.route('/deleteuser').post(deleteUser)
router.route('/delunverifiedusers').delete(delUnverifiedUsers)

export default router