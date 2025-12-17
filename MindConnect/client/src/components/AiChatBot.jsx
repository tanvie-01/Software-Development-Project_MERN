import { useState } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! I'm your MindConnect AI friend. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // লাইভ সার্ভারের লিংক
  const API_URL = "https://mindconnect-backend-afyf.onrender.com";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/ai/chat`, {
        userMessage: input,
        // হিস্ট্রি পাঠানোর লজিক (Context মনে রাখার জন্য)
        history: newMessages.slice(-5).map(msg => ({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.text }]
        })) 
      });

      setMessages([...newMessages, { role: "model", text: data.reply }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: "model", text: "Sorry, server is busy. Please try again later." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="font-sans">
      {/* চ্যাট আইকন বাটন: মোবাইলে একটু ছোট, পিসিতে বড় */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-3 md:p-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-bounce"
        >
          <FaRobot size={24} className="md:text-2xl" />
        </button>
      )}

      {/* চ্যাট বক্স: মোবাইলে ফুল উইডথ নিচে, পিসিতে ডান কোণায় পপ-আপ */}
      {isOpen && (
        <div className="fixed z-[9999] 
          /* Mobile Styles: নিচে লেগে থাকবে, ফুল স্ক্রিন চওড়া */
          bottom-0 right-0 w-full h-[85vh] rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.2)]
          /* Desktop Styles (md): ডান কোণায় ভাসবে */
          md:bottom-6 md:right-6 md:w-96 md:h-[500px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200
          bg-white flex flex-col overflow-hidden animate-fade-in-up"
        >
          {/* হেডার */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <FaRobot className="text-xl" />
              <div>
                <h3 className="font-bold text-md">MindConnect AI</h3>
                <p className="text-[10px] opacity-80">Always here to help</p>
              </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-1.5 rounded-full transition"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* মেসেজ এরিয়া */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full animate-pulse">
                        Thinking...
                    </div>
                </div>
            )}
          </div>

          {/* ইনপুট এরিয়া */}
          <div className="p-3 border-t bg-white flex gap-2 items-center shrink-0 safe-area-pb">
            <input
              type="text"
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading}
              className={`p-3 rounded-full text-white transition shadow-md ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatBot;