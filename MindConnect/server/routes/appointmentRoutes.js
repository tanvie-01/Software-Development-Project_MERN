// server/routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ১. অ্যাপয়েন্টমেন্ট বুক করা (টাকা কাটার লজিক + ট্রানজেকশন সেভ)
router.post("/", async (req, res) => {
const { userId, userName, userEmail, doctorId, doctorName, date, time, fee } = req.body;

try {
// ইউজার এবং ব্যালেন্স চেক
const user = await User.findById(userId);
if (!user) return res.status(404).json({ message: "User not found" });

if (user.walletBalance < fee) {
return res.status(400).json({ message: "Insufficient Balance!" });
}

// টাকা কেটে নেওয়া
user.walletBalance -= fee;
await user.save();

// --- রেকর্ড সেভ (DEBIT) ---
await Transaction.create({
userId,
amount: fee,
type: "debit",
description: `Booking - ${doctorName}`,
});
// ------------------------

const newAppointment = new Appointment({
userId, userName, userEmail, doctorId, doctorName, date, time, fee
});
const savedAppointment = await newAppointment.save();

res.status(201).json({
message: "Booking Successful!",
appointment: savedAppointment,
remainingBalance: user.walletBalance
});

} catch (error) {
console.error(error);
res.status(500).json({ message: "Server Error" });
}
});

// ২. সব অ্যাপয়েন্টমেন্ট (Admin)
router.get("/", async (req, res) => {
try {
const appointments = await Appointment.find({});
res.json(appointments);
} catch (error) {
res.status(500).json({ message: "Server Error" });
}
});

// ৩. ইউজারের অ্যাপয়েন্টমেন্ট (User)
router.get("/:userId", async (req, res) => {
try {
const appointments = await Appointment.find({ userId: req.params.userId });
res.json(appointments);
} catch (error) {
res.status(500).json({ message: "Server Error" });
}
});

// ---------------------------------------------------------
// ৪. স্ট্যাটাস আপডেট এবং রিফান্ড লজিক (Refund + Transaction Save) 💸
// ---------------------------------------------------------
router.put("/:id", async (req, res) => {
try {
const { status, prescription } = req.body;
const appointment = await Appointment.findById(req.params.id);

if (appointment) {
// --- রিফান্ড লজিক শুরু ---
if (status === "cancelled" && appointment.status !== "cancelled") {
const user = await User.findById(appointment.userId);

if (user) {
// টাকা ফেরত দেওয়া হচ্ছে
user.walletBalance += (appointment.fee || 0);
await user.save();
console.log(`Refunded ${appointment.fee} to User: ${user.name}`);

// --- রেকর্ড সেভ (REFUND/CREDIT) ---
await Transaction.create({
userId: user._id,
amount: appointment.fee || 0,
type: "credit",
description: `Refund - ${appointment.doctorName}`,
});
// --------------------------------
}
}
// --- রিফান্ড লজিক শেষ ---

appointment.status = status || appointment.status;

if (prescription) {
appointment.prescription = prescription;
}

const updatedAppointment = await appointment.save();
res.json(updatedAppointment);
} else {
res.status(404).json({ message: "Appointment not found" });
}
} catch (error) {
console.error(error);
res.status(500).json({ message: "Server Error" });
}
});

// ৫. ডাক্তারের অ্যাপয়েন্টমেন্ট (Doctor)
router.get("/doctor/:doctorName", async (req, res) => {
try {
const appointments = await Appointment.find({ doctorName: req.params.doctorName });
res.json(appointments);
} catch (error) {
res.status(500).json({ message: "Server Error" });
}
});

module.exports = router;