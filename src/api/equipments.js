import apiClient from "./client";

export async function getEquipments(params) {
  const response = await apiClient.get("/equipments", { params });
  return response.data;
}

export async function getEquipmentById(id) {
  const response = await apiClient.get(`/equipments/${id}`);
  return response.data;
}

export async function getDueEquipments(params) {
  const response = await apiClient.get("/equipments/due", { params });
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

export async function updateEquipmentStatus(id, equipmentStatus) {
  const response = await apiClient.patch(`/equipments/${id}/status`, { equipmentStatus });
  return response.data;
}
