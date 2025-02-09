import { Withdraw } from "../models/withdraw.model.js";
import { Referral } from "../models/refer.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";


const computeTotalCommission = (referralRecord) => {
  return (
    (referralRecord.commission.level1 || 0) +
    (referralRecord.commission.level2 || 0) +
    (referralRecord.commission.level3 || 0)
  );
};

const deductFromTotalCommission = (referralRecord, withdrawalAmount) => {
  try {
    const total = computeTotalCommission(referralRecord);
    if (total < withdrawalAmount) {
      throw new Error("Insufficient commission balance");
    }

    const deductionRatio = withdrawalAmount / total;

    // Deduct proportionally and round to avoid floating-point precision issues
    referralRecord.commission.level1 = Math.max(0, referralRecord.commission.level1 - Math.round(referralRecord.commission.level1 * deductionRatio));
    referralRecord.commission.level2 = Math.max(0, referralRecord.commission.level2 - Math.round(referralRecord.commission.level2 * deductionRatio));
    referralRecord.commission.level3 = Math.max(0, referralRecord.commission.level3 - Math.round(referralRecord.commission.level3 * deductionRatio));

    // Explicitly mark the nested commission object as modified
    referralRecord.markModified("commission");
  } catch (error) {
    rethrow;
  }
};


const approveUser = asynchandler(async (req, res) => {
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




const delUnverifiedUsers = asynchandler(async (req, res) => {
  const users = await User.deleteMany({ verified: false });
  if (users) {
    return res.json({ users_deleted: users });
  } else {
    return res.json({ message: "no users to delete" });
  }
});
////////get all users
const getAllUsers = asynchandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users: users });

  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

//////get all unverified users
const getUnverifiedUsers = asynchandler(async (req, res) => {
  try {
    const unverifiedUsers = await User.find({ approved: false });
    res.json({ unverifiedUsers: unverifiedUsers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unverified users", error: error.message });
  }
});

// get all verified users
const getVerifiedUsers = asynchandler(async (req, res) => {
  try {
    const verifiedUsers = await User.find({ approved: true });
    res.json({ verifiedUsers: verifiedUsers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching verified users", error: error.message });
  }
});
///get all referrals

const getAllReferrals = asynchandler(async (req, res) => {
  try {
    const referrals = await Referral.find({});
    res.json({ referrals: referrals });
  } catch (error) {
    console.log("Error fetching referrals:", error);
  }
})

///delete user
const deleteUser = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleteduser = await User.findByIdAndDelete(id);
    if (deleteduser) {
      res.json({ mesaage: "user deleted Successfully", user: deleteduser });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});


const getAdminWithdrawalRequests = async (req, res) => {
  try {
    const withdrawalRequests = await Withdraw.find().sort({ requestedAt: -1 });
    res.status(200).json(withdrawalRequests);
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Controller to approve or decline a withdrawal request.
 * If approved, the withdrawal amount is deducted from the user's total commission.
 */
const approveWithdrawalRequest = async (req, res) => {
  try {
    const requestId = req.params;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }
    console.log('request id', requestId)

    // Find the withdrawal request by its ID
    const withdrawalRequest = await Withdraw.findById({ _id: requestId.id });
    if (!withdrawalRequest) {
      return res.status(400).json({ message: "Withdrawal request not found" });
    }
    console.log('request for withdrawal before ', withdrawalRequest)
    const APPROVED_STATUS = "Approved";

    if (withdrawalRequest.status === APPROVED_STATUS) {
      return res.status(404).json({ message: "Withdrawal request can not be proceeded" });

    }
    console.log('request for withdrawal after ', withdrawalRequest)

    // Update status and set processedAt timestamp
    withdrawalRequest.status = APPROVED_STATUS;
    withdrawalRequest.processedAt = new Date();
    await withdrawalRequest.save();

    // If approved, deduct the requested amount from the user's total commission
    if (withdrawalRequest.status === APPROVED_STATUS) {
      // Find the referral record for the user who made the withdrawal request
      const referralRecord = await Referral.findOne({ user: withdrawalRequest.user });
      if (!referralRecord) {
        return res.status(400).json({ message: "Referral record not found for this user" });
      }

      deductFromTotalCommission(referralRecord, withdrawalRequest.amount);
      await referralRecord.save();
    }

    res.status(200).json({ message: `Withdrawal request ${status} successfully` });
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export { getAdminWithdrawalRequests, approveWithdrawalRequest, approveUser, delUnverifiedUsers, getAllUsers, deleteUser, getAllReferrals, getUnverifiedUsers, getVerifiedUsers };
