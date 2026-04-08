export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const toDateInputValue = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
};

export const toDateTimeInputValue = (value) => {
  if (!value) {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  }

  return new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

export const toNumberValue = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  return Number(value);
};

export const toNullableNumberValue = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
};
