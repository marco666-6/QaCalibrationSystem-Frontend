import apiClient from "./client";

export async function getMyProfile() {
  const response = await apiClient.get("/users/me");
  return response.data;
}

export async function updateMyProfile(data) {
  const response = await apiClient.put("/users/me", data);
  return response.data;
}
