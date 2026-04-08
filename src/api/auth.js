import apiClient from "./client";

const TENANT_CODE = import.meta.env.VITE_TENANT_CODE || "demo_ksp";

export const getTenantCode = () => TENANT_CODE;

export async function loginUser({ username, password, tenantCode = TENANT_CODE }) {
  const response = await apiClient.post("/auth/login", {
    tenantCode,
    username,
    password
  });

  return response.data;
}

export async function registerMember({
  memberNo,
  username,
  email,
  password,
  confirmPassword,
  tenantCode = TENANT_CODE
}) {
  const response = await apiClient.post("/auth/register-member", {
    tenantCode,
    memberNo,
    username,
    email,
    password,
    confirmPassword
  });

  return response.data;
}

export async function forgotPassword({
  usernameOrEmail,
  tenantCode = TENANT_CODE
}) {
  const response = await apiClient.post("/auth/forgot-password", {
    tenantCode,
    usernameOrEmail
  });

  return response.data;
}

export async function resetPassword({ resetToken, newPassword, confirmNewPassword }) {
  const response = await apiClient.post("/auth/reset-password", {
    resetToken,
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
