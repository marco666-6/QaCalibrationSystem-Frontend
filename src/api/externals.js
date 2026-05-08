import apiClient from "./client";

export async function getExternals() {
  const response = await apiClient.get("/externals");
  return response.data;
}

export async function getExternalById(id) {
  const response = await apiClient.get(`/externals/${id}`);
  return response.data;
}

export async function createExternal(data) {
  const response = await apiClient.post("/externals", data);
  return response.data;
}

export async function updateExternal(id, data) {
  const response = await apiClient.put(`/externals/${id}`, data);
  return response.data;
}

export async function deleteExternal(id) {
  const response = await apiClient.delete(`/externals/${id}`);
  return response.data;
}
