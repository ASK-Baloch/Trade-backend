// middleware/checkApprovalOrAdmin.js
import { User } from "../models/user.model.js";

export const adminVerify=async(req,res,next)=>{
try{
   const userId= req.query.userId
   if(!userId){
       return res.status(400).json({message:"User Id is required"})
   }
   const user = await User.findOne({_id:userId})
   if(!user){
    return res.json({message:"user not found"})
   }

 const admin= user.role
    if (admin ==="admin"){
        return next();
    } else {
        return res.status(403).json({ message: "Access denied: User can't access this page." });
    }
  
}
catch(error)
{
    console.log(error)
}
}
