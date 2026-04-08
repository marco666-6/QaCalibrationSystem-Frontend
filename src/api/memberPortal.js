import apiClient from "./client";

export async function getMemberPortalProfile() {
  const response = await apiClient.get("/member-portal/me");
  return response.data;
}

export async function getMemberPortalDashboard() {
  const response = await apiClient.get("/member-portal/dashboard");
  return response.data;
}

export async function getMemberPortalSavings() {
  const response = await apiClient.get("/member-portal/savings");
  return response.data;
}

export async function getMemberPortalLoans() {
  const response = await apiClient.get("/member-portal/loans");
  return response.data;
}

export async function getMemberPortalLoanProducts() {
  const response = await apiClient.get("/member-portal/loan-products");
  return response.data;
}

export async function getMemberPortalLoanRequests(params) {
  const response = await apiClient.get("/member-portal/requests/loans", { params });
  return response.data;
}

export async function createMemberPortalLoanRequest(data) {
  const response = await apiClient.post("/member-portal/requests/loans", data);
  return response.data;
}

export async function getMemberPortalLoanPayments(params) {
  const response = await apiClient.get("/member-portal/loan-payments", { params });
  return response.data;
}

export async function getMemberPortalWithdrawalRequests(params) {
  const response = await apiClient.get("/member-portal/requests/withdrawals", { params });
  return response.data;
}

export async function getMemberPortalSavingsProducts() {
  const response = await apiClient.get("/member-portal/savings-products");
  return response.data;
}

export async function createMemberPortalWithdrawalRequest(data) {
  const response = await apiClient.post("/member-portal/requests/withdrawals", data);
  return response.data;
}

export async function getMemberPortalPurchases(params) {
  const response = await apiClient.get("/member-portal/purchases", { params });
  return response.data;
}

export async function getMemberPortalTransactions(params) {
  const response = await apiClient.get("/member-portal/transactions", { params });
  return response.data;
}
