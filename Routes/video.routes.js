import { Router } from "express";
import { addcategory, addvideo, deletecategory, deletevideo, getallcategories, getvideobyid, getvideosbycategoryid, updatecategory, updatevideo } from "../controllers/video.controller.js";
import { checkApprovalOrAdmin } from "../middelwares/checkApproval.middleware.js";

const router=Router()
router.post('/addcategory', addcategory);
router.post('/updatecategory', updatecategory);
router.post('/deletecategory/:id', deletecategory);

// Retrieval routes that require the user to be approved or admin
// The checkApprovalOrAdmin middleware will look for a userId (e.g., via query or body)
router.get('/getcategories', checkApprovalOrAdmin, getallcategories);
router.get('/getvideo/:Id', checkApprovalOrAdmin, getvideosbycategoryid);
router.post('/getvideo', checkApprovalOrAdmin, getvideobyid);

// Video management routes (admin-only)
router.post('/addvideo', addvideo);
router.post('/updatevideo', updatevideo);
router.post('/deletevideo', deletevideo);

export default router