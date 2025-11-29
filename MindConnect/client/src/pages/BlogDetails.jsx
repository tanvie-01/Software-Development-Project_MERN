import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(
          `https://mindconnect-backend-afyf.onrender.com/api/blogs/${id}`
        );
        setBlog(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog)
    return (
      <div className="text-center mt-20 text-xl font-bold text-gray-500">
        Loading Article...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
          >
            MindConnect
          </Link>
          <Link
            to="/blogs"
            className="text-gray-600 hover:text-blue-600 font-bold"
          >
            ← Back to Blogs
          </Link>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative h-80 md:h-[400px]">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-3">
                MENTAL HEALTH
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {blog.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{blog.author}</p>
                  <p className="text-xs text-gray-500">Author & Specialist</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="prose max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-serif">
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
