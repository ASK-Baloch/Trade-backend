import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import cloudinary from '../middelwares/cloudinary.middelware.js'
import { Referral } from '../models/refer.model.js';
import { handleReferralCommission } from "./referral.controller.js";
import { generateReferralCode } from "../utils/generateRefferalCode.js";

const delunverifiedusers = asynchandler(async (req, res) => {
  const users = await User.deleteMany({ verified: false });
  if (users) {
    return res.json({ users_deleted: users });
  } else {
    return res.json({ message: "no users to delete" });
  }
});


let registeruser = asynchandler(async (req, res) => {
  // Check if a file was uploaded
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No screenshot file uploaded" });
  }

  const ss = req.file.path; // File path from the uploaded file
  const { fullname, phone, email, password, country, city, profession, classtype  , referredBy } = req.body;

  // // // Upload screenshot to Cloudinary
  let screenshot;
  try {
    screenshot = await cloudinary.uploader.upload(ss);
  } catch (uploadError) {
    return res.status(500).json({ message: "Error uploading file to Cloudinary", error: uploadError.message });
  }

  // // Validate input fields
  if (!email || !password) {
    throw new apierror(400, "All fields are required");
  }

  // Check for existing email
  const existedEmail = await User.findOne({ email });
  if (existedEmail) {
    if (!existedEmail.verified) {
      return res.status(401).json({ message: "Email already exists and user is not verified" });
    } else {
      return res.status(401).json({ message: "Email already exists, please proceed to login" });
    }
  }

  const referrer = referredBy ? await User.findOne({ referralCode: referredBy }) : null;

  // Generate a unique referral for the new user 
  const generatedCode = generateReferralCode(fullname, email);

  let user;
  try {
    // Create the user without customer ID initially 
    user = await User.create({
      email,
      password,
      fullname,
      phone,
      country,
      city,
      profession,
      classtype,
      payementss_id: screenshot.public_id,
      payementss_url: screenshot.secure_url,
      referralCode:  generatedCode, 
      referredBy: referrer ? referrer._id : null, 
    });

    if (referrer) {
      const referral = new Referral({
        user: user._id,
        referredBy: referrer._id,
      });
      await referral.save();

      await handleReferralCommission(referrer._id);
    }
      await user.save();
    
        // If there's a referrer, create a referral record and handle commission logic
    return res.status(200).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user", error: error.message });
  }
});



const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }

  // Exclude password from user data
  const loggedInUser = await User.findById(user._id).select("-password");

  if (!loggedInUser.approved) {
    return res.status(403).json({ message: "User is not approved yet" });
  }

  return res.status(200).json({
    message: "User verified successfully",
    user: loggedInUser,
  });
});


export const approveuser = asynchandler(async (req, res) => {
    const { id, approved } = req.body;
  
    // Validate required fields
    if (!id || approved === undefined) {
      return res.status(400).json({ message: "Both 'id' and 'approved' fields are required" });
    }
  
    try {
      // Update the user's approved status
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { approved: Boolean(approved) },
        { new: true } // Return the updated document
      );
  
      // Check if user exists and was updated
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Send success response
      return res.status(200).json({ message: "User approval status updated successfully", updatedUser });
    } catch (error) {
      console.error("Error updating user approval status:", error);
      return res.status(500).json({ message: "Error updating user approval status", error: error.message });
    }
  });
  



// const updateprofile = asynchandler(async (req, res) => {
//   const { id, name, email, password, number } = req.body;

//   const verificationCode = Math.floor(
//     100000 + Math.random() * 900000
//   ).toString();

//   let user;
//   try {
//     // Create the user without customer ID initially
//     user = await User.findByIdAndUpdate(
//       id,
//       {
//         name,
//         email,
//         password,
//         number,
//         verificationcode: verificationCode,
//       },
//       { new: true }
//     );

//     await sendemailverification(user.email, user.verificationcode);

//     return res
//       .status(200)
//       .json({
//         message: "Please verify your email",
//         otp: user.verificationcode,
//       });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return res
//       .status(500)
//       .json({ message: "Error creating user", error: error.message });
//   }
// });

const getallusers = asynchandler(async (req, res) => {
  const users = await User.find({});

  res.json({ users: users });
});
const deleteuser = asynchandler(async (req, res) => {
  const { id } = req.body;

  const deleteduser = await User.findByIdAndDelete(id);

  if (deleteduser) {
    res.json({ mesaage: "user deleted Successfully", user: deleteduser });
  }
});

export {
  registeruser,
  login,
  delunverifiedusers,
  
  getallusers,
  deleteuser,
};
