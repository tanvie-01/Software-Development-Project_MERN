const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { protect, isSelfOrAdmin } = require("../middleware/authMiddleware");

// নির্দিষ্ট ইউজারের সব ট্রানজেকশন দেখা (নিজের অথবা Admin)
router.get("/:userId", protect, async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
