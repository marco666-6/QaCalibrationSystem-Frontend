import apiClient from "./client";

export async function getDefaultLocations() {
  const response = await apiClient.get("/default-locations");
  return response.data;
}

export async function getDefaultLocationById(id) {
  const response = await apiClient.get(`/default-locations/${id}`);
  return response.data;
}

export async function createDefaultLocation(data) {
  const response = await apiClient.post("/default-locations", data);
  return response.data;
}

export async function updateDefaultLocation(id, data) {
  const response = await apiClient.put(`/default-locations/${id}`, data);
  return response.data;
}

export async function deleteDefaultLocation(id) {
  const response = await apiClient.delete(`/default-locations/${id}`);
  return response.data;
}
