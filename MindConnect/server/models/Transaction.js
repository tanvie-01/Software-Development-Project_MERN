const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true }, // credit = income, debit = expense
    description: { type: String, required: true }, // যেমন: "Added Money", "Booking Fee"
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;