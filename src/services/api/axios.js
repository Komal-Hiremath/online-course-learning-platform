import axios from "axios";
export const BASE_URL = "https://mockapi-mauve.vercel.app/api/v1"; //base_url

//axios instance
// use create method for creating axios instances
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

//This interceptors concepts in reactjs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  return config;
  },
  // (error) => Promise.reject(error)
);

//response 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      error,
      error.response?.status,
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export default api;