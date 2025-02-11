import { User } from "../models/user.model.js";
import { Referral } from "../models/refer.model.js";

const profileController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Profile ID is required" });
    }

    // Retrieve the user's profile
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Retrieve the referral record associated with the user
    let referralRecord = await Referral.findOne({ user: id });
    if (!referralRecord) {
      referralRecord = { commission: { level1: 0, level2: 0, level3: 0 } };
    }


    // Retrieve the referring user's details (if exists)
    let referringUser = null;
    if (user.referredBy) {
      referringUser = await User.findById(user.referredBy);
    }

    // Fixed commission values (per successful sale)
    const DIRECT_COMMISSION = 3000;
    const LEVEL2_COMMISSION = 300; // 10% of 3000
    const LEVEL3_COMMISSION = 150; // 5% of 3000

    // Calculate total commission earned (available commission)
    const totalCommission =
      (referralRecord.commission.level1 || 0) +
      (referralRecord.commission.level2 || 0) +
      (referralRecord.commission.level3 || 0);

    // Calculate referral counts based on the commission earned
    // (Assuming each referral contributes exactly the fixed commission amounts)
    const level1Count = referralRecord.commission.level1
      ? Math.floor(referralRecord.commission.level1 / DIRECT_COMMISSION)
      : 0;
    const level2Count = referralRecord.commission.level2
      ? Math.floor(referralRecord.commission.level2 / LEVEL2_COMMISSION)
      : 0;
    const level3Count = referralRecord.commission.level3
      ? Math.floor(referralRecord.commission.level3 / LEVEL3_COMMISSION)
      : 0;

    const totalReferrals = level1Count + level2Count + level3Count;

    // Construct the profile response object
    const userProfile = {
      profile: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
        profession: user.profession,
        classtype: user.classtype,
        referralCode: user.referralCode,
        referredBy: referringUser ? referringUser.fullname : null,
      },
      referralDetails: {
        level1Referrals: level1Count,
        level2Referrals: level2Count,
        level3Referrals: level3Count,
        totalReferrals: totalReferrals,
        totalCommission: totalCommission, // Total available commission earned
      },
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default profileController;
