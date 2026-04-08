import apiClient from "./client";

export async function getDashboard() {
  const response = await apiClient.get("/reports/dashboard");
  return response.data;
}

export async function getSalesSummary(params) {
  const response = await apiClient.get("/reports/sales-summary", { params });
  return response.data;
}

export async function getMemberBalances(params) {
  const response = await apiClient.get("/reports/member-balances", { params });
  return response.data;
}

export async function getLowStockProducts(params) {
  const response = await apiClient.get("/reports/low-stock-products", { params });
  return response.data;
}
