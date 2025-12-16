const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

// env কনফিগারেশন লোড করা
dotenv.config();

// API Key চেক
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  const { userMessage, history } = req.body;

  try {
    // 🔥 আপডেট: অফিসিয়াল ডকুমেন্ট অনুযায়ী লেটেস্ট মডেল ব্যবহার করা হলো
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // হিস্ট্রি ফরম্যাট ঠিক করা (Google এর নিয়ম অনুযায়ী)
    let formattedHistory = [];
    
    if (history && Array.isArray(history)) {
      formattedHistory = history.map(msg => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.parts[0].text }]
      }));

      // প্রথম মেসেজ যদি 'model' হয়, সেটা ডিলিট করে দিচ্ছি (Role Error ফিক্স)
      if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
        formattedHistory.shift(); 
      }
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("AI Error Details:", error); 
    res.status(500).json({ message: "AI server error", error: error.message });
  }
});

module.exports = router;