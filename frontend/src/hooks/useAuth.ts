import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string, createdAt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!email || !password) throw new Error("Fill in all fields");
      // Mock login — no backend needed
      await new Promise((res) => setTimeout(res, 800));
      setAuth({ id: "1", username: email.split("@")[0], email, createdAt });
      navigate("/notes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    createdAt: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!username || !email || !password)
        throw new Error("Fill in all fields");
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters");
      // Mock register — no backend needed
      await new Promise((res) => setTimeout(res, 800));
      setAuth({ id: "1", username, email, createdAt });
      navigate("/notes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return { login, register, logout, isLoading, error };
};
