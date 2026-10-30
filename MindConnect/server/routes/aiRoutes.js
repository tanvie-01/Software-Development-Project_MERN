const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("../middleware/rateLimit");

// API Key চেক
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 10;

// প্রতি IP তে মিনিটে সর্বোচ্চ ১০টা মেসেজ (Gemini কোটা বাঁচানোর জন্য)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many messages. Please wait a minute and try again.",
});

router.post("/chat", chatLimiter, async (req, res) => {
  const { userMessage, history } = req.body;

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)` });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // হিস্ট্রি ফরম্যাট ঠিক করা (Google এর নিয়ম অনুযায়ী)
    let formattedHistory = [];

    if (Array.isArray(history)) {
      formattedHistory = history
        .slice(-MAX_HISTORY)
        .filter((msg) => typeof msg?.parts?.[0]?.text === "string")
        .map((msg) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.parts[0].text.slice(0, MAX_MESSAGE_LENGTH) }],
        }));

      // প্রথম মেসেজ যদি 'model' হয়, সেটা ডিলিট করে দিচ্ছি (Role Error ফিক্স)
      while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
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
    res.status(500).json({ message: "AI server error" });
  }
});

module.exports = router;
