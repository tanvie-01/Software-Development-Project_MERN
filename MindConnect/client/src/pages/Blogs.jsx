import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(data);
      } catch (error) { console.error("Error:", error); }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg p-4 sticky top-0 z-40 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">MindConnect 🌿</Link>
          <div className="flex gap-4">
             <Link to="/" className="hover:text-blue-200 transition font-medium">Home</Link>
             <Link to="/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition font-medium">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-5xl font-extrabold mb-4 relative z-10">Health & Wellness Hub</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto relative z-10">Expert advice, tips, and insights to help you live a balanced and happy life.</p>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto p-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
              <div className="h-56 overflow-hidden relative">
                 <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070'; }} />
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                    HEALTH
                 </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 hover:text-purple-600 transition cursor-pointer line-clamp-2">
                  <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                </h2>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                  {blog.content}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {blog.author.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{blog.author}</span>
                  </div>
                  <Link to={`/blogs/${blog._id}`} className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg transition transform hover:scale-105">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;