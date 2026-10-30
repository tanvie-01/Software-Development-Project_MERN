const jwt = require("jsonwebtoken");
const User = require("../models/User");

// লগইন করা ইউজার চেক (Authorization: Bearer <token>)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// নির্দিষ্ট রোল ছাড়া এক্সেস বন্ধ (যেমন: authorize("admin"))
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// নিজের ডাটা অথবা অ্যাডমিন
const isSelfOrAdmin = (req, userId) =>
  req.user.role === "admin" || req.user._id.toString() === String(userId);

module.exports = { protect, authorize, isSelfOrAdmin };
