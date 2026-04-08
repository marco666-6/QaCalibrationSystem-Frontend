import apiClient from "./client";

export async function getProductCategories() {
  const response = await apiClient.get("/inventory/categories");
  return response.data;
}

export async function createProductCategory(data) {
  const response = await apiClient.post("/inventory/categories", data);
  return response.data;
}

export async function updateProductCategory(id, data) {
  const response = await apiClient.put(`/inventory/categories/${id}`, data);
  return response.data;
}

export async function getSuppliers() {
  const response = await apiClient.get("/inventory/suppliers");
  return response.data;
}

export async function createSupplier(data) {
  const response = await apiClient.post("/inventory/suppliers", data);
  return response.data;
}

export async function updateSupplier(id, data) {
  const response = await apiClient.put(`/inventory/suppliers/${id}`, data);
  return response.data;
}

export async function getProducts(params) {
  const response = await apiClient.get("/inventory/products", { params });
  return response.data;
}

export async function lookupProducts(params) {
  const response = await apiClient.get("/inventory/products/lookup", { params });
  return response.data;
}

export async function createProduct(data) {
  const response = await apiClient.post("/inventory/products", data);
  return response.data;
}

export async function updateProduct(id, data) {
  const response = await apiClient.put(`/inventory/products/${id}`, data);
  return response.data;
}

export async function getPurchaseReceipts(params) {
  const response = await apiClient.get("/inventory/purchase-receipts", { params });
  return response.data;
}

export async function createPurchaseReceipt(data) {
  const response = await apiClient.post("/inventory/purchase-receipts", data);
  return response.data;
}

export async function getStockAdjustments(params) {
  const response = await apiClient.get("/inventory/stock-adjustments", { params });
  return response.data;
}

export async function createStockAdjustment(data) {
  const response = await apiClient.post("/inventory/stock-adjustments", data);
  return response.data;
}

export async function getStockMovements(params) {
  const response = await apiClient.get("/inventory/stock-movements", { params });
  return response.data;
}
