import { Withdraw } from "../models/withdraw.model.js";

/**
 * Create a new withdrawal request.
 */
export const withdrawController = async (req, res) => {
  try {
    const { id, amount, paymentMethod, details, status } = req.body;

    if (!id || !amount || !paymentMethod) {
      return res.status(400).json({
        message: "User ID, amount, and payment method are required",
      });
    }

    console.log("Received user id:", id);

    const newWithdrawal = new Withdraw({
      user: id,
      amount,
      paymentMethod,
      details,
      status: status || "Pending",
    });

    await newWithdrawal.save(); 

    res.status(201).json({
      message: "Withdrawal request created",
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Fetch all withdrawal requests for a specific user.
 */
export const getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const withdrawals = await Withdraw.find({ user: userId }).sort({ createdAt: -1 });

    if (!withdrawals.length) {
      return res.status(404).json({ message: "No withdrawal history found" });
    }

    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

