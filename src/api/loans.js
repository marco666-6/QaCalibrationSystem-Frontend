import apiClient from "./client";

export async function getLoans(params) {
  const response = await apiClient.get("/loans", { params });
  return response.data;
}

export async function getLoanRequests(params) {
  const response = await apiClient.get("/request-approvals/loans", { params });
  return response.data;
}

export async function createLoan(data) {
  const response = await apiClient.post("/loans", data);
  return response.data;
}

export async function approveLoanRequest(requestId, data) {
  const response = await apiClient.post(`/request-approvals/loans/${requestId}/approve`, data);
  return response.data;
}

export async function rejectLoanRequest(requestId, data) {
  const response = await apiClient.post(`/request-approvals/loans/${requestId}/reject`, data);
  return response.data;
}

export async function deleteLoan(loanId) {
  const response = await apiClient.delete(`/loans/${loanId}`);
  return response.data;
}

export async function getLoanPayments(params) {
  const response = await apiClient.get("/loans/payments", { params });
  return response.data;
}

export async function createLoanPayment(loanId, data) {
  const response = await apiClient.post(`/loans/${loanId}/payments`, data);
  return response.data;
}

export async function deleteLoanPayment(paymentId) {
  const response = await apiClient.delete(`/loans/payments/${paymentId}`);
  return response.data;
}
