import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7163/swagger/index.html",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
