import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  ACTUAL_STATUS_COLORS,
  APPROVAL_STATUS_COLORS,
  EQUIPMENT_STATUS_COLORS,
  PLAN_STATUS_COLORS,
  RESULT_STATUS_COLORS
} from "app/utils/constant";
import { resolveServerUrl } from "@api/response";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

export const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: monthFormatter.format(new Date(2000, index, 1))
}));

export function yearsAroundCurrent(range = 3) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: range * 2 + 1 }, (_, index) => currentYear - range + index);
}

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function formatMonthYear(month, year) {
  if (!month || !year) return "-";
  const label = monthOptions.find((entry) => entry.value === Number(month))?.label || `Month ${month}`;
  return `${label} ${year}`;
}

export function openDocument(url) {
  const resolved = resolveServerUrl(url);
  if (!resolved) return;
  window.open(resolved, "_blank", "noopener,noreferrer");
}

export function WorkflowStatusChip({ type, value, size = "small", variant = "filled" }) {
  if (!value) {
    return <Chip size={size} variant="outlined" label="-" />;
  }

  const colorMap = {
    plan: PLAN_STATUS_COLORS,
    actual: ACTUAL_STATUS_COLORS,
    approval: APPROVAL_STATUS_COLORS,
    result: RESULT_STATUS_COLORS,
    equipment: EQUIPMENT_STATUS_COLORS
  }[type];

  return (
    <Chip
      label={value}
      size={size}
      color={colorMap?.[value] || "default"}
      variant={variant}
      sx={{ fontWeight: 700, borderRadius: 2.5 }}
    />
  );
}

export function UserOptionLabel(option) {
  if (!option) return "";
  return option.employeeName ? `${option.employeeName} (${option.username})` : option.username;
}

export function UserLookupField({
  label,
  value,
  onChange,
  options = [],
  loading = false,
  disabled = false,
  helperText,
  required = false
}) {
  const selectedOption = value?.userId
    ? options.find((entry) => entry.userId === value.userId) || value
    : null;

  return (
    <Autocomplete
      options={options}
      loading={loading}
      disabled={disabled}
      value={selectedOption}
      isOptionEqualToValue={(option, optionValue) => option.userId === optionValue.userId}
      getOptionLabel={UserOptionLabel}
      onChange={(_, option) =>
        onChange(
          option
            ? {
                userId: option.userId,
                username: option.username,
                employeeName: option.employeeName,
                email: option.email
              }
            : null
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          helperText={helperText}
        />
      )}
    />
  );
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmColor = "primary",
  isPending = false,
  onClose,
  onConfirm
}) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={isPending}>
          {isPending ? `${confirmLabel}...` : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PdfActionButton({ url, onGenerate, disabled = false, isGenerating = false, label = "Open PDF" }) {
  if (url) {
    return (
      <Button variant="outlined" startIcon={<OpenInNewIcon />} onClick={() => openDocument(url)} disabled={disabled}>
        {label}
      </Button>
    );
  }

  return (
    <Button variant="outlined" startIcon={<OpenInNewIcon />} onClick={onGenerate} disabled={disabled || isGenerating}>
      {isGenerating ? "Generating..." : "Generate PDF"}
    </Button>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 6 }}>
      <Typography variant="subtitle1" fontWeight={800}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 520 }}>
        {description}
      </Typography>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  );
}

export function ErrorState({ error, action }) {
  return (
    <Alert severity="error" action={action}>
      {error?.message || "Something went wrong while loading this section."}
    </Alert>
  );
}

export function BooleanFilterField({ label, value, onChange, trueLabel = "Yes", falseLabel = "No" }) {
  return (
    <TextField select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <MenuItem value="">All</MenuItem>
      <MenuItem value="true">{trueLabel}</MenuItem>
      <MenuItem value="false">{falseLabel}</MenuItem>
    </TextField>
  );
}
