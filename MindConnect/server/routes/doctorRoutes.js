const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ১. ডাক্তার অ্যাড (Admin Only)
router.post("/add", async (req, res) => {
  const { name, email, password, phone, specialization, degree, medicalCollege, currentHospital, experience, feesPerConsultation } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    // ১. ইউজার একাউন্ট তৈরি
    await User.create({ name, email, password, role: "doctor" });

    // ২. র‍্যান্ডম ডক্টর আইডি জেনারেট করা
    const randomId = "DR-" + Math.floor(1000 + Math.random() * 9000);

    // ৩. ডাক্তার প্রোফাইল তৈরি
    const doctor = new Doctor({
      name,
      email,
      phone,
      doctorId: randomId,
      specialization,
      degree,
      medicalCollege,
      currentHospital,
      experience,
      feesPerConsultation
    });
    
    await doctor.save();
    res.status(201).json({ message: "Doctor Added Successfully!" });

  } catch (error) {
    console.error(error);
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
    if(doctor) res.json(doctor);
    else res.status(404).json({ message: "Not Found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৪. ডাক্তার ডিলিট (Admin)
router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      await Doctor.findByIdAndDelete(req.params.id);
      await User.findOneAndDelete({ email: doctor.email });
      res.json({ message: "Doctor removed" });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৫. ডাক্তার এডিট/আপডেট (Admin - CRASH FIX APPLIED ✅)
router.put("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      
      // 🔥 CRASH FIX: পুরনো ডাটার যদি doctorId না থাকে, তবে নতুন জেনারেট করে দেওয়া হবে
      if (!doctor.doctorId) {
          doctor.doctorId = "DR-" + Math.floor(1000 + Math.random() * 9000);
      }

      // সাধারণ আপডেট লজিক
      doctor.name = req.body.name || doctor.name;
      doctor.phone = req.body.phone || doctor.phone;
      doctor.specialization = req.body.specialization || doctor.specialization;
      
      // নতুন ফিল্ডগুলো আপডেট
      doctor.degree = req.body.degree || doctor.degree;
      doctor.medicalCollege = req.body.medicalCollege || doctor.medicalCollege;
      doctor.currentHospital = req.body.currentHospital || doctor.currentHospital;

      doctor.experience = req.body.experience || doctor.experience;
      doctor.feesPerConsultation = req.body.feesPerConsultation || doctor.feesPerConsultation;
      
      const updatedDoctor = await doctor.save(); // এখন আর ক্র্যাশ করবে না
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ৬. রিভিউ যোগ (User)
router.post("/:id/reviews", async (req, res) => {
  const { rating, comment, userName, userId } = req.body;
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      const alreadyReviewed = doctor.reviews.find(r => r.user.toString() === userId.toString());
      if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });

      const review = { userName, rating: Number(rating), comment, user: userId };
      doctor.reviews.push(review);
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