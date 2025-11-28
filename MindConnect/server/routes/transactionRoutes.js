const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// নির্দিষ্ট ইউজারের সব ট্রানজেকশন দেখা
router.get("/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;