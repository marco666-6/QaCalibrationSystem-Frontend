import apiClient from "./client";

export async function getDefaultLocations(params) {
  const response = await apiClient.get("/defaultlocations", { params });
  return response.data;
}

export async function getDefaultLocationOptions(params) {
  const response = await apiClient.get("/defaultlocations/options", { params });
  return response.data;
}

export async function createDefaultLocation(data) {
  const response = await apiClient.post("/defaultlocations", data);
  return response.data;
}

export async function updateDefaultLocation(id, data) {
  const response = await apiClient.put(`/defaultlocations/${id}`, data);
  return response.data;
}

export async function deleteDefaultLocation(id) {
  const response = await apiClient.delete(`/defaultlocations/${id}`);
  return response.data;
}
