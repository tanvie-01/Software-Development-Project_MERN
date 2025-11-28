const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    
    // --- নতুন ফিল্ডগুলো যোগ করা হলো ---
    userEmail: { type: String, required: true }, 
    time: { type: String, required: true },      
    fee: { type: Number, required: true },       
    // -----------------------------------

    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "pending" },
    prescription: { type: String, default: "" } 
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;