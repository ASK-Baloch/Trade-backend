// middleware/checkApprovalOrAdmin.js
import { User } from "../models/user.model.js";

export const checkApprovalOrAdmin = async (req, res, next) => {
  // You can choose where to get the userId.
  // For example, here we check both query and body.
  const userId = req.query.userId
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If the user is approved OR the user is an admin, allow access.
    if (user.approved === true || user.role === "admin") {
      return next();
    } else {
      return res.status(403).json({ message: "Access denied: User is not approved for access." });
    }
  } catch (error) {
    console.error("Error in checkApprovalOrAdmin middleware:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
