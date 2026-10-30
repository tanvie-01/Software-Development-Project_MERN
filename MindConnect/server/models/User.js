const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
    
    // নতুন ফিল্ড: ওয়ালেট ব্যালেন্স (ডিফল্ট ০ টাকা)
    walletBalance: { type: Number, default: 0 },

    // পাসওয়ার্ড রিসেট টোকেন (hash করে রাখা হয়) + মেয়াদ
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;