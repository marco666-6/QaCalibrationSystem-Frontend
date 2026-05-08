import apiClient from "./client";

export async function getCalibActuals(params) {
  const response = await apiClient.get("/calib-actuals", { params });
  return response.data;
}

export async function getCalibActualById(id) {
  const response = await apiClient.get(`/calib-actuals/${id}`);
  return response.data;
}

export async function getCalibActualFull(id) {
  const response = await apiClient.get(`/calib-actuals/${id}/full`);
  return response.data;
}

export async function createCalibActual(data) {
  const response = await apiClient.post("/calib-actuals", data);
  return response.data;
}

export async function startCalibActual(id) {
  const response = await apiClient.post(`/calib-actuals/${id}/start`);
  return response.data;
}

export async function completeCalibActual(id) {
  const response = await apiClient.post(`/calib-actuals/${id}/complete`);
  return response.data;
}

export async function upsertActualTechnician(id, data) {
  const response = await apiClient.post(`/calib-actuals/${id}/technicians`, data);
  return response.data;
}

export async function removeActualTechnician(id, technicianId) {
  const response = await apiClient.delete(`/calib-actuals/${id}/technicians/${technicianId}`);
  return response.data;
}

export async function replaceActualEquipments(id, items) {
  const response = await apiClient.post(`/calib-actuals/${id}/equipments/bulk`, { items });
  return response.data;
}

export async function setActualEquipmentResult(actualEquipmentId, data) {
  const response = await apiClient.put(`/calib-actuals/equipments/${actualEquipmentId}/result`, data);
  return response.data;
}

export async function updateActualSummaryRemarks(actualEquipmentSummaryId, remarks) {
  const response = await apiClient.put(`/calib-actuals/summaries/${actualEquipmentSummaryId}/remarks`, { remarks });
  return response.data;
}

export async function approveActualStep(id, stepNo) {
  const response = await apiClient.post(`/calib-actuals/${id}/approvals`, { stepNo });
  return response.data;
}

export async function revokeActualStep(id, stepNo) {
  const response = await apiClient.delete(`/calib-actuals/${id}/approvals/${stepNo}`);
  return response.data;
}

export async function generateActualPdf(id) {
  const response = await apiClient.post(`/calib-actuals/${id}/generate-pdf`);
  return response.data;
}
