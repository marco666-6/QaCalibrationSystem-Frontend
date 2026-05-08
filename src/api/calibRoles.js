import apiClient from "./client";

export async function getCalibRolesByUser(userId) {
  const response = await apiClient.get(`/calib-roles/users/${userId}`);
  return response.data;
}

export async function getCalibRoleUsers(role) {
  const response = await apiClient.get(`/calib-roles/roles/${encodeURIComponent(role)}`);
  return response.data;
}

export async function assignCalibRole(data) {
  const response = await apiClient.post("/calib-roles/assign", data);
  return response.data;
}

export async function revokeCalibRole(data) {
  const response = await apiClient.post("/calib-roles/revoke", data);
  return response.data;
}
