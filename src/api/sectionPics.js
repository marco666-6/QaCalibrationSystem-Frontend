import apiClient from "./client";

export async function getSectionPics(params) {
  const response = await apiClient.get("/section-pics", { params });
  return response.data;
}

export async function getSectionPicById(id) {
  const response = await apiClient.get(`/section-pics/${id}`);
  return response.data;
}

export async function createSectionPic(data) {
  const response = await apiClient.post("/section-pics", data);
  return response.data;
}

export async function updateSectionPic(id, data) {
  const response = await apiClient.put(`/section-pics/${id}`, data);
  return response.data;
}

export async function deleteSectionPic(id) {
  const response = await apiClient.delete(`/section-pics/${id}`);
  return response.data;
}
