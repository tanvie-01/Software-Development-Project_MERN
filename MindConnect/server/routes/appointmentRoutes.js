// server/routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Transaction = require("../models/Transaction");
const { protect, authorize, isSelfOrAdmin } = require("../middleware/authMiddleware");

const VALID_STATUSES = ["pending", "approved", "completed", "cancelled"];

// ১. অ্যাপয়েন্টমেন্ট বুক করা (টাকা কাটার লজিক + ট্রানজেকশন সেভ)
// ফি সবসময় ডাটাবেসের Doctor থেকে নেওয়া হয়, ক্লায়েন্ট থেকে না
router.post("/", protect, async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date and time are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const fee = doctor.feesPerConsultation;

    // ব্যালেন্স চেক + টাকা কাটা একসাথে (atomic) — একসাথে দুইটা বুকিং হলেও ব্যালেন্স নেগেটিভ হবে না
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, walletBalance: { $gte: fee } },
      { $inc: { walletBalance: -fee } },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "Insufficient Balance!" });
    }

    let savedAppointment;
    try {
      savedAppointment = await Appointment.create({
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        date,
        time,
        fee,
      });
    } catch (createError) {
      // অ্যাপয়েন্টমেন্ট সেভ না হলে টাকা ফেরত
      await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: fee } });
      throw createError;
    }

    // --- রেকর্ড সেভ (DEBIT) ---
    await Transaction.create({
      userId: user._id.toString(),
      amount: fee,
      type: "debit",
      description: `Booking - ${doctor.name}`,
    });

    res.status(201).json({
      message: "Booking Successful!",
      appointment: savedAppointment,
      remainingBalance: user.walletBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. সব অ্যাপয়েন্টমেন্ট (Admin) - Newest First
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৩. লগইন করা ডাক্তারের অ্যাপয়েন্টমেন্ট (Doctor) - Newest First
// নাম দিয়ে না, ডাক্তারের প্রোফাইল আইডি দিয়ে খোঁজা হয়
router.get("/doctor/me", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id.toString() }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৪. ইউজারের অ্যাপয়েন্টমেন্ট (User) - Newest First
router.get("/:userId", protect, async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const appointments = await Appointment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------------------------------------
// ৫. স্ট্যাটাস আপডেট এবং রিফান্ড লজিক (Admin অথবা ঐ অ্যাপয়েন্টমেন্টের ডাক্তার)
// ---------------------------------------------------------
router.put("/:id", protect, authorize("admin", "doctor"), async (req, res) => {
  try {
    const { status, prescription } = req.body;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ডাক্তার শুধু নিজের অ্যাপয়েন্টমেন্ট আপডেট করতে পারবে
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ email: req.user.email });
      if (!doctor || doctor._id.toString() !== appointment.doctorId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // --- রিফান্ড লজিক ---
    if (status === "cancelled" && appointment.status !== "cancelled") {
      if (appointment.status === "completed") {
        return res.status(400).json({ message: "Completed appointment can't be cancelled" });
      }

      // atomic: একই অ্যাপয়েন্টমেন্ট দুইবার ক্যান্সেল করে ডাবল রিফান্ড হবে না
      const cancelled = await Appointment.findOneAndUpdate(
        { _id: appointment._id, status: { $nin: ["cancelled", "completed"] } },
        { $set: { status: "cancelled" } },
        { new: true }
      );
      if (!cancelled) {
        return res.status(409).json({ message: "Appointment already cancelled" });
      }

      const fee = appointment.fee || 0;
      const user = await User.findByIdAndUpdate(appointment.userId, { $inc: { walletBalance: fee } });
      if (user) {
        await Transaction.create({
          userId: user._id.toString(),
          amount: fee,
          type: "credit",
          description: `Refund - ${appointment.doctorName}`,
        });
      }
      return res.json(cancelled);
    }

    if (appointment.status === "cancelled" && status && status !== "cancelled") {
      return res.status(400).json({ message: "Cancelled appointment can't be changed" });
    }

    appointment.status = status || appointment.status;
    if (prescription) {
      appointment.prescription = prescription;
    }

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
