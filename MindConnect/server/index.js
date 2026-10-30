// env সবার আগে লোড করতে হবে, যাতে রাউট ফাইলগুলো process.env পায়
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testRoutes = require('./routes/testRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require("./routes/aiRoutes");

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env file");
  process.exit(1);
}

connectDB();

const app = express();

// Render এর মত প্রক্সির পিছনে req.ip সঠিক পাওয়ার জন্য
app.set("trust proxy", 1);

// শুধু নিজেদের ফ্রন্টএন্ড থেকে রিকোয়েস্ট আসবে (CLIENT_URL, কমা দিয়ে একাধিক দেওয়া যাবে)
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CLIENT_URL || "").split(",").map((url) => url.trim().replace(/\/$/, "")),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // origin না থাকলে (Postman/server-to-server) অথবা লিস্টে থাকলে অনুমতি
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
}));
app.use(express.json({ limit: "100kb" }));

app.get('/', (req, res) => {
  res.send('MindConnect API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/transactions', transactionRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
