import apiClient from "./client";

export async function getCalibPlans(params) {
  const response = await apiClient.get("/calib-plans", { params });
  return response.data;
}

export async function getCalibPlanById(id) {
  const response = await apiClient.get(`/calib-plans/${id}`);
  return response.data;
}

export async function getCalibPlanFull(id) {
  const response = await apiClient.get(`/calib-plans/${id}/full`);
  return response.data;
}

export async function createCalibPlan(data) {
  const response = await apiClient.post("/calib-plans", data);
  return response.data;
}

export async function updateCalibPlan(id, data) {
  const response = await apiClient.put(`/calib-plans/${id}`, data);
  return response.data;
}

export async function deleteCalibPlan(id) {
  const response = await apiClient.delete(`/calib-plans/${id}`);
  return response.data;
}

export async function submitCalibPlan(id) {
  const response = await apiClient.post(`/calib-plans/${id}/submit`);
  return response.data;
}

export async function lockCalibPlan(id) {
  const response = await apiClient.post(`/calib-plans/${id}/lock`);
  return response.data;
}

export async function loadPlanDueEquipments(id) {
  const response = await apiClient.post(`/calib-plans/${id}/load-due-equipments`);
  return response.data;
}

export async function upsertPlanTechnician(id, data) {
  const response = await apiClient.post(`/calib-plans/${id}/technicians`, data);
  return response.data;
}

export async function removePlanTechnician(id, technicianId) {
  const response = await apiClient.delete(`/calib-plans/${id}/technicians/${technicianId}`);
  return response.data;
}

export async function setPlanEquipmentSelected(planEquipmentId, isSelected) {
  const response = await apiClient.patch(`/calib-plans/equipments/${planEquipmentId}/selection`, { isSelected });
  return response.data;
}

export async function updatePlanSummaryRemarks(planEquipmentSummaryId, remarks) {
  const response = await apiClient.put(`/calib-plans/summaries/${planEquipmentSummaryId}/remarks`, { remarks });
  return response.data;
}

export async function approvePlanStep(id, stepNo) {
  const response = await apiClient.post(`/calib-plans/${id}/approvals`, { stepNo });
  return response.data;
}

export async function revokePlanStep(id, stepNo) {
  const response = await apiClient.delete(`/calib-plans/${id}/approvals/${stepNo}`);
  return response.data;
}

export async function generatePlanPdf(id) {
  const response = await apiClient.post(`/calib-plans/${id}/generate-pdf`);
  return response.data;
}
