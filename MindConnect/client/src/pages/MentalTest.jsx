import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// প্রশ্নের ভাণ্ডার (Fixed Data)
const allQuestions = [
  {
    id: 1,
    text: "How often do you feel overwhelmed by stress?",
    options: ["Never", "Sometimes", "Often", "Always"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 2,
    text: "Do you have trouble sleeping?",
    options: ["No", "Rarely", "Sometimes", "Yes, frequently"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 3,
    text: "Do you feel anxious without any specific reason?",
    options: ["Never", "Sometimes", "Often", "Always"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 4,
    text: "How would you rate your daily energy levels?",
    options: ["High", "Moderate", "Low", "Very Low"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 5,
    text: "Do you lose interest in activities you used to enjoy?",
    options: ["No", "Rarely", "Sometimes", "Yes"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 6,
    text: "Do you find it hard to concentrate?",
    options: ["No", "Sometimes", "Often", "Always"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 7,
    text: "Do you feel hopeful about the future?",
    options: ["Yes, always", "Mostly", "Rarely", "No"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 8,
    text: "Do you get angry or irritated easily?",
    options: ["No", "Sometimes", "Often", "Always"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 9,
    text: "Do you feel lonely even when around people?",
    options: ["No", "Sometimes", "Often", "Always"],
    weight: [0, 1, 2, 3],
  },
  {
    id: 10,
    text: "How often do you prioritize self-care?",
    options: ["Always", "Often", "Rarely", "Never"],
    weight: [0, 1, 2, 3],
  },
];

const MentalTest = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  // History State
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    shuffleQuestions();
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchHistory(parsedUser._id);
    }
  }, []);

  const shuffleQuestions = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
  };

  const fetchHistory = async (userId) => {
    try {
      const { data } = await axios.get(
        `https://mindconnect-backend-afyf.onrender.com/api/tests/${userId}`
      );
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history");
    }
  };

  const handleAnswer = (weight) => {
    const newScore = score + weight;
    setScore(newScore);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newScore);
    }
  };

  const calculateResult = async (finalScore) => {
    let resultText = "";
    if (finalScore <= 10)
      resultText = "Your mental health seems excellent! Keep it up. 🌟";
    else if (finalScore <= 20)
      resultText = "You have mild stress. Try meditation and rest. 🧘";
    else
      resultText = "You seem highly stressed. Consider consulting a doctor. 🩺";

    setSuggestion(resultText);
    setShowResult(true);

    if (user) {
      try {
        await axios.post(
          "https://mindconnect-backend-afyf.onrender.com/api/tests/save",
          {
            userId: user._id,
            userName: user.name,
            score: finalScore,
            suggestion: resultText,
          }
        );
        fetchHistory(user._id);
      } catch (error) {
        console.error("Failed to save result");
      }
    }
  };

  const resetTest = () => {
    setScore(0);
    setCurrentQuestion(0);
    setShowResult(false);
    shuffleQuestions();
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (questions.length === 0)
    return (
      <div className="text-center mt-20 text-white font-bold text-xl">
        Loading Questions...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans">
      {/* --- 1. Navbar Added --- */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer"
          >
            MindConnect
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center py-10 px-4">
        {/* --- Back Button --- */}
        <div className="w-full max-w-2xl mb-6 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition"
          >
            ← Go Back
          </button>
        </div>

        {/* --- GAME CARD --- */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center relative overflow-hidden mb-10 border-4 border-white">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 relative z-10">
            🧠 Mental Health Checkup
          </h1>

          {!showResult ? (
            <div className="relative z-10 animate-fade-in-up">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Question {currentQuestion + 1}</span>
                  <span>{questions.length} Total</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-10 min-h-[80px] flex items-center justify-center leading-snug">
                {questions[currentQuestion].text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleAnswer(questions[currentQuestion].weight[index])
                    }
                    className="bg-gray-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-sm border border-gray-200 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10 animate-zoom-in">
              <div className="text-7xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Checkup Complete!
              </h2>
              <p className="text-gray-500 mb-8">Here is your wellness report</p>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100 mb-8 shadow-inner">
                <p className="text-5xl font-black text-blue-600 mb-3">
                  {score}{" "}
                  <span className="text-xl text-gray-400 font-medium">
                    / 30
                  </span>
                </p>
                <p className="text-xl font-semibold text-gray-700">
                  {suggestion}
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <button
                  onClick={resetTest}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition shadow-sm"
                >
                  Retake Test
                </button>
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  Back to Dashboard
                </Link>
              </div>

              {!user && (
                <p className="mt-6 text-sm text-red-500 bg-red-50 py-2 px-4 rounded-lg inline-block">
                  Note: Please{" "}
                  <Link to="/login" className="underline font-bold">
                    Login
                  </Link>{" "}
                  to save your history.
                </p>
              )}
            </div>
          )}
        </div>

        {/* --- HISTORY SECTION --- */}
        {user && history.length > 0 && (
          <div className="w-full max-w-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
              Previous History
            </h3>
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1">
                      {new Date(item.createdAt).toLocaleDateString()}{" "}
                      <span className="text-gray-400 font-normal">
                        at {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {item.suggestion}
                    </p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-2xl font-black text-purple-600">
                      {item.score}
                    </span>
                    <span className="text-xs text-gray-400 block font-bold">
                      SCORE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalTest;
