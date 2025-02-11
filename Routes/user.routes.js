import { Router } from "express";

import { signUpWithReferral } from "../controllers/referral.controller.js";
import { upload } from '../middelwares/multer.middelware.js';
import profileController from '../controllers/profile.controller.js';
<<<<<<< HEAD
import { login, registeruser } from "../controllers/user.controller.js";
=======
import { login, registerUser } from "../controllers/user.controller.js";
>>>>>>> 45cec5d6fde9f1da72bd85a0023504d8fce8db0b
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


<<<<<<< HEAD
export default router
=======
export default router
>>>>>>> 45cec5d6fde9f1da72bd85a0023504d8fce8db0b
