import apiClient from "./client";

export async function getLoanProducts(params) {
  const response = await apiClient.get("/loan-products", { params });
  return response.data;
}

export async function getLoanProduct(id) {
  const response = await apiClient.get(`/loan-products/${id}`);
  return response.data;
}

export async function createLoanProduct(data) {
  const response = await apiClient.post("/loan-products", data);
  return response.data;
}

export async function updateLoanProduct(id, data) {
  const response = await apiClient.put(`/loan-products/${id}`, data);
  return response.data;
}
