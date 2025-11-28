import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage"; // ১. নতুন পেজ ইম্পোর্ট
import DoctorDashboard from "./pages/DoctorDashboard";
import Blogs from "./pages/Blogs";
import UserProfile from "./pages/UserProfile";
import DoctorDetails from "./pages/DoctorDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BlogDetails from "./pages/BlogDetails";
import MentalTest from "./pages/MentalTest";
import Wallet from "./pages/Wallet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ২. পাবলিক ল্যান্ডিং পেজ */}
        <Route path="/" element={<LandingPage />} />
        
        {/* ৩. ইউজার ড্যাশবোর্ড (আগের Home পেজটাকে এখন /dashboard রুটে দিলাম) */}
        <Route path="/dashboard" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetails />} />
        <Route path="/mental-test" element={<MentalTest />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;