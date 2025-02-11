import { User } from '../models/user.model.js';
import { Referral } from '../models/refer.model.js';
import { apierror } from "../utils/apierror.js";
import cloudinary from '../middelwares/cloudinary.middelware.js'
import { generateReferralCode } from '../utils/generateRefferalCode.js';

// Function to handle referral commission logic
export const handleReferralCommission = async (userId) => {
  // Fixed commission amounts for each level:
  const fixedCommissionValues = [3000, 3000 * 0.10, 3000 * 0.05]; // [3000, 300, 150]

  let currentUser = await User.findById(userId);
  let level = 0;

  while (currentUser && level < fixedCommissionValues.length) {
    // Find or create a referral record for the current user
    let referral = await Referral.findOne({ user: currentUser._id });
    if (!referral) {
      referral = new Referral({
        user: currentUser._id,
        commission: { level1: 0, level2: 0, level3: 0 }
      });
    }

    // Add the fixed commission based on the level
    switch (level) {
      case 0:
        referral.commission.level1 += fixedCommissionValues[0];
        break;
      case 1:
        referral.commission.level2 += fixedCommissionValues[1];
        break;
      case 2:
        referral.commission.level3 += fixedCommissionValues[2];
        break;
      default:
        break;
    }
    
    // To ensure Mongoose knows the nested object was updated:
    referral.markModified("commission");
    
    await referral.save();
    

    // Move to the next referrer in the chain
    currentUser = await User.findById(currentUser.referredBy);
    level++;
  }
};



// Function to handle user signup with referral
const signUpWithReferral = async (req, res) => {
  // Check if a file was uploaded
  // if (!req.file || !req.file.path) {
  //   return res.status(400).json({ message: "No screenshot file uploaded" });
  // }

  // const ss = req.file.path; // File path from the uploaded file
  const { fullname, phone, email, password, country, city, profession, classtype , referredBy} = req.body;

  // Upload screenshot to Cloudinary
  // let screenshot;
  //   try {
  //     screenshot = await cloudinary.uploader.upload(ss);
  //   } catch (uploadError) {
  //     return res.status(500).json({ message: "Error uploading file to Cloudinary", error: uploadError.message });
  //   }
  // input fields
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
  try {
    // Find the user who referred the new user
    const referrer = referredBy ? await User.findOne({ referralCode: referredBy }) : null;
     
    // Generate a unique referral for the new user 
    const generatedCode = generateReferralCode(fullname, email);

    // Create the new user
    const newUser = new User({
      fullname,
      phone,
      email,
      password,
      country,
      city,
      profession,
      classtype,
      // payementss_id: screenshot.public_id,
      // payementss_url: screenshot.secure_url,
      referralCode:  generatedCode, 
      referredBy: referrer ? referrer._id : null, 
    });
    await newUser.save();
    // If there's a referrer, create a referral record and handle commission logic
    if (referrer) {
      const referral = new Referral({
        user: newUser._id,
        referredBy: referrer._id,
        // commission: { level1: 0, level2: 0, level3: 0 }
      });
      await referral.save();

      await handleReferralCommission(referrer._id);
    }
    await newUser.save();


    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export { signUpWithReferral };