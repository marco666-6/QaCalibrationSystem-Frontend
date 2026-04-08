import apiClient from "./client";

export async function getInternalUsers(params) {
  const response = await apiClient.get("/users", { params });
  return response.data;
}

export async function createInternalUser(data) {
  const response = await apiClient.post("/users", data);
  return response.data;
}

export async function updateInternalUser(id, data) {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}

export async function resetInternalUserPassword(id, data) {
  const response = await apiClient.post(`/users/${id}/reset-password`, data);
  return response.data;
}

export async function deleteInternalUser(id) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}
