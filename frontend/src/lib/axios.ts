import { backendUrl } from "@/constants/constants";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

//Instance
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API BASE URL:", api.defaults.baseURL);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "Something went wrong";

    // 401 — token expired or invalid → clear auth state and redirect to login
    if (status === 401) {
      try {
        await api.post("/users/refresh-token", {}, { withCredentials: true });
        return api.request(error.config);
      } catch (error) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message });
  }
);

export default api;
