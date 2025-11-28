const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

const doctorSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // ইমেইল ইউনিক হতে হবে
    phone: { type: String, required: true },
    
    // নতুন ফিল্ডগুলো
    doctorId: { type: String, required: true, unique: true }, // যেমন: DR-1001
    specialization: { type: String, required: true },
    degree: { type: String, required: true }, // যেমন: MBBS, FCPS
    medicalCollege: { type: String, required: true }, // যেমন: Dhaka Medical College
    currentHospital: { type: String, required: true }, // যেমন: Square Hospital
    experience: { type: String, required: true },
    feesPerConsultation: { type: Number, required: true },

    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;