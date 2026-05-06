import apiClient from "./client";

export async function loginUser({ username, password }) {
  const response = await apiClient.post("/auth/login", {
    username,
    password
  });

  return response.data;
}

export async function registerUser({
  employeeCode,
  username,
  email,
  password,
  confirmPassword
}) {
  const response = await apiClient.post("/auth/register", {
    employeeCode,
    username,
    email,
    password,
    confirmPassword
  });

  return response.data;
}

export async function forgotPassword({
  email
}) {
  const response = await apiClient.post("/auth/forgot-password", {
    email
  });

  return response.data;
}

export async function resetPassword({ token, email, newPassword, confirmNewPassword }) {
  const response = await apiClient.post("/auth/reset-password", {
    token,
    email,
    newPassword,
    confirmNewPassword
  });

  return response.data;
}

export async function changePassword({
  currentPassword,
  newPassword,
  confirmNewPassword
}) {
  const response = await apiClient.post("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmNewPassword
  });

  return response.data;
}
