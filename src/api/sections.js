import apiClient from "./client";

export async function getSections(params) {
  const response = await apiClient.get("/sections", { params });
  return response.data;
}

export async function getSectionOptions(params) {
  const response = await apiClient.get("/sections/options", { params });
  return response.data;
}

export async function createSection(data) {
  const response = await apiClient.post("/sections", data);
  return response.data;
}

export async function updateSection(id, data) {
  const response = await apiClient.put(`/sections/${id}`, data);
  return response.data;
}

export async function deleteSection(id) {
  const response = await apiClient.delete(`/sections/${id}`);
  return response.data;
}
