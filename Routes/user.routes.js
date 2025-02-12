import { Router } from "express";

import { signUpWithReferral } from "../controllers/referral.controller.js";
import { upload } from '../middelwares/multer.middelware.js';
import profileController from '../controllers/profile.controller.js';
import { login, registerUser } from "../controllers/user.controller.js";
import { getWithdrawalHistory, withdrawController } from "../controllers/withdraw.controller.js";


const router = Router();

router.route('/signup').post(upload.single('ss'), registerUser)
router.route('/login').post(login)



// Route for user signup with referral
router.route('/signup/refferal').post(signUpWithReferral)
///profile route
router.route('/profile/:id').get(profileController)


/////withdrawal request
router.route('/withdraw').get(withdrawController)
router.route('/withdrawHistory/:userId').get(getWithdrawalHistory)



export default router

