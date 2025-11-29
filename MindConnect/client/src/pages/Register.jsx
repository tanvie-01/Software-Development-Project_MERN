import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // ইম্পোর্ট

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://mindconnect-backend-afyf.onrender.com/api/users/register",
        { name, email, password }
      );
      toast.success("Registration Successful! Please Login. 🎉"); // সাকসেস টোস্ট
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed ❌"); // এরর টোস্ট
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-sans"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-bl from-pink-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Create Account
          </h2>
          <p className="text-pink-100 text-sm">
            Join MindConnect community today!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-pink-100 text-sm font-bold mb-1 ml-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-pink-100 text-sm font-bold mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-pink-100 text-sm font-bold mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-pink-500/40 hover:scale-[1.02] transition duration-300 active:scale-95"
          >
            Register Now
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-pink-200">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-white hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
