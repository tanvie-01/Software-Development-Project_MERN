import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const MyAppointments = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDoctorId, setReviewDoctorId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) { setUser(JSON.parse(userInfo)); fetchAppointments(JSON.parse(userInfo)._id); } 
    else navigate("/login");
  }, [navigate]);

  const fetchAppointments = async (userId) => { try { const { data } = await axios.get(`http://localhost:5000/api/appointments/${userId}`); setAppointments(data); } catch (e) {} };
  const handleLogout = () => { localStorage.removeItem("userInfo"); navigate("/login"); };
  const openPrescription = (text) => { setSelectedPrescription(text); setShowPrescriptionModal(true); };
  const openReviewModal = (doctorId) => { setReviewDoctorId(doctorId); setShowReviewModal(true); };

  const submitReview = async () => {
    try { await axios.post(`http://localhost:5000/api/doctors/${reviewDoctorId}/reviews`, { rating, comment, userName: user.name, userId: user._id }); alert("Review Added!"); setShowReviewModal(false); } catch (e) { alert("Error"); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">MindConnect</Link>
          <div className="flex gap-4 items-center">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-10 p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-8 border-blue-600 pl-4">My Appointments</h2>

        {appointments.length > 0 ? (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <table className="min-w-full">
              <thead className="bg-blue-50">
                <tr className="text-left text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                  <th className="px-6 py-5">Doctor Name</th>
                  <th className="px-6 py-5">Date & Time</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-5 font-bold text-gray-800 text-lg">{appt.doctorName}</td>
                    <td className="px-6 py-5">
                        <div className="text-gray-900 font-medium">{appt.date}</div>
                        <div className="text-xs text-blue-500 font-bold mt-1">{appt.time}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm 
                        ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          appt.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 flex gap-3">
                      {appt.status === 'completed' && appt.prescription && (
                        <button onClick={() => openPrescription(appt.prescription)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                          <span>📄</span> Prescription
                        </button>
                      )}
                      {appt.status === 'completed' && (
                        <button onClick={() => openReviewModal(appt.doctorId)} className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-yellow-500 transition">
                          <span>⭐</span> Rate
                        </button>
                      )}
                      {appt.status !== 'completed' && <span className="text-gray-400 text-xs italic">No actions yet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center mt-12 bg-white p-12 rounded-3xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 text-xl">No appointments found.</p>
            <Link to="/dashboard" className="text-blue-600 font-bold mt-4 inline-block hover:underline">Book an Appointment Now →</Link>
          </div>
        )}
      </div>

      {/* Modals (Prescription & Review) - আগের মতোই লজিক, শুধু স্টাইল ইম্প্রুভড */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-bounce-in">
            <button onClick={() => setShowPrescriptionModal(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
            <h3 className="text-2xl font-bold text-blue-600 text-center mb-6">Medical Prescription</h3>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[150px] whitespace-pre-wrap text-gray-700 leading-relaxed font-mono">
                {selectedPrescription}
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2.5 rounded-lg font-bold shadow hover:bg-gray-900 transition mr-4">Print / PDF</button>
              <button onClick={() => setShowPrescriptionModal(false)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow hover:bg-blue-700 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-bounce-in">
            <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">Rate Your Experience</h3>
            <div className="space-y-4">
               <div>
                   <label className="block text-gray-700 font-bold mb-2">Rating</label>
                   <select className="w-full border p-3 rounded-xl focus:ring-2 ring-yellow-400 outline-none" value={rating} onChange={(e) => setRating(e.target.value)}>
                     <option value="5">5 - Excellent 😍</option>
                     <option value="4">4 - Very Good 😊</option>
                     <option value="3">3 - Good 🙂</option>
                     <option value="2">2 - Fair 😐</option>
                     <option value="1">1 - Poor 😞</option>
                   </select>
               </div>
               <div>
                   <label className="block text-gray-700 font-bold mb-2">Comment</label>
                   <textarea className="w-full border p-3 rounded-xl h-28 focus:ring-2 ring-yellow-400 outline-none" placeholder="Write your review..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
               </div>
               <div className="flex justify-end gap-3 pt-2">
                 <button onClick={() => setShowReviewModal(false)} className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
                 <button onClick={submitReview} className="bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-bold shadow hover:bg-yellow-600">Submit</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;