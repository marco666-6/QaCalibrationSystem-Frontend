import apiClient from "./client";

export async function getSavingsAccounts(params) {
  const response = await apiClient.get("/savings-transactions/accounts", { params });
  return response.data;
}

export async function getWithdrawalRequests(params) {
  const response = await apiClient.get("/request-approvals/withdrawals", { params });
  return response.data;
}

export async function getSavingsTransactions(params) {
  const response = await apiClient.get("/savings-transactions", { params });
  return response.data;
}

export async function approveWithdrawalRequest(requestId, data) {
  const response = await apiClient.post(`/request-approvals/withdrawals/${requestId}/approve`, data);
  return response.data;
}

export async function rejectWithdrawalRequest(requestId, data) {
  const response = await apiClient.post(`/request-approvals/withdrawals/${requestId}/reject`, data);
  return response.data;
}

export async function createSavingsTransaction(data) {
  const response = await apiClient.post("/savings-transactions", data);
  return response.data;
}

export async function deleteSavingsTransaction(id) {
  const response = await apiClient.delete(`/savings-transactions/${id}`);
  return response.data;
}
