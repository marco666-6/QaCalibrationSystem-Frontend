export function unwrapResponse(response) {
  return response?.data ?? response;
}

export function unwrapData(response) {
  const payload = unwrapResponse(response);
  return payload?.data ?? payload;
}
