const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testRoutes = require('./routes/testRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require("./routes/aiRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors()); // <--- ২. এটা যোগ করুন (অবশ্যই app.use(express.json()) এর আগে)
app.use(express.json());

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