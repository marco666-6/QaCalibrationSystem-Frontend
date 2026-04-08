import apiClient from "./client";

export async function getMyProfile() {
  const response = await apiClient.get("/profile");
  return response.data;
}

export async function updateMyProfile(data) {
  const response = await apiClient.put("/profile", data);
  return response.data;
}
