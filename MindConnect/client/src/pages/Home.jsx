import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// ✅ Chatbot ইমপোর্ট করা হয়েছে
import AiChatBot from "../components/AiChatBot"; 

const Home = () => {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("All");
  const [sortBy, setSortBy] = useState("None");
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      // --- সার্ভার থেকে লেটেস্ট ডাটা সিঙ্ক করা ---
      const fetchLatestUserData = async () => {
        try {
          const { data } = await axios.get(
            `https://mindconnect-backend-afyf.onrender.com/api/users/${parsedUser._id}`
          );
          const updatedUserData = { ...data, token: parsedUser.token };
          setUser(updatedUserData);
          localStorage.setItem("userInfo", JSON.stringify(updatedUserData));
        } catch (error) {
          console.error("Sync Failed:", error);
          if (error.response && error.response.status === 404) {
            localStorage.removeItem("userInfo");
            navigate("/login");
          }
        }
      };
      fetchLatestUserData();
    } else {
      toast.error("Login First!");
      navigate("/login");
    }

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "https://mindconnect-backend-afyf.onrender.com/api/doctors"
        );
        setDoctors(data);
      } catch (e) {}
    };
    fetchDoctors();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    toast.info("Logged Out");
    navigate("/login");
  };

  const openModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!date || !time) return toast.warning("Select Date & Time!");

    if (user.walletBalance < selectedDoctor.feesPerConsultation) {
      toast.error("Insufficient Balance! Please add money.");
      navigate("/wallet");
      return;
    }

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        "https://mindconnect-backend-afyf.onrender.com/api/appointments",
        {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.name,
          date,
          time,
          fee: selectedDoctor.feesPerConsultation,
        },
        config
      );

      const updatedUser = { ...user, walletBalance: data.remainingBalance };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Booking Successful! Fee deducted. 🎉");
      setShowModal(false);
      setDate("");
      setTime("");
    } catch (e) {
      toast.error(e.response?.data?.message || "Booking Failed");
    }
  };

  if (!user) return null;

  let processedDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterSpecialization === "All" ||
        doc.specialization === filterSpecialization)
  );
  if (sortBy === "Rating")
    processedDoctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const uniqueSpecs = ["All", ...new Set(doctors.map((d) => d.specialization))];

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative pb-20">
      
      {/* Navbar: মোবাইলে flex-col (নিচে নিচে) এবং পিসিতে md:flex-row (পাশাপাশি) */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg p-4 sticky top-0 z-40 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 mb-3 md:mb-0">
            MindConnect 🌿
          </Link>
          
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 text-sm font-medium">
            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition">Admin Panel</Link>
            )}
            {user.role === "doctor" && (
              <Link to="/doctor-dashboard" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition">Doctor Panel</Link>
            )}

            <Link to="/blogs" className="hover:text-blue-200 transition">Blogs</Link>
            <Link to="/my-appointments" className="hover:text-blue-200 transition">Appointments</Link>

            {/* Wallet Section */}
            <Link to="/wallet" className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full font-bold shadow-md flex items-center gap-2 transition">
              <span>💳</span> {user.walletBalance} ৳
            </Link>

            <Link to="/profile" className="hover:text-blue-200 transition">Profile</Link>
            <Link to="/mental-test" className="hover:text-blue-200 transition">Test</Link>
            
            <div className="hidden md:block w-px h-6 bg-white/30 mx-2"></div>
            
            <span className="opacity-90 hidden md:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full shadow-md transition ml-2">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto mt-8 p-4 md:p-6">
        
        {/* Banner: মোবাইলে টেক্সট ছোট হবে */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 md:p-10 rounded-3xl shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome to Your Wellness Hub</h2>
            <p className="opacity-90 text-md md:text-lg">Book appointments, track health, and find peace.</p>
          </div>
          <div className="relative z-10 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
            <span className="text-xl md:text-2xl font-bold">Health Status: Excellent 🌟</span>
          </div>
        </div>

        {/* Filter Section: মোবাইলে ইনপুটগুলো নিচে নিচে আসবে */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search doctor..."
            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 bg-white w-full md:w-auto"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            {uniqueSpecs.map((s, i) => (
              <option key={i} value={s}>{s === "All" ? "Filter by Category" : s}</option>
            ))}
          </select>
          <select
            className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 bg-white w-full md:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="None">Sort By: Default</option>
            <option value="Rating">Rating: High to Low</option>
          </select>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span> Available Specialists
        </h3>

        {/* Grid: মোবাইলে ১ কলাম, ট্যাবে ২, পিসিতে ৩ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {processedDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-blue-100"></div>

              <div className="flex items-center mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mr-4 shrink-0">
                  {doctor.name.charAt(0)}
                </div>
                <div className="min-w-0"> {/* Text Overflow Fix */}
                  <Link to={`/doctor/${doctor._id}`}>
                    <h4 className="text-lg md:text-xl font-bold text-gray-800 hover:text-blue-600 transition truncate">{doctor.name}</h4>
                  </Link>
                  <p className="text-blue-500 font-medium text-sm">{doctor.specialization}</p>
                  <div className="flex items-center text-xs text-yellow-500 mt-1 font-bold bg-yellow-50 px-2 py-0.5 rounded w-fit">
                    <span>★ {doctor.rating ? doctor.rating.toFixed(1) : "0.0"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-gray-600 text-sm mb-8 relative z-10">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Experience</span> <span className="font-semibold">{doctor.experience}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Consultation Fee</span> <span className="font-bold text-green-600">{doctor.feesPerConsultation} BDT</span>
                </div>
              </div>

              <button
                onClick={() => openModal(doctor)}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg relative z-10"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-bounce-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-1 text-gray-800">Confirm Booking</h3>
            <p className="text-gray-500 text-sm mb-6">Payment will be deducted from wallet</p>

            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="font-bold text-blue-800">{selectedDoctor?.name}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Consultation Fee:</span>
                <span className="font-bold text-red-600">-{selectedDoctor?.feesPerConsultation} BDT</span>
              </div>
              <div className="flex justify-between mt-1 border-t border-blue-200 pt-1">
                <span className="text-sm text-gray-600">Your Balance:</span>
                <span className={`font-bold ${user.walletBalance < selectedDoctor?.feesPerConsultation ? "text-red-500" : "text-green-600"}`}>
                  {user.walletBalance} BDT
                </span>
              </div>
            </div>

            <label className="block text-gray-700 font-bold text-sm mb-2">Select Date</label>
            <input
              type="date"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="block text-gray-700 font-bold text-sm mb-2">Select Time</label>
            <input
              type="time"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 mb-8 focus:ring-2 focus:ring-blue-500"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <button
              onClick={handleConfirmBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition"
            >
              Pay & Confirm
            </button>
          </div>
        </div>
      )}
      
      {/* ✅ Chatbot Integration (সবার শেষে) */}
      <AiChatBot />

    </div>
  );
};

export default Home;