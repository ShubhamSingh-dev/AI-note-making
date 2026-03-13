import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import type {
  LoginFormData,
  RegisterUserFormData,
} from "@/schemas/auth.schema";
import { loginApi, registerApi, logoutApi } from "@/api/auth.api";

interface ApiError {
  status: number;
  message: string;
}

//login
export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: (data: LoginFormData) => loginApi(data),
    onSuccess: (response) => {
      setAuth(response.data.user);
      toast.success(`Welcome back, ${response.data.user.username}!`);
      navigate("/notes");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Login failed");
    },
  });
};

//register
export const useRegister = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["register"],
    mutationFn: (data: Omit<RegisterUserFormData, "confirmPassword">) =>
      registerApi(data),

    onSuccess: (response) => {
      setAuth(response.data.user);
      toast.success("Account created! Welcome to Notiq 🎉");
      navigate("/notes");
    },

    onError: (error: ApiError) => {
      toast.error(error.message ?? "Registration failed");
    },
  });
};

//logout
export const useLogout = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate("/login");
    },
    onError: () => {
      queryClient.clear();
      clearAuth();
      navigate("/login");
    },
  });
};
