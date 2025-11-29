import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setName(parsedUser.name);
      setEmail(parsedUser.email);
    } else navigate("/login");
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match!");
    try {
      const { data } = await axios.put(
        "https://mindconnect-backend-afyf.onrender.com/api/users/profile",
        { _id: user._id, name, email, password: password || undefined }
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Profile Updated Successfully! 🎉");
      setPassword("");
      setConfirmPassword("");
    } catch (e) {
      alert("Update Failed");
    }
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) return alert("Enter password");
    try {
      await axios.post(
        `https://mindconnect-backend-afyf.onrender.com/api/users/delete-account`,
        { userId: user._id, password: deletePassword }
      );
      toast.warning("Account Deleted. Goodbye! 👋");
      localStorage.removeItem("userInfo");
      navigate("/login");
    } catch (e) {
      alert("Wrong Password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
            <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg border-4 border-white/30">
              {name.charAt(0)}
            </div>
            <h2 className="text-3xl font-bold">{name}</h2>
            <p className="opacity-80">{email}</p>
          </div>

          <div className="p-8 md:p-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Edit Profile Details
            </h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-gray-600 font-bold mb-2 text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-2 text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border p-3.5 rounded-xl bg-gray-100 cursor-not-allowed text-gray-500"
                  value={email}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 font-bold mb-2 text-sm">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full border p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none transition"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-2 text-sm">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full border p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none transition"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Save Changes
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
              <p className="text-gray-500 text-sm mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-50 text-red-600 font-bold py-2.5 px-6 rounded-xl hover:bg-red-600 hover:text-white transition border border-red-100"
              >
                Delete Account
              </button>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-blue-600 font-bold"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative animate-bounce-in">
            <h3 className="text-xl font-bold mb-2 text-red-600">
              Delete Account?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter password to confirm.
            </p>
            <input
              type="password"
              className="w-full border p-3 rounded-lg mb-4 focus:ring-2 ring-red-500 outline-none"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
