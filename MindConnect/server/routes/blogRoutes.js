const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// ১. সব ব্লগ পাওয়ার জন্য (Public)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ২. নির্দিষ্ট একটি ব্লগের বিস্তারিত পাওয়ার জন্য (Details Page) - NEW ✅
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

// ৩. নতুন ব্লগ লেখার জন্য (Admin/Doctor)
router.post("/", async (req, res) => {
  const { title, content, image, author } = req.body;
  try {
    const newBlog = new Blog({ title, content, image, author });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;