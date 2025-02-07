import { withdrawalRequests } from "./withdraw.controller";

const getAdminWithdrawalRequests = (req, res) => {
  console.log("Fetching withdrawal requests..."); // ✅ Debugging
  res.status(200).json(withdrawalRequests); // Use the shared withdrawalRequests
};

const approveWithdrawalRequest = (req, res) => {
  const { requestId, status } = req.body;
  const request = withdrawalRequests.find((req) => req.id === requestId);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }
  request.status = status; // Update the status of the request
  res.status(200).json({ message: `Request ${status}` });
};

module.exports = {
  approveWithdrawalRequest,
  getAdminWithdrawalRequests,
};
