import { Router } from "express";
import { addcategory, addvideo, deletecategory, deletevideo, getallcategories, getvideobyid, getvideosbycategoryid, updatecategory, updatevideo } from "../controllers/video.controller.js";

const router=Router()
//Categories
router.route('/addcategory').post(addcategory)
router.route('/updatecategory').post(updatecategory)
router.route('/deletecategory/:id').post(deletecategory)
router.route('/getcategories').get(getallcategories)

//Videos

router.route('/addvideo').post(addvideo)
router.route('/updatevideo').post(updatevideo)
router.route('/deletevideo').post(deletevideo)
router.route('/getvideo/:Id').get(getvideosbycategoryid)
router.route('/getvideo').post(getvideobyid)

export default router