import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // ১. ইম্পোর্ট

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      
      // ২. কালারফুল সাকসেস মেসেজ
      toast.success(`Welcome back, ${data.name}! 👋`);
      
      navigate("/dashboard");
    } catch (error) {
      // ৩. কালারফুল এরর মেসেজ
      toast.error(error.response?.data?.message || "Invalid Email or Password ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-sans"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1632&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-black/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"><span className="text-3xl">🧘‍♂️</span></div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Welcome Back!</h2>
          <p className="text-blue-100 text-sm">Login to continue your mental wellness journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-blue-100 text-sm font-bold mb-2 ml-1">Email Address</label><input type="email" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition duration-300" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="block text-blue-100 text-sm font-bold mb-2 ml-1">Password</label><input type="password" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition duration-300" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] transition duration-300 active:scale-95">Sign In</button>
        </form>
        <div className="mt-6 flex justify-between items-center text-sm"><Link to="/forgot-password" class="text-blue-300 hover:text-white transition">Forgot password?</Link><p className="text-blue-200">New here? <Link to="/register" className="font-bold text-white hover:underline">Create Account</Link></p></div>
        <div className="mt-8 text-center"><Link to="/" className="text-xs text-white/50 hover:text-white transition">← Back to Landing Page</Link></div>
      </div>
    </div>
  );
};

export default Login;