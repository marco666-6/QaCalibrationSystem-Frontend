import apiClient from "./client";

export async function getMembers(params) {
  const response = await apiClient.get("/members", { params });
  return response.data;
}

export async function getMember(id) {
  const response = await apiClient.get(`/members/${id}`);
  return response.data;
}

export async function lookupMembers(params) {
  const response = await apiClient.get("/members/lookup", { params });
  return response.data;
}

export async function createMember(data) {
  const response = await apiClient.post("/members", data);
  return response.data;
}

export async function updateMember(id, data) {
  const response = await apiClient.put(`/members/${id}`, data);
  return response.data;
}
