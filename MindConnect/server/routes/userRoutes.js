const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const nodemailer = require("nodemailer"); // ১. Nodemailer ইম্পোর্ট
const Transaction = require("../models/Transaction");

// ১. রেজিস্ট্রেশন
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance, // <--- এই লাইনটি যোগ হয়েছে
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. লগইন
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance, // <--- এই লাইনটি যোগ হয়েছে
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৩. রোল আপডেট (Make Admin/Doctor)
router.put("/make-admin", async (req, res) => {
  const { email, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.role = role || "admin";
      await user.save();
      res.json({ message: `User role updated to ${user.role}!`, user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৪. প্রোফাইল আপডেট
router.put("/profile", async (req, res) => {
  const { _id, name, email, password } = req.body;
  try {
    const user = await User.findById(_id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) user.password = password;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৭. অ্যাডমিন অ্যানালিটিক্স + ইনকাম (UPDATED LOGIC) ✅
router.get("/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "user" });
    const doctorCount = await User.countDocuments({ role: "doctor" });
    const appointmentCount = await Appointment.countDocuments({});
    
    // লজিক: ইনকাম যোগ হবে যদি স্ট্যাটাস 'approved' অথবা 'completed' হয়।
    // 'cancelled' বা 'pending' হলে যোগ হবে না।
    const activeAppointments = await Appointment.find({ 
      status: { $in: ["approved", "completed"] } 
    });

    const totalIncome = activeAppointments.reduce((acc, appt) => acc + (appt.fee || 0), 0);

    res.json({ users: userCount, doctors: doctorCount, appointments: appointmentCount, income: totalIncome });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------------------------------------
// ৬. পাসওয়ার্ড রিসেট লিংক পাঠানো (LIVE EMAIL SYSTEM) 📧
// ---------------------------------------------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = user._id + "_" + Date.now();
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // ২. ইমেইল কনফিগারেশন (.env থেকে পাসওয়ার্ড নিবে)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ৩. ইমেইল এর বিষয়বস্তু
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - MindConnect",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">MindConnect Password Reset</h2>
          <p>You requested to reset your password. Please click the link below:</p>
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">Or copy this link: <br/> ${resetLink}</p>
          <p style="color: gray; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // ৪. ইমেইল পাঠানো
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", email);

    res.json({ message: "Reset link sent to your email! Please check inbox/spam." });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send email. Check .env config." });
  }
});

// ৭. নতুন পাসওয়ার্ড সেট করা (Reset Password)
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const userId = token.split("_")[0];
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Invalid Token" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password Reset Successful! Please Login." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
// ... আগের সব রাউট ...

// ৮. পাসওয়ার্ড চেক করে একাউন্ট ডিলিট করা (Secure Delete)
router.post("/delete-account", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (user) {
      // পাসওয়ার্ড চেক করা
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        await User.findByIdAndDelete(userId);
        res.json({ message: "Account deleted successfully" });
      } else {
        res.status(401).json({ message: "Incorrect Password!" }); // পাসওয়ার্ড ভুল হলে
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ... আগের সব রাউট ...

// ৯. টাকা এড করা (Add Money + Transaction Record) ✅
router.put("/add-money", async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (user) {
      user.walletBalance += Number(amount);
      await user.save();

      // --- রেকর্ড সেভ করা ---
      await Transaction.create({
        userId,
        amount: Number(amount),
        type: "credit",
        description: "Added Money via Wallet",
      });
      // ---------------------

      res.json({ 
        message: "Money added successfully!", 
        balance: user.walletBalance,
        user: { ...user._doc, token: generateToken(user._id) }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৯. নির্দিষ্ট ইউজারের তথ্য পাওয়ার জন্য (Auto Sync এর জন্য) ✅
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // পাসওয়ার্ড ছাড়া বাকি সব দিবে
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

