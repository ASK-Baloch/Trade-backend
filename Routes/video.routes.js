import { Router } from "express";
import { addcategory, addvideo, deletecategory, deletevideo, getallcategories, getvideobyid, getvideosbycategoryid, updatecategory, updatevideo } from "../controllers/video.controller.js";
import { checkApprovalOrAdmin } from "../middelwares/checkApproval.middleware.js";
import { adminVerify } from ".././middelwares/adminVerify.js"
const router = Router()

// Retrieval routes that require the user to be approved or admin
// The checkApprovalOrAdmin middleware will look for a userId (e.g., via query or body)
router.get('/getcategories', checkApprovalOrAdmin, getallcategories);
router.get('/getvideos/:Id', checkApprovalOrAdmin, getvideosbycategoryid);
router.post('/getvideo', checkApprovalOrAdmin, getvideobyid);

// Video management routes (admin-only)
router.post('/addcategory', adminVerify, addcategory);
router.post('/updatecategory', adminVerify, updatecategory);
router.post('/deletecategory/:id', adminVerify, deletecategory);


router.post('/addvideo', adminVerify, addvideo);
router.post('/updatevideo', adminVerify, updatevideo);
router.post('/deletevideo', adminVerify, deletevideo);

export default router