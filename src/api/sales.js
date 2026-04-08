import apiClient from "./client";

export async function getSales(params) {
  const response = await apiClient.get("/sales", { params });
  return response.data;
}

export async function getSaleReceipt(id) {
  const response = await apiClient.get(`/sales/${id}/receipt`);
  return response.data;
}

export async function createSale(data) {
  const response = await apiClient.post("/sales", data);
  return response.data;
}

export async function convertSaleToLoan(id, data) {
  const response = await apiClient.post(`/sales/${id}/convert-to-loan`, data);
  return response.data;
}
