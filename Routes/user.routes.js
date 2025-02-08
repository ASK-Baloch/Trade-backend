import { Router } from "express";
import { approveuser, deleteuser, delunverifiedusers, getallusers, login, registeruser, } from "../controllers/user.controller.js";
import { signUpWithReferral } from "../controllers/referral.controller.js";
import { upload } from '../middelwares/multer.middelware.js';
import profileController from '../controllers/profile.controller.js';


const router = Router();

router.route('/signup').post(upload.single('ss'), registeruser)
router.route('/login').post(login)

router.route('/delunverifiedusers').delete(delunverifiedusers)
// router.route('/updateprofile').post(updateprofile)
router.route('/approve').post(approveuser)
router.route('/getallusers').get(getallusers)
router.route('/deleteuser').post(deleteuser)

// Route for user signup with referral
router.route('/signup/refferal').post(signUpWithReferral)
///profile route
router.route('/profile/:id').get(profileController)

export default router