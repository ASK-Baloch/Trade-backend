import { User } from '../models/user.model.js';
import { Referral } from '../models/refer.model.js';
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import cloudinary from '../middelwares/cloudinary.middelware.js'


// Helper function to generate a unique referral code
export const generateReferralCode = (fullname, email) => {
  const namePart = fullname.split(' ').map(word => word[0].toUpperCase()).join('');
  const emailPart = email.split('@')[0].toUpperCase(); 
  const randomDigits = Math.floor(10000000000 + Math.random() * 90000000000);
  const paddedNumber = String(randomDigits).padStart(11, '0'); 
  
  return `${namePart}${emailPart}${paddedNumber}`;
};

// Function to handle referral commission logic
export const handleReferralCommission = async (userId, amount) => {
  const commissionRates = [0.1, 0.05, 0.02]; // Level 1: 10%, Level 2: 5%, Level 3: 2%

  let currentUser = await User.findById(userId);
  let level = 0;

  while (currentUser && level < commissionRates.length) {
    // Find or create a referral record for the current user
    let referral = await Referral.findOne({ user: currentUser._id });
    if (!referral) {
      referral = new Referral({
        user: currentUser._id,
        commission: { level1: 0, level2: 0, level3: 0 }
      });
    }

    // Calculate commission for the current level
    const commission = amount * commissionRates[level];
    switch (level) {
      case 0:
        referral.commission.level1 += commission;
        break;
      case 1:
        referral.commission.level2 += commission;
        break;
      case 2:
        referral.commission.level3 += commission;
        break;
      default:
        break;
    }

    await referral.save();

    // Move to the next referrer
    currentUser = await User.findById(currentUser.referredBy);
    
    level++;
  }
};



// Function to handle user signup with referral
const signUpWithReferral = async (req, res) => {
  // Check if a file was uploaded
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No screenshot file uploaded" });
  }

  const ss = req.file.path; // File path from the uploaded file
  const { fullname, phone, email, password, country, city, profession, classtype , referredBy} = req.body;

  // Upload screenshot to Cloudinary
  let screenshot;
    try {
      screenshot = await cloudinary.uploader.upload(ss);
    } catch (uploadError) {
      return res.status(500).json({ message: "Error uploading file to Cloudinary", error: uploadError.message });
    }
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
      payementss_id: screenshot.public_id,
      payementss_url: screenshot.secure_url,
      referralCode:  generatedCode, 
      referredBy: referrer ? referrer._id : null, 
    });

    // If there's a referrer, create a referral record and handle commission logic
    if (referrer) {
      const referral = new Referral({
        user: newUser._id,
        referredBy: referrer._id,
        // commission: { level1: 0, level2: 0, level3: 0 }
      });
      await referral.save();

      await handleReferralCommission(referrer._id, 100);
    }
    await newUser.save();


    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export { signUpWithReferral };