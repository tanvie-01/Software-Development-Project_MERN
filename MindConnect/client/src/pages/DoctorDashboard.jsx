import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentApptId, setCurrentApptId] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");

  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      if (parsedUser.role !== "doctor") navigate("/");
      else fetchDoctorAppointments(parsedUser.name);
    } else navigate("/login");
  }, [navigate]);

  const fetchDoctorAppointments = async (doctorName) => {
    try {
      const { data } = await axios.get(
        `https://mindconnect-backend-afyf.onrender.com/api/appointments/doctor/${doctorName}`
      );
      setAppointments(data);
    } catch (e) {}
  };

  // স্ট্যাটাস আপডেট ফাংশন (Approve/Cancel/Complete)
  const handleStatusUpdate = async (id, status) => {
    if (
      status === "cancelled" &&
      !window.confirm("Are you sure you want to cancel this appointment?")
    )
      return;

    try {
      await axios.put(
        `https://mindconnect-backend-afyf.onrender.com/api/appointments/${id}`,
        { status }
      );
      fetchDoctorAppointments(user.name);
      alert(`Appointment marked as ${status}`);
      toast.success(`Status Updated to ${status}! ✅`);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://mindconnect-backend-afyf.onrender.com/api/blogs",
        {
          title: blogTitle,
          content: blogContent,
          image: blogImage,
          author: user.name,
        }
      );
      alert("Published!");
      setBlogTitle("");
      setBlogContent("");
      setBlogImage("");
    } catch (e) {
      alert("Error");
    }
  };

  const openPrescriptionModal = (id) => {
    setCurrentApptId(id);
    setShowModal(true);
  };

  const submitPrescription = async () => {
    if (!prescriptionText)
      return toast.warning("Please write a prescription! 📝");
    try {
      await axios.put(
        `https://mindconnect-backend-afyf.onrender.com/api/appointments/${currentApptId}`,
        { status: "completed", prescription: prescriptionText }
      );
      toast.success("Prescription Sent Successfully! 🎉"); // টোস্ট
      setShowModal(false);
      setPrescriptionText("");
      fetchDoctorAppointments(user.name);
    } catch (e) {
      toast.error("Error sending prescription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-2xl min-h-screen p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-600 mb-10 px-2">
            Doctor Panel
          </h2>
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full text-left px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "appointments"
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📅 My Appointments
            </button>
            <button
              onClick={() => setActiveTab("write-blog")}
              className={`w-full text-left px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "write-blog"
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ✍️ Write Blog
            </button>
          </nav>
        </div>
        <Link
          to="/dashboard"
          className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition flex items-center gap-2"
        >
          ⬅ Back to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Appointments */}
        {activeTab === "appointments" && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Patient Appointments
              </h2>
              <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-bold">
                Total: {appointments.length}
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-teal-50">
                  <tr className="text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {appt.userName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{appt.date}</div>
                        <div className="text-xs text-blue-500 font-bold">
                          {appt.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                           ${
                             appt.status === "completed"
                               ? "bg-green-100 text-green-700"
                               : appt.status === "approved"
                               ? "bg-blue-100 text-blue-700"
                               : appt.status === "cancelled"
                               ? "bg-red-100 text-red-700"
                               : "bg-yellow-100 text-yellow-700"
                           }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {/* যদি Approved হয়, তাহলে প্রেসক্রিপশন বা ক্যান্সেল করা যাবে */}
                        {appt.status === "approved" && (
                          <>
                            <button
                              onClick={() => openPrescriptionModal(appt._id)}
                              className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700 shadow-md transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(appt._id, "cancelled")
                              }
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 shadow-md transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {/* যদি Pending থাকে, ডাক্তার চাইলে ক্যান্সেল করতে পারে (অপশনাল) */}
                        {appt.status === "pending" && (
                          <span className="text-gray-400 text-xs italic">
                            Waiting for Admin Approval
                          </span>
                        )}

                        {appt.status === "completed" && (
                          <span className="text-green-600 font-bold text-sm">
                            ✅ Done
                          </span>
                        )}
                        {appt.status === "cancelled" && (
                          <span className="text-red-500 font-bold text-sm">
                            ❌ Cancelled
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

        {/* Write Blog */}
        {activeTab === "write-blog" && (
          <div className="max-w-3xl bg-white p-10 rounded-3xl shadow-2xl animate-fade-in border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
              Write Medical Article
            </h2>
            <form onSubmit={handlePostBlog} className="space-y-6">
              <input
                type="text"
                className="w-full border p-4 rounded-xl focus:ring-2 ring-teal-500 outline-none text-lg"
                placeholder="Article Title..."
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="w-full border p-4 rounded-xl focus:ring-2 ring-teal-500 outline-none"
                placeholder="Image URL..."
                value={blogImage}
                onChange={(e) => setBlogImage(e.target.value)}
                required
              />
              <textarea
                className="w-full border p-4 rounded-xl h-60 focus:ring-2 ring-teal-500 outline-none"
                placeholder="Write content..."
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                required
              ></textarea>
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition"
              >
                Publish
              </button>
            </form>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-bounce-in">
              <h3 className="text-xl font-bold mb-4 text-teal-800">
                Write Prescription 💊
              </h3>
              <textarea
                className="w-full border p-4 rounded-xl h-40 focus:ring-2 ring-teal-500 outline-none mb-6"
                placeholder="Medicines & Advice..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 px-5 py-2.5 rounded-xl font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPrescription}
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
