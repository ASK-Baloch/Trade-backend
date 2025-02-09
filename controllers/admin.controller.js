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

const getAllUsers = asynchandler(async (req, res) => {
  const users = await User.find({});

  res.json({ users: users });
});
const deleteUser = asynchandler(async (req, res) => {
  const { id } = req.body;

  const deleteduser = await User.findByIdAndDelete(id);

  if (deleteduser) {
    res.json({ mesaage: "user deleted Successfully", user: deleteduser });
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
    const { requestId, status } = req.body;
    if (!requestId || !status) {
      return res.status(400).json({ message: "Request ID and status are required" });
    }

    // Find the withdrawal request by its ID
    const withdrawalRequest = await Withdraw.findById(requestId);
    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Update status and set processedAt timestamp
    withdrawalRequest.status = status;
    withdrawalRequest.processedAt = new Date();
    await withdrawalRequest.save();

    // If approved, deduct the requested amount from the user's total commission
    if (status === "Approved") {
      // Find the referral record for the user who made the withdrawal request
      const referralRecord = await Referral.findOne({ user: withdrawalRequest.user });
      if (!referralRecord) {
        return res.status(404).json({ message: "Referral record not found for this user" });
      }

      try {
        deductFromTotalCommission(referralRecord, withdrawalRequest.amount);
        await referralRecord.save();
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    res.status(200).json({ message: `Withdrawal request ${status} successfully` });
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export { getAdminWithdrawalRequests, approveWithdrawalRequest , approveUser , delUnverifiedUsers, getAllUsers , deleteUser};
