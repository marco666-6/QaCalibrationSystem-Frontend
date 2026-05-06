// src/api/equipments.js
import apiClient from "./client";

export async function getEquipments(params) {
  const response = await apiClient.get("/equipments", { params });
  return response.data;
}

export async function getEquipmentNameSummary() {
  const response = await apiClient.get("/equipments/summary-by-name");
  return response.data;
}

export async function getEquipmentById(id) {
  const response = await apiClient.get(`/equipments/${id}`);
  return response.data;
}

export async function createEquipment(data) {
  const response = await apiClient.post("/equipments", data);
  return response.data;
}

export async function updateEquipment(id, data) {
  const response = await apiClient.put(`/equipments/${id}`, data);
  return response.data;
}

export async function deleteEquipment(id) {
  const response = await apiClient.delete(`/equipments/${id}`);
  return response.data;
}

export async function deleteEquipmentsBulk(data) {
  // data: { equipmentIds: number[] }
  const response = await apiClient.post("/equipments/bulk-delete", data);
  return response.data;
}

export async function bulkChangeEquipmentSection(data) {
  // data: { equipmentIds: number[], sectionId: number }
  const response = await apiClient.post("/equipments/bulk-section-change", data);
  return response.data;
}

export async function bulkChangeEquipmentPic(data) {
  // data: { equipmentIds: number[], picId: number, picCode?: string }
  const response = await apiClient.post("/equipments/bulk-pic-change", data);
  return response.data;
}

export async function bulkChangeEquipmentStatus(data) {
  // data: { equipmentIds: number[], equipmentStatus: string }
  const response = await apiClient.post("/equipments/bulk-status-change", data);
  return response.data;
}

export async function importEquipments(formData) {
  // formData: FormData with file field named "file"
  const response = await apiClient.post("/equipments/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

export async function downloadEquipmentImportTemplate() {
  const response = await apiClient.get("/equipments/import-template", {
    responseType: "blob"
  });
  return response;
}

export async function exportEquipments(params) {
  const response = await apiClient.get("/equipments/export", {
    params,
    responseType: "blob"
  });
  return response;
}
