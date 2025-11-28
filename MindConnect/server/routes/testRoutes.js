const express = require("express");
const router = express.Router();
const TestResult = require("../models/TestResult");

// ১. রেজাল্ট সেভ করা (User Only)
router.post("/save", async (req, res) => {
  const { userId, userName, score, suggestion } = req.body;
  try {
    const newResult = new TestResult({ userId, userName, score, suggestion });
    await newResult.save();
    res.status(201).json({ message: "Result saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. ইউজারের আগের সব রেজাল্ট দেখা
router.get("/:userId", async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;