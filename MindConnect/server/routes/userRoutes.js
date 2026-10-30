const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");
const nodemailer = require("nodemailer");
const Transaction = require("../models/Transaction");
const TestResult = require("../models/TestResult");
const { protect, authorize, isSelfOrAdmin } = require("../middleware/authMiddleware");

const rateLimit = require("../middleware/rateLimit");

const MAX_TOPUP = 50000;

// ব্রুট-ফোর্স ঠেকানোর জন্য: প্রতি IP তে ১৫ মিনিটে সর্বোচ্চ ২০ বার
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Please try again after 15 minutes.",
});

// লগইন/রেজিস্টার রেসপন্সের জন্য কমন ফরম্যাট
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  walletBalance: user.walletBalance,
  token: generateToken(user._id),
});

// ১. রেজিস্ট্রেশন
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email: String(email) });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // রোল সবসময় "user" — রিকোয়েস্ট থেকে রোল নেওয়া হবে না
    const user = await User.create({ name, email, password });
    res.status(201).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. লগইন
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: String(email) });
    if (user && password && (await bcrypt.compare(password, user.password))) {
      res.json(userResponse(user));
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৩. রোল আপডেট (শুধু Admin)
router.put("/make-admin", protect, authorize("admin"), async (req, res) => {
  const { email, role } = req.body;
  try {
    const newRole = role || "admin";
    if (!["user", "doctor", "admin"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findOne({ email });
    if (user) {
      user.role = newRole;
      await user.save();
      res.json({ message: `User role updated to ${user.role}!` });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৪. প্রোফাইল আপডেট (নিজের প্রোফাইল — টোকেন থেকে ইউজার নেওয়া হয়)
router.put("/profile", protect, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return res.status(400).json({ message: "Email already in use" });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = password;
    const updatedUser = await user.save();
    res.json(userResponse(updatedUser));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৫. অ্যাডমিন অ্যানালিটিক্স + ইনকাম (শুধু Admin)
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const [userCount, doctorCount, appointmentCount, incomeResult] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments({}),
      Appointment.aggregate([
        { $match: { status: { $in: ["approved", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$fee" } } },
      ]),
    ]);

    res.json({
      users: userCount,
      doctors: doctorCount,
      appointments: appointmentCount,
      income: incomeResult[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------------------------------------
// ৬. পাসওয়ার্ড রিসেট লিংক পাঠানো
// র‍্যান্ডম টোকেন তৈরি হয়, ডাটাবেসে শুধু hash রাখা হয়, ১৫ মিনিট মেয়াদ
// ---------------------------------------------------------
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: String(email) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // লাইভ এবং লোকাল দুই জায়গাতেই কাজ করার লজিক
    const clientURL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${clientURL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // পোর্ট 587 এর জন্য এটি false রাখতেই হবে (STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - MindConnect",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">MindConnect Password Reset</h2>
          <p>You requested to reset your password. Please click the link below (valid for 15 minutes):</p>
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">Or copy this link: <br/> ${resetLink}</p>
          <p style="color: gray; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      // ইমেইল না গেলে টোকেন বাতিল
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw mailError;
    }
    console.log("✅ Email sent successfully to:", email);

    res.json({ message: "Reset link sent to your email! Please check inbox/spam." });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send email. Check .env config." });
  }
});

// ৭. নতুন পাসওয়ার্ড সেট করা (টোকেন একবারই ব্যবহার করা যাবে)
router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: "Password Reset Successful! Please Login." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৮. একাউন্ট ডিলিট করা (নিজের একাউন্ট + পাসওয়ার্ড কনফার্ম)
router.post("/delete-account", protect, async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = password && (await bcrypt.compare(password, user.password));
    if (!isMatch) return res.status(401).json({ message: "Incorrect Password!" });

    const userId = user._id.toString();
    await Promise.all([
      User.findByIdAndDelete(userId),
      Transaction.deleteMany({ userId }),
      TestResult.deleteMany({ userId }),
      Appointment.updateMany(
        { userId, status: "pending" },
        { $set: { status: "cancelled" } }
      ),
    ]);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৯. টাকা এড করা (নিজের ওয়ালেটে, ডেমো পেমেন্ট গেটওয়ে)
router.put("/add-money", protect, async (req, res) => {
  const amount = Number(req.body.amount);
  try {
    if (!Number.isFinite(amount) || amount < 10 || amount > MAX_TOPUP) {
      return res.status(400).json({ message: `Amount must be between 10 and ${MAX_TOPUP} BDT` });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return res.status(404).json({ message: "User not found" });

    await Transaction.create({
      userId: user._id,
      amount,
      type: "credit",
      description: "Added Money via Wallet",
    });
    res.json({
      message: "Money added successfully!",
      balance: user.walletBalance,
      user: { ...user._doc, token: generateToken(user._id) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ১০. নির্দিষ্ট ইউজারের তথ্য (নিজের অথবা Admin)
router.get("/:id", protect, async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
