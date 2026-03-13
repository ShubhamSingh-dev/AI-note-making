import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import type {
  LoginFormData,
  RegisterUserFormData,
} from "@/schemas/auth.schema";
import { loginApi , registerApi, logoutApi } from "@/api/auth.api";

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
    onError: (error: Error) => {
      const message = error instanceof Error ? error.message : "Login failed";

      toast.error(message);
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

    onError: (error: Error) => {
      const message =
        error instanceof Error ? error.message : "Registration failed";

      toast.error(message);
    },
  });
};

//logout
export const useLogout = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      navigate("/login");
    },
    onError: () => {
      clearAuth();
      navigate("/login");
    },
  });
};
