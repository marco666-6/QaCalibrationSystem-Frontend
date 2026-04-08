import apiClient from "./client";

export async function getSavingsProducts(params) {
  const response = await apiClient.get("/savings-products", { params });
  return response.data;
}

export async function getSavingsProduct(id) {
  const response = await apiClient.get(`/savings-products/${id}`);
  return response.data;
}

export async function createSavingsProduct(data) {
  const response = await apiClient.post("/savings-products", data);
  return response.data;
}

export async function updateSavingsProduct(id, data) {
  const response = await apiClient.put(`/savings-products/${id}`, data);
  return response.data;
}
