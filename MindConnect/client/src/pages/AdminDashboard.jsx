import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    appointments: 0,
    income: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editDocId, setEditDocId] = useState(null);

  const [docData, setDocData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    degree: "",
    medicalCollege: "",
    currentHospital: "",
    experience: "",
    feesPerConsultation: "",
  });

  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role !== "admin") navigate("/");
      fetchStats();
      fetchAppointments();
      fetchDoctors();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        "https://mindconnect-backend-afyf.onrender.com/api/users/stats"
      );
      setStats(data);
    } catch (e) {}
  };
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(
        "https://mindconnect-backend-afyf.onrender.com/api/appointments"
      );
      setAppointments(data);
    } catch (e) {}
  };
  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(
        "https://mindconnect-backend-afyf.onrender.com/api/doctors"
      );
      setDoctors(data);
    } catch (e) {}
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `https://mindconnect-backend-afyf.onrender.com/api/appointments/${id}`,
        { status }
      );
      fetchAppointments();
      fetchStats();
      toast.success(`Appointment ${status} successfully! ✅`);
    } catch (e) {
      toast.error("Failed to update status ❌");
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `https://mindconnect-backend-afyf.onrender.com/api/doctors/${editDocId}`,
          docData
        );
        toast.success("Doctor Updated Successfully! 👨‍⚕️");
      } else {
        await axios.post(
          "https://mindconnect-backend-afyf.onrender.com/api/doctors/add",
          docData
        );
        toast.success("New Doctor Added! 🎉");
      }
      setDocData({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        degree: "",
        medicalCollege: "",
        currentHospital: "",
        experience: "",
        feesPerConsultation: "",
      });
      setIsEditing(false);
      fetchDoctors();
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save doctor");
    }
  };

  const handleEditClick = (doc) => {
    setDocData({
      name: doc.name || "",
      email: "",
      password: "",
      phone: doc.phone || "",
      specialization: doc.specialization || "",
      degree: doc.degree || "",
      medicalCollege: doc.medicalCollege || "",
      currentHospital: doc.currentHospital || "",
      experience: doc.experience || "",
      feesPerConsultation: doc.feesPerConsultation || "",
    });
    setEditDocId(doc._id);
    setIsEditing(true);
    setActiveTab("add-doctor");
    toast.info("Editing Doctor Details 📝");
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Delete this doctor?")) {
      try {
        await axios.delete(
          `https://mindconnect-backend-afyf.onrender.com/api/doctors/${id}`
        );
        fetchDoctors();
        fetchStats();
        toast.warning("Doctor Deleted 🗑️");
      } catch (e) {
        toast.error("Error deleting doctor");
      }
    }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      await axios.post(
        "https://mindconnect-backend-afyf.onrender.com/api/blogs",
        {
          title: blogTitle,
          content: blogContent,
          image: blogImage,
          author: userInfo.name,
        }
      );
      toast.success("Blog Posted Successfully! ✍️");
      setBlogTitle("");
      setBlogContent("");
      setBlogImage("");
    } catch (e) {
      toast.error("Failed to post blog");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-2xl min-h-screen p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-10 px-2">
            Admin Panel
          </h2>
          <nav className="space-y-3">
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "appointments", label: "📅 Appointments" },
              { id: "doctors", label: "👨‍⚕️ Manage Doctors" },
              { id: "add-doctor", label: "➕ Add Doctor" },
              { id: "write-blog", label: "✍️ Write Blog" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:bg-gray-100 hover:pl-7"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-2">
            {/* ✅ আপডেট: হোম বাটন যোগ করা হয়েছে */}
            <button
            onClick={() => navigate("/")}
            className="w-full text-left px-5 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-bold transition flex items-center gap-2"
            >
            🏠 Home Page
            </button>

            <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition flex items-center gap-2"
            >
            ⬅ Go to User Dashboard
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  title: "Total Patients",
                  value: stats.users,
                  color: "from-blue-500 to-blue-400",
                  icon: "👥",
                },
                {
                  title: "Total Doctors",
                  value: stats.doctors,
                  color: "from-green-500 to-emerald-400",
                  icon: "🩺",
                },
                {
                  title: "Appointments",
                  value: stats.appointments,
                  color: "from-purple-500 to-indigo-400",
                  icon: "📅",
                },
                {
                  title: "Total Income",
                  value: `${stats.income} BDT`,
                  color: "from-orange-500 to-amber-400",
                  icon: "💰",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl shadow-xl text-white transform hover:-translate-y-2 transition duration-300`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium opacity-90">
                      {item.title}
                    </h3>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <p className="text-4xl font-extrabold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments */}
        {activeTab === "appointments" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Manage Appointments
            </h2>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Patient Info</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Fee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">
                          {appt.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appt.userEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {appt.doctorName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <p className="font-medium">{appt.date}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                          {appt.time}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {appt.fee} ৳
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
                          ${
                            appt.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : appt.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : appt.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {appt.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(appt._id, "approved")
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(appt._id, "cancelled")
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctors List */}
        {activeTab === "doctors" && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {doc.specialization}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.phone}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEditClick(doc)}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Doctor Form (Updated with New Fields) */}
        {activeTab === "add-doctor" && (
          <div className="max-w-3xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {isEditing ? "Edit Doctor Details" : "Add New Doctor"}
            </h2>
            <form
              onSubmit={handleDoctorSubmit}
              className="grid grid-cols-2 gap-6"
            >
              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Full Name"
                value={docData.name}
                onChange={(e) =>
                  setDocData({ ...docData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Phone"
                value={docData.phone}
                onChange={(e) =>
                  setDocData({ ...docData, phone: e.target.value })
                }
                required
              />

              {!isEditing && (
                <>
                  <input
                    type="email"
                    className="border p-3 rounded-xl"
                    placeholder="Email"
                    value={docData.email}
                    onChange={(e) =>
                      setDocData({ ...docData, email: e.target.value })
                    }
                    required
                  />
                  <input
                    type="password"
                    className="border p-3 rounded-xl"
                    placeholder="Password"
                    value={docData.password}
                    onChange={(e) =>
                      setDocData({ ...docData, password: e.target.value })
                    }
                    required
                  />
                </>
              )}

              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Specialization (e.g. Neurologist)"
                value={docData.specialization}
                onChange={(e) =>
                  setDocData({ ...docData, specialization: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Degree (e.g. MBBS)"
                value={docData.degree}
                onChange={(e) =>
                  setDocData({ ...docData, degree: e.target.value })
                }
                required
              />

              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Medical College"
                value={docData.medicalCollege}
                onChange={(e) =>
                  setDocData({ ...docData, medicalCollege: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Current Hospital"
                value={docData.currentHospital}
                onChange={(e) =>
                  setDocData({ ...docData, currentHospital: e.target.value })
                }
                required
              />

              <input
                type="text"
                className="border p-3 rounded-xl"
                placeholder="Experience"
                value={docData.experience}
                onChange={(e) =>
                  setDocData({ ...docData, experience: e.target.value })
                }
                required
              />
              <input
                type="number"
                className="border p-3 rounded-xl"
                placeholder="Fees (BDT)"
                value={docData.feesPerConsultation}
                onChange={(e) =>
                  setDocData({
                    ...docData,
                    feesPerConsultation: e.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-[1.01]"
              >
                {isEditing ? "Update Doctor Info" : "Create Account"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "write-blog" && (
          <div className="max-w-3xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              Write Blog
            </h2>
            <form onSubmit={handlePostBlog} className="space-y-4">
              <input
                type="text"
                className="w-full border p-4 rounded-xl"
                placeholder="Title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="w-full border p-4 rounded-xl"
                placeholder="Image URL"
                value={blogImage}
                onChange={(e) => setBlogImage(e.target.value)}
                required
              />
              <textarea
                className="w-full border p-4 rounded-xl h-40"
                placeholder="Content..."
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                required
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-blue-700"
              >
                Publish
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;