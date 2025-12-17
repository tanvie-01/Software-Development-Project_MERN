import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// ✅ ফিক্স ১: চ্যাটবট ইমপোর্ট করা হয়েছে
import AiChatBot from "../components/AiChatBot";
import myLocalHeroImage from "../assets/picture/mindconnect.jpg";

// স্টেবল হিরো ইমেজ
const heroImage = myLocalHeroImage;

const LandingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const navigate = useNavigate();

  const developers = [
    { name: "Tanvir", id: "C231071", varsity: "IIUC" },
    { name: "Sourav", id: "C231055", varsity: "IIUC" },
    { name: "Ahnaf", id: "C231069", varsity: "IIUC" },
    { name: "Joy", id: "C231075", varsity: "IIUC" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await axios.get(
          "https://mindconnect-backend-afyf.onrender.com/api/doctors"
        );
        const blogRes = await axios.get(
          "https://mindconnect-backend-afyf.onrender.com/api/blogs"
        );
        setDoctors(docRes.data);
        setBlogs(blogRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleBookAppointment = () => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) navigate("/dashboard");
    else {
      alert("Please Login!");
      navigate("/login");
    }
  };

  const displayedDoctors = showAllDoctors ? doctors : doctors.slice(0, 4);

  return (
    // ✅ ফিক্স ২: pb-24 দেওয়া হয়েছে যাতে চ্যাটবট ফুটার ঢেকে না দেয়
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden pb-24">
      {/* 1. Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg p-4 sticky top-0 z-40 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="text-2xl font-bold">MindConnect 🌿</div>
          </div>
          <div className="space-x-6 hidden md:flex items-center font-medium">
            <a href="#services" className="hover:text-blue-200 transition">
              Services
            </a>
            <a href="#doctors" className="hover:text-blue-200 transition">
              Doctors
            </a>
            <Link to="/blogs" className="hover:text-blue-200 transition">
              Blogs
            </Link>

            <Link
              to="/mental-test"
              className="text-yellow-300 hover:text-yellow-100 font-bold transition flex items-center gap-1"
            >
              Mental Test 🧠
            </Link>

            <div className="w-px h-6 bg-white/30 mx-2"></div>
            <Link to="/login" className="hover:text-blue-200 transition">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl -ml-20 opacity-70"></div>

        <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
          <div className="md:w-1/2 text-center md:text-left">
            <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wide mb-6 inline-block shadow-sm">
              Mental Healthcare for Everyone
            </span>
            
            {/* ✅ ফিক্স ৩: মোবাইলে টেক্সট সাইজ কমানো হয়েছে (text-4xl) যাতে ভেঙে না যায় */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Journey to <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Inner Peace
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
              Connect with certified therapists and psychiatrists instantly.
              Private, secure, and compassionate care whenever you need it.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => {
                  document
                    .getElementById("doctors")
                    .scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:scale-105 transition transform"
              >
                Find a Doctor
              </button>
              <a
                href="#services"
                className="px-8 py-4 rounded-full text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30"></div>
              <img
                src={heroImage}
                alt="Medical Team"
                className="relative w-full rounded-3xl shadow-2xl border-4 border-white transform hover:rotate-1 transition duration-500 bg-gray-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 3. Services */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Why Choose MindConnect?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive mental health services tailored to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: "🩺",
                title: "Expert Doctors",
                desc: "Verified specialists ready to help you.",
                color: "blue",
              },
              {
                icon: "🕒",
                title: "24/7 Support",
                desc: "Always online for your convenience.",
                color: "purple",
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                desc: "100% confidential sessions.",
                color: "green",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 border-b-4 border-${item.color}-500 group`}
              >
                <div
                  className={`w-20 h-20 bg-${item.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition`}
                >
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Doctors */}
      <section id="doctors" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
            Meet Our Specialists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-2xl transition duration-300 group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-md group-hover:scale-110 transition">
                  {doctor.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {doctor.name}
                </h3>
                <p className="text-blue-500 font-medium mb-3">
                  {doctor.specialization}
                </p>
                <div className="flex justify-center gap-1 mb-6 text-yellow-500 font-bold bg-yellow-50 py-1 px-3 rounded-full w-fit mx-auto text-sm">
                  ★ {doctor.rating ? doctor.rating.toFixed(1) : "0.0"}
                </div>
                <button
                  onClick={handleBookAppointment}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>

          {doctors.length > 4 && (
            <div className="text-center mt-16">
              <button
                onClick={() => setShowAllDoctors(!showAllDoctors)}
                className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-600 hover:text-white transition shadow-md"
              >
                {showAllDoctors ? "Show Less Doctors ↑" : "View All Doctors ↓"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Blogs */}
      <section id="blogs" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.slice(0, 3).map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group"
              >
                <div className="overflow-hidden h-56">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070";
                    }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition">
                    {blog.title}
                  </h3>
                  <Link
                    to={`/blogs/${blog._id}`}
                    className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              to="/blogs"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:shadow-xl hover:scale-105 transition transform"
            >
              View All Blogs →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Developers */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-16">Meet The Developers</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl w-64 hover:-translate-y-2 transition duration-300 border border-white/10"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                  {dev.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {dev.name}
                </h3>
                <p className="text-blue-300 font-mono text-sm tracking-widest">
                  {dev.id}
                </p>
                <p className="text-gray-400 text-xs mt-2 font-bold uppercase">
                  {dev.varsity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-10 text-center text-sm font-medium">
        <p>&copy; 2025 MindConnect. Built with ❤️ for better mental health.</p>
      </footer>

      {/* ✅ ফিক্স ৪: চ্যাটবট যুক্ত করা হয়েছে */}
      <AiChatBot />
    </div>
  );
};

export default LandingPage;