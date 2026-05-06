import apiClient from "./client";

export async function getPositions(params) {
  const response = await apiClient.get("/positions", { params });
  return response.data;
}

export async function getPositionOptions(params) {
  const response = await apiClient.get("/positions/options", { params });
  return response.data;
}

export async function createPosition(data) {
  const response = await apiClient.post("/positions", data);
  return response.data;
}

export async function updatePosition(id, data) {
  const response = await apiClient.put(`/positions/${id}`, data);
  return response.data;
}

export async function deletePosition(id) {
  const response = await apiClient.delete(`/positions/${id}`);
  return response.data;
}
