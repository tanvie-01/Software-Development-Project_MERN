const mongoose = require("mongoose");

const testResultSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    score: { type: Number, required: true }, // 10 এর মধ্যে কত পেল
    suggestion: { type: String, required: true }, // যেমন: "You seem stressed, take a break."
  },
  { timestamps: true }
);

const TestResult = mongoose.model("TestResult", testResultSchema);
module.exports = TestResult;