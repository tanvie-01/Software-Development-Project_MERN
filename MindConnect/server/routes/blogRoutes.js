const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { protect, authorize } = require("../middleware/authMiddleware");

// ১. সব ব্লগ পাওয়ার জন্য (Public)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. নির্দিষ্ট একটি ব্লগের বিস্তারিত পাওয়ার জন্য (Details Page)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ৩. নতুন ব্লগ লেখার জন্য (Admin/Doctor) — লেখকের নাম টোকেন থেকে নেওয়া হয়
router.post("/", protect, authorize("admin", "doctor"), async (req, res) => {
  const { title, content, image } = req.body;
  try {
    if (!title || !content || !image) {
      return res.status(400).json({ message: "Title, content and image are required" });
    }
    const savedBlog = await Blog.create({ title, content, image, author: req.user.name });
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
