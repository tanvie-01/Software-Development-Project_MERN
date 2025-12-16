import { useState } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! I'm your MindConnect AI friend. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ব্যাকএন্ড লিঙ্ক (.env থেকে নেওয়া)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // AI কে রিকোয়েস্ট পাঠানো
      const { data } = await axios.post(`${API_URL}/api/ai/chat`, {
        userMessage: input,
        // আমরা শুধু শেষ ৫টা মেসেজ পাঠাবো যাতে কনটেক্সট মনে রাখে
        history: newMessages.slice(-5).map(msg => ({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.text }]
        })) 
      });

      setMessages([...newMessages, { role: "model", text: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "model", text: "Sorry, I am having trouble connecting right now." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* চ্যাট আইকন বাটন */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all animate-bounce"
        >
          <FaRobot size={24} />
        </button>
      )}

      {/* চ্যাট বক্স */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col border border-gray-200">
          {/* হেডার */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot />
              <span className="font-semibold">MindConnect AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          {/* মেসেজ এরিয়া */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-gray-500 ml-2">MindConnect AI is typing...</div>}
          </div>

          {/* ইনপুট এরিয়া */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-600"
              placeholder="Tell me how you feel..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatBot;