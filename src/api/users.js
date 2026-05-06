import apiClient from "./client";

export async function getUsers(params) {
  const response = await apiClient.get("/users", { params });
  return response.data;
}

export async function getUserById(id) {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

export async function getUserOptions(params) {
  const response = await apiClient.get("/users/options", { params });
  return response.data;
}

export async function createUser(data) {
  const response = await apiClient.post("/users", data);
  return response.data;
}

export async function updateUser(id, data) {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}

export async function resetUserPassword(id, data) {
  const response = await apiClient.post(`/users/${id}/reset-password`, data);
  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}
