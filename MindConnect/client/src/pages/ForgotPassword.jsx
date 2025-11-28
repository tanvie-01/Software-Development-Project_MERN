import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/forgot-password", { email });
      toast.success(data.message + " 📧"); // সাকসেস টোস্ট
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send link ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-sans"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop')" }}>
      
      {/* Dark Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 via-purple-900/80 to-black/80 backdrop-blur-sm"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">
        
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Forgot Password?</h2>
          <p className="text-blue-100 text-sm">Don't worry! Enter your email to receive a reset link.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-blue-100 text-sm font-bold mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition duration-300"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-yellow-500/40 hover:scale-[1.02] transition duration-300 active:scale-95">
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition font-medium">
            <span>←</span> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;