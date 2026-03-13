import api from "@/lib/axios";
import type {
  LoginFormData,
  RegisterUserFormData,
} from "@/schemas/auth.schema";

export const registerApi = async (
  data: Omit<RegisterUserFormData, "confirmPassword">
) => {
  const response = await api.post("/users/register", {
    username: data.username,
    email: data.email,
    password: data.password,
  });

  return response.data;
};

export const loginApi = async (data: LoginFormData) => {
  const response = await api.post("/users/login", {
    email: data.email,
    password: data.password,
  });

  return response.data;
};

export const logoutApi = async () => {
  const response = await api.get("/users/logout");
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get("/users/current-user");
  return response.data;
};

export const refreshTokenApi = async () => {
  const response = await api.post("/users/refresh-token");
  return response.data;
};
