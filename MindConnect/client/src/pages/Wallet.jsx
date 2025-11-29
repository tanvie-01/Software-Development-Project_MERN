import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Wallet = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]); // নতুন স্টেট
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [showGateway, setShowGateway] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchTransactions(parsedUser._id); // হিস্ট্রি কল করা
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ট্রানজেকশন ফেচ ফাংশন
  const fetchTransactions = async (userId) => {
    try {
      const { data } = await axios.get(
        `https://mindconnect-backend-afyf.onrender.com/api/transactions/${userId}`
      );
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions");
    }
  };

  const initiatePayment = () => {
    if (!amount || amount < 10) return toast.error("Minimum amount is 10 BDT");
    setShowGateway(true);
  };

  const handlePaymentSuccess = async () => {
    if (phone.length < 11 || pin.length < 4)
      return toast.error("Invalid credentials!");
    setProcessing(true);

    setTimeout(async () => {
      try {
        const { data } = await axios.put(
          "https://mindconnect-backend-afyf.onrender.com/api/users/add-money",
          {
            userId: user._id,
            amount: amount,
          }
        );

        const updatedUser = {
          ...data.user,
          token: JSON.parse(localStorage.getItem("userInfo")).token,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // ট্রানজেকশন লিস্ট আপডেট করা
        fetchTransactions(user._id);

        toast.success(`Successfully Added ${amount} BDT! 🎉`);
        setProcessing(false);
        setShowGateway(false);
        setAmount("");
        setPhone("");
        setPin("");
      } catch (error) {
        setProcessing(false);
        toast.error("Payment Failed!");
      }
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Wallet 💳</h2>
          <Link
            to="/dashboard"
            className="text-blue-600 font-bold hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <p className="text-blue-100 text-lg font-medium mb-2">
              Available Balance
            </p>
            <h1 className="text-5xl font-extrabold mb-6">
              ৳ {user.walletBalance}
            </h1>
            <div className="flex items-center justify-between opacity-80">
              <span>{user.name}</span>
              <span>MindConnect Pay</span>
            </div>
          </div>

          {/* Add Money */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add Money</h3>
            <div className="flex gap-4 mb-6">
              {["bkash", "nagad", "card"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase text-sm border-2 transition ${
                    method === m
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="w-full border-2 border-gray-200 p-4 rounded-xl text-xl font-bold text-gray-700 focus:border-blue-500 focus:outline-none mb-6"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={initiatePayment}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg"
            >
              Proceed to Pay
            </button>
          </div>
        </div>

        {/* --- TRANSACTION HISTORY SECTION (NEW) --- */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">
              Transaction History
            </h3>
          </div>
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase">
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {txn.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}{" "}
                      <span className="text-xs">
                        {new Date(txn.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          txn.type === "credit"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {txn.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        txn.type === "credit"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {txn.type === "credit" ? "+" : "-"} {txn.amount} ৳
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* ----------------------------------------- */}
      </div>

      {/* Payment Gateway Modal (Same as before) */}
      {showGateway && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div
              className={`p-6 text-center text-white ${
                method === "bkash"
                  ? "bg-pink-600"
                  : method === "nagad"
                  ? "bg-orange-600"
                  : "bg-blue-800"
              }`}
            >
              <h3 className="text-2xl font-bold uppercase">{method} Payment</h3>
              <p className="opacity-90 mt-1">Merchant: MindConnect</p>
              <p className="text-xl font-bold mt-2">৳ {amount}</p>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                className="w-full border p-3 rounded-lg font-bold text-gray-700 focus:ring-2 ring-pink-500 outline-none"
                placeholder="Account Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="password"
                className="w-full border p-3 rounded-lg font-bold text-gray-700 focus:ring-2 ring-pink-500 outline-none"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowGateway(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSuccess}
                  disabled={processing}
                  className={`flex-1 text-white py-3 rounded-lg font-bold ${
                    method === "bkash"
                      ? "bg-pink-600"
                      : method === "nagad"
                      ? "bg-orange-600"
                      : "bg-blue-800"
                  }`}
                >
                  {processing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
