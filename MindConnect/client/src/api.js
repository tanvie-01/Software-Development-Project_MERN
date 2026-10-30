import axios from "axios";

// ব্যাকএন্ড URL .env থেকে (VITE_API_URL), না থাকলে লাইভ সার্ভার
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://mindconnect-backend-afyf.onrender.com",
});

// প্রতিটা রিকোয়েস্টে লগইন টোকেন যোগ করা
api.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch {
    // localStorage এ ভুল ডাটা থাকলে টোকেন ছাড়াই যাবে
  }
  return config;
});

// টোকেন এক্সপায়ার/ইনভ্যালিড হলে লগআউট করে লগইন পেজে পাঠানো
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("userInfo")) {
      const url = error.config?.url || "";
      if (!url.includes("/login") && !url.includes("/delete-account")) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
