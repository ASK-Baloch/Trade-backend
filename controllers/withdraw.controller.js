import { Withdraw } from "../models/withdraw.model.js";

let withdrawalRequests = [];
// Controller to create a new withdrawal request
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
    withdrawalRequests.push(newWithdrawal);

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

// Controller to fetch an existing withdrawal request by its ID
export const getWithdrawalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Withdrawal ID is required" });
    }

    const withdrawal = await Withdraw.findById(id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    res.status(200).json({ withdrawal });
    res.status(200).json(withdrawalRequests);
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export  {withdrawalRequests } ; 