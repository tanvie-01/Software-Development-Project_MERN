const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/authMiddleware");

// ইউনিক ডক্টর আইডি জেনারেট (যেমন: DR-4821) — আগে থেকে থাকলে আবার চেষ্টা
const generateDoctorId = async () => {
  for (let i = 0; i < 20; i++) {
    const id = "DR-" + Math.floor(1000 + Math.random() * 9000);
    if (!(await Doctor.exists({ doctorId: id }))) return id;
  }
  return "DR-" + Date.now().toString().slice(-6);
};

// ১. ডাক্তার অ্যাড (Admin Only)
router.post("/add", protect, authorize("admin"), async (req, res) => {
  const { name, email, password, phone, specialization, degree, medicalCollege, currentHospital, experience, feesPerConsultation } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!(Number(feesPerConsultation) > 0)) {
      return res.status(400).json({ message: "Fee must be a positive number" });
    }

    const userExists = await User.findOne({ email: String(email) });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    // ১. ডাক্তার প্রোফাইল আগে তৈরি (ভ্যালিডেশন ফেইল করলে ইউজার একাউন্ট তৈরি হবে না)
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      doctorId: await generateDoctorId(),
      specialization,
      degree,
      medicalCollege,
      currentHospital,
      experience,
      feesPerConsultation: Number(feesPerConsultation),
    });

    // ২. লগইনের জন্য ইউজার একাউন্ট তৈরি
    try {
      await User.create({ name, email, password, role: "doctor" });
    } catch (userError) {
      await Doctor.findByIdAndDelete(doctor._id);
      throw userError;
    }

    res.status(201).json({ message: "Doctor Added Successfully!" });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Please fill all doctor fields" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. সব ডাক্তার (Public)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৩. নির্দিষ্ট ডাক্তার (Details)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) res.json(doctor);
    else res.status(404).json({ message: "Not Found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৪. ডাক্তার ডিলিট (Admin)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      await Doctor.findByIdAndDelete(req.params.id);
      await User.findOneAndDelete({ email: doctor.email, role: "doctor" });
      res.json({ message: "Doctor removed" });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৫. ডাক্তার এডিট/আপডেট (Admin)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      // পুরনো ডাটার যদি doctorId না থাকে, তবে নতুন জেনারেট করে দেওয়া হবে
      if (!doctor.doctorId) {
        doctor.doctorId = await generateDoctorId();
      }

      if (req.body.feesPerConsultation !== undefined && req.body.feesPerConsultation !== "" &&
          !(Number(req.body.feesPerConsultation) > 0)) {
        return res.status(400).json({ message: "Fee must be a positive number" });
      }

      doctor.name = req.body.name || doctor.name;
      doctor.phone = req.body.phone || doctor.phone;
      doctor.specialization = req.body.specialization || doctor.specialization;
      doctor.degree = req.body.degree || doctor.degree;
      doctor.medicalCollege = req.body.medicalCollege || doctor.medicalCollege;
      doctor.currentHospital = req.body.currentHospital || doctor.currentHospital;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.feesPerConsultation = Number(req.body.feesPerConsultation) || doctor.feesPerConsultation;

      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ৬. রিভিউ যোগ (লগইন করা ইউজার — নাম/আইডি টোকেন থেকে নেওয়া হয়)
router.post("/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      const userId = req.user._id.toString();
      const alreadyReviewed = doctor.reviews.find((r) => r.user.toString() === userId);
      if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });

      // শুধু যারা এই ডাক্তারের কাছে অ্যাপয়েন্টমেন্ট সম্পন্ন করেছে তারাই রিভিউ দিতে পারবে
      const hasCompleted = await Appointment.exists({
        userId,
        doctorId: doctor._id.toString(),
        status: "completed",
      });
      if (!hasCompleted) {
        return res.status(403).json({ message: "You can review only after a completed appointment" });
      }

      doctor.reviews.push({ userName: req.user.name, rating: numericRating, comment, user: req.user._id });
      doctor.numReviews = doctor.reviews.length;
      doctor.rating = doctor.reviews.reduce((acc, item) => item.rating + acc, 0) / doctor.reviews.length;

      await doctor.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
