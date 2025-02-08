import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { Referral } from "../models/refer.model.js";

const profileController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Profile ID is required" });
        }
        const profile = await User.findOne({ _id: id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        console.log("user profile ", profile);
        ///get his own referal
        const referal = await Referral.findOne({ user: id });
        ///check if referral is not found
        if (referal === null) {
            return res.status(404).json({ message: "Referral not found" });
        }
        ///check if user has a referal by someone,find that user
        var referringuser = null;
        if (profile.referredBy) {
            referringuser = await User.findOne({ _id: profile.referredBy });
            console.log("Referred by:", referringuser);
        }




        ///commision
        var commission = 0;
        var totalReferralsL1 = 0;
        var totalReferralsL2 = 0;
        var totalReferralsL3 = 0;
        var totalReferrals = 0;

        if (referal.commission.level1) {
            console.log("Level 1 commission", referal.commission.level1);
            commission += referal.commission.level1;

            totalReferralsL1 = referal.commission.level1 / 10;
        }
        if (referal.commission.level2) {
            console.log("Level 2 commission", referal.commission.level2);
            commission += referal.commission.level2;
            totalReferralsL2 = referal.commission.level2 / 5;

        }
        if (referal.commission.level3) {
            console.log("Level 3 commission", referal.commission.level3);
            commission += referal.commission.level3;
            totalReferralsL3 = (referal.commission.level3 / 2);

        }
        ///total referrals
        totalReferrals = totalReferralsL1 + totalReferralsL2 + totalReferralsL3;

        // Return the user's profile and referral details
        const userProfile = {
            "profile": profile,
            'referred_by': referringuser.fullname,
            'total_commission': commission,
            'referral_details': {
                'level1_referrals': totalReferralsL1,
                'level2_referrals': totalReferralsL2,
                'level3_referrals': totalReferralsL3,
                'total_referrals': totalReferrals,
            }
        };
        ///return the user profile
        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default profileController;
