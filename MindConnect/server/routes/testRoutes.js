const express = require("express");
const router = express.Router();
const TestResult = require("../models/TestResult");
const { protect, isSelfOrAdmin } = require("../middleware/authMiddleware");

// ১. রেজাল্ট সেভ করা (লগইন করা ইউজারের নিজের রেজাল্ট)
router.post("/save", protect, async (req, res) => {
  const { score, suggestion } = req.body;
  try {
    if (!Number.isFinite(Number(score)) || !suggestion) {
      return res.status(400).json({ message: "Invalid result data" });
    }
    await TestResult.create({
      userId: req.user._id.toString(),
      userName: req.user.name,
      score: Number(score),
      suggestion,
    });
    res.status(201).json({ message: "Result saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. ইউজারের আগের সব রেজাল্ট দেখা (নিজের অথবা Admin)
router.get("/:userId", protect, async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const results = await TestResult.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
