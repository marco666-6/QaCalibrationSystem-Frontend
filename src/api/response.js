const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || window.location.origin;

export function unwrapResponse(response) {
  return response?.data ?? response;
}

export function unwrapData(response) {
  const payload = unwrapResponse(response);
  return payload?.data ?? payload;
}

export function unwrapMessage(response, fallback = "Request completed.") {
  const payload = unwrapResponse(response);
  return payload?.message || fallback;
}

export function getApiOrigin() {
  try {
    return new URL(apiEndpoint, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function resolveServerUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  return new URL(value, getApiOrigin()).toString();
}
