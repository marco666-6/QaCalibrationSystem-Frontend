import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import BuildIcon from "@mui/icons-material/Build";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FilterListIcon from "@mui/icons-material/FilterList";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersIcon from "@mui/icons-material/Layers";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  alpha,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import {
  useBulkChangePicEquipments,
  useBulkChangeSectionEquipments,
  useBulkChangeStatusEquipments,
  useBulkDeleteEquipments,
  useCreateEquipment,
  useDefaultLocationOptions,
  useDeleteEquipment,
  useDownloadEquipmentTemplate,
  useEquipments,
  useEquipmentNameSummary,
  useExportEquipments,
  useImportEquipments,
  useSectionOptions,
  useUpdateEquipment,
  useUserOptions
} from "app/hooks/useCalibration";
import { formatDate } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

const CALIBRATION_TYPES = ["Internal", "External"];
const EQUIPMENT_STATUSES = ["Active", "Out For Service", "Scrapped"];
const DUE_FILTER_OPTIONS = [
  { value: "", label: "Any schedule" },
  { value: "overdue", label: "Overdue" },
  { value: "dueThisMonth", label: "Due this month" },
  { value: "dueNextMonth", label: "Due next month" },
  { value: "dueSoon", label: "Due within 30 days" },
  { value: "missingDate", label: "Missing next date" }
];
const TABLE_COLUMNS = [
  { id: "equipmentName", label: "Equipment", sortable: true, minWidth: 260 },
  { id: "controlNo", label: "Control No.", sortable: true, minWidth: 140 },
  { id: "section", label: "Section", sortable: true, minWidth: 200 },
  { id: "location", label: "Location", sortable: true, minWidth: 180 },
  { id: "picName", label: "PIC", sortable: true, minWidth: 160 },
  { id: "calibIntervalMonths", label: "Interval", sortable: true, minWidth: 120 },
  { id: "lastCalibDate", label: "Last Calibration", sortable: true, minWidth: 150 },
  { id: "nextCalibDate", label: "Next Calibration", sortable: true, minWidth: 180 },
  { id: "calibType", label: "Type", sortable: true, minWidth: 120 },
  { id: "equipmentStatus", label: "Status", sortable: true, minWidth: 150 },
  { id: "remarks", label: "Remarks", sortable: true, minWidth: 220 }
];

const emptyForm = {
  equipmentName: "",
  controlNo: "",
  serialNo: "",
  brand: "",
  model: "",
  location: "",
  sectionId: "",
  picId: "",
  calibIntervalMonths: "12",
  lastCalibDate: "",
  calibType: "Internal",
  equipmentStatus: "Active",
  remarks: ""
};

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function startOfDay(value = new Date()) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getMonthStart(date, monthOffset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
}

function getDaysUntilCalib(nextCalibDate) {
  if (!nextCalibDate) return null;
  const today = startOfDay();
  const next = startOfDay(nextCalibDate);
  return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

function getDueBuckets(nextCalibDate) {
  if (!nextCalibDate) {
    return {
      daysUntil: null,
      isOverdue: false,
      isDueSoon: false,
      isDueThisMonth: false,
      isDueNextMonth: false
    };
  }

  const today = startOfDay();
  const next = startOfDay(nextCalibDate);
  const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  const thisMonthStart = getMonthStart(today, 0);
  const nextMonthStart = getMonthStart(today, 1);
  const followingMonthStart = getMonthStart(today, 2);
  const dueSoonEnd = new Date(today);
  dueSoonEnd.setDate(dueSoonEnd.getDate() + 30);

  return {
    daysUntil,
    isOverdue: daysUntil < 0,
    isDueSoon: daysUntil >= 0 && next <= dueSoonEnd,
    isDueThisMonth: next >= today && next >= thisMonthStart && next < nextMonthStart,
    isDueNextMonth: next >= nextMonthStart && next < followingMonthStart
  };
}

function matchesDueFilter(item, dueFilter) {
  const buckets = getDueBuckets(item.nextCalibDate);

  switch (dueFilter) {
    case "overdue":
      return buckets.isOverdue;
    case "dueThisMonth":
      return buckets.isDueThisMonth;
    case "dueNextMonth":
      return buckets.isDueNextMonth;
    case "dueSoon":
      return buckets.isDueSoon;
    case "missingDate":
      return !item.nextCalibDate;
    default:
      return true;
  }
}

function getColumnValue(item, columnId) {
  switch (columnId) {
    case "equipmentName":
      return `${item.equipmentName ?? ""} ${item.brand ?? ""} ${item.model ?? ""} ${item.serialNo ?? ""}`.trim();
    case "controlNo":
      return item.controlNo ?? "";
    case "section":
      return `${item.sectionCode ?? ""} ${item.sectionName ?? ""}`.trim();
    case "location":
      return item.location ?? "";
    case "picName":
      return item.picName ?? "";
    case "calibIntervalMonths":
      return Number(item.calibIntervalMonths ?? 0);
    case "lastCalibDate":
      return item.lastCalibDate ? new Date(item.lastCalibDate).getTime() : null;
    case "nextCalibDate":
      return item.nextCalibDate ? new Date(item.nextCalibDate).getTime() : null;
    case "calibType":
      return item.calibType ?? "";
    case "equipmentStatus":
      return item.equipmentStatus ?? "";
    case "remarks":
      return item.remarks ?? "";
    default:
      return "";
  }
}

function compareValues(left, right, order) {
  const leftEmpty = left === null || left === undefined || left === "";
  const rightEmpty = right === null || right === undefined || right === "";

  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  let comparison = 0;

  if (typeof left === "number" && typeof right === "number") {
    comparison = left - right;
  } else {
    comparison = String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: "base"
    });
  }

  return order === "asc" ? comparison : -comparison;
}

function StatusChip({ status }) {
  const config = {
    Active: {
      color: "success",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
    },
    "Out For Service": {
      color: "warning",
      icon: <BuildIcon sx={{ fontSize: 14 }} />
    },
    Scrapped: {
      color: "error",
      icon: <BlockIcon sx={{ fontSize: 14 }} />
    }
  }[status] ?? { color: "default", icon: null };

  return (
    <Chip
      label={status || "Unknown"}
      color={config.color}
      size="small"
      icon={config.icon}
      sx={{ fontWeight: 700, fontSize: "0.72rem", borderRadius: 2 }}
    />
  );
}

function CalibDateCell({ nextCalibDate }) {
  const { daysUntil, isOverdue, isDueSoon } = getDueBuckets(nextCalibDate);

  if (!nextCalibDate) {
    return (
      <Typography variant="body2" color="text.secondary">
        No next date
      </Typography>
    );
  }

  let color = "text.primary";
  let label = "On schedule";
  let chipColor = "default";

  if (isOverdue) {
    color = "error.main";
    label = `${Math.abs(daysUntil)}d overdue`;
    chipColor = "error";
  } else if (isDueSoon) {
    color = "warning.main";
    label = `${daysUntil}d left`;
    chipColor = "warning";
  }

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color={color} fontWeight={isOverdue ? 800 : 600}>
        {formatDate(nextCalibDate)}
      </Typography>
      <Chip
        label={label}
        size="small"
        color={chipColor}
        variant={chipColor === "default" ? "outlined" : "filled"}
        sx={{ width: "fit-content", fontSize: "0.68rem", height: 20, fontWeight: 700 }}
      />
    </Stack>
  );
}

function ImportDialog({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();
  const importEquipments = useImportEquipments();
  const downloadTemplate = useDownloadEquipmentTemplate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0] ?? null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await importEquipments.mutateAsync(formData);
      setResult(response?.data ?? response);
    } catch {
      // Snackbar feedback is handled by the mutation hook.
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={importEquipments.isPending ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Import Equipment</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ fontSize: "0.82rem" }}>
            Upload an Excel file that follows the import template. Duplicate control numbers will be skipped automatically.
          </Alert>

          <Button
            variant="outlined"
            size="small"
            startIcon={<SystemUpdateAltIcon />}
            disabled={downloadTemplate.isPending}
            onClick={() => downloadTemplate.mutate()}
            sx={{ alignSelf: "flex-start" }}
          >
            {downloadTemplate.isPending ? "Downloading..." : "Download template"}
          </Button>

          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: file ? "primary.main" : "divider",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
              "&:hover": { borderColor: "primary.main" },
              bgcolor: (theme) => (file ? alpha(theme.palette.primary.main, 0.05) : "transparent")
            }}
          >
            <input type="file" accept=".xlsx" hidden ref={fileInputRef} onChange={handleFileChange} />
            <FileUploadIcon sx={{ fontSize: 36, color: file ? "primary.main" : "text.disabled", mb: 1 }} />
            <Typography variant="body2" color={file ? "primary.main" : "text.secondary"} fontWeight={700}>
              {file ? file.name : "Click to choose an Excel file"}
            </Typography>
            {file ? (
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Supported format: .xlsx
              </Typography>
            )}
          </Box>

          {result ? (
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "success.light",
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                p: 2
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="success.dark" gutterBottom>
                Import complete
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Imported
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main">
                    {result.importedCount ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Skipped
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="warning.main">
                    {result.skippedCount ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Errors
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="error.main">
                    {result.errorCount ?? 0}
                  </Typography>
                </Box>
              </Stack>
              {result.errors?.length ? (
                <Box sx={{ mt: 1.5, maxHeight: 140, overflow: "auto" }}>
                  {result.errors.map((entry, index) => (
                    <Typography key={`${entry}-${index}`} variant="caption" color="error.main" display="block">
                      - {entry}
                    </Typography>
                  ))}
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importEquipments.isPending}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<FileUploadIcon />}
          disabled={!file || importEquipments.isPending}
          onClick={handleImport}
        >
          {importEquipments.isPending ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BulkActionDialog({ open, action, selectedIds, sectionOptions, userOptions, onClose }) {
  const [sectionId, setSectionId] = useState("");
  const [picId, setPicId] = useState("");
  const [status, setStatus] = useState("");

  const bulkSection = useBulkChangeSectionEquipments();
  const bulkPic = useBulkChangePicEquipments();
  const bulkStatus = useBulkChangeStatusEquipments();
  const bulkDelete = useBulkDeleteEquipments();

  const isPending = bulkSection.isPending || bulkPic.isPending || bulkStatus.isPending || bulkDelete.isPending;

  const handleConfirm = async () => {
    try {
      if (action === "delete") {
        await bulkDelete.mutateAsync({ equipmentIds: selectedIds });
      } else if (action === "section") {
        await bulkSection.mutateAsync({
          equipmentIds: selectedIds,
          sectionId: Number(sectionId)
        });
      } else if (action === "pic") {
        const user = userOptions.find((entry) => String(entry.userId) === picId);
        await bulkPic.mutateAsync({
          equipmentIds: selectedIds,
          picId: Number(picId),
          picCode: user?.username ?? null
        });
      } else if (action === "status") {
        await bulkStatus.mutateAsync({
          equipmentIds: selectedIds,
          equipmentStatus: status
        });
      }

      onClose(true);
    } catch {
      // Snackbar feedback is handled by the mutation hooks.
    }
  };

  const actionLabels = {
    delete: "Bulk Delete",
    section: "Bulk Change Section",
    pic: "Bulk Change PIC",
    status: "Bulk Change Status"
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : () => onClose(false)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800 }}>{actionLabels[action] ?? "Bulk Action"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity={action === "delete" ? "error" : "info"} sx={{ fontSize: "0.82rem" }}>
            {action === "delete"
              ? `You are about to permanently delete ${selectedIds.length} equipment record(s). This cannot be undone.`
              : `This will update ${selectedIds.length} equipment record(s).`}
          </Alert>

          {action === "section" ? (
            <TextField select fullWidth label="New Section" value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
              {sectionOptions.map((item) => (
                <MenuItem key={item.sectionId} value={String(item.sectionId)}>
                  {item.sectionCode} - {item.sectionName}
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          {action === "pic" ? (
            <TextField select fullWidth label="New PIC" value={picId} onChange={(event) => setPicId(event.target.value)}>
              {userOptions.map((item) => (
                <MenuItem key={item.userId} value={String(item.userId)}>
                  {item.username}
                  {item.employeeName ? ` (${item.employeeName})` : ""}
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          {action === "status" ? (
            <TextField select fullWidth label="New Status" value={status} onChange={(event) => setStatus(event.target.value)}>
              {EQUIPMENT_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={action === "delete" ? "error" : "primary"}
          disabled={
            isPending ||
            (action === "section" && !sectionId) ||
            (action === "pic" && !picId) ||
            (action === "status" && !status)
          }
          onClick={handleConfirm}
        >
          {isPending ? "Processing..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EquipmentDialog({
  open,
  mode,
  initialData,
  sectionOptions,
  userOptions,
  defaultLocationOptions,
  isPending,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(emptyForm);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    setForm({
      equipmentName: initialData?.equipmentName ?? "",
      controlNo: initialData?.controlNo ?? "",
      serialNo: initialData?.serialNo ?? "",
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      location: initialData?.location ?? "",
      sectionId: initialData?.sectionId ? String(initialData.sectionId) : "",
      picId: initialData?.picId ? String(initialData.picId) : "",
      calibIntervalMonths: initialData?.calibIntervalMonths ? String(initialData.calibIntervalMonths) : "12",
      lastCalibDate: toInputDate(initialData?.lastCalibDate),
      calibType: initialData?.calibType ?? "Internal",
      equipmentStatus: initialData?.equipmentStatus ?? "Active",
      remarks: initialData?.remarks ?? ""
    });
  }, [initialData, open]);

  const handleSubmit = () =>
    onSubmit({
      equipmentName: form.equipmentName.trim(),
      controlNo: form.controlNo.trim(),
      serialNo: form.serialNo.trim() || null,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      location: form.location.trim(),
      sectionId: Number(form.sectionId),
      picId: form.picId ? Number(form.picId) : null,
      picCode: null,
      calibIntervalMonths: Number(form.calibIntervalMonths || 0),
      lastCalibDate: form.lastCalibDate || null,
      calibType: form.calibType,
      equipmentStatus: form.equipmentStatus,
      remarks: form.remarks.trim() || null
    });

  const locationSuggestions = defaultLocationOptions.map((item) => item.defaultLocationName).join(", ");

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {mode === "edit" ? "Edit Equipment" : "Add New Equipment"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.25 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth required label="Equipment Name" value={form.equipmentName} onChange={set("equipmentName")} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth required label="Control No." value={form.controlNo} onChange={set("controlNo")} />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Serial No." value={form.serialNo} onChange={set("serialNo")} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Brand" value={form.brand} onChange={set("brand")} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Model" value={form.model} onChange={set("model")} />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Location"
              value={form.location}
              onChange={set("location")}
              helperText={locationSuggestions ? `Defaults: ${locationSuggestions}` : "Enter the current equipment location"}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select required label="Section" value={form.sectionId} onChange={set("sectionId")}>
              {sectionOptions.map((item) => (
                <MenuItem key={item.sectionId} value={String(item.sectionId)}>
                  {item.sectionCode} - {item.sectionName}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select label="PIC" value={form.picId} onChange={set("picId")}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {userOptions.map((item) => (
                <MenuItem key={item.userId} value={String(item.userId)}>
                  {item.username}
                  {item.employeeName ? ` (${item.employeeName})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              required
              label="Calibration Interval (Months)"
              value={form.calibIntervalMonths}
              onChange={set("calibIntervalMonths")}
              inputProps={{ min: 1 }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Last Calibration Date"
              value={form.lastCalibDate}
              InputLabelProps={{ shrink: true }}
              onChange={set("lastCalibDate")}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select required label="Calibration Type" value={form.calibType} onChange={set("calibType")}>
              {CALIBRATION_TYPES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select required label="Equipment Status" value={form.equipmentStatus} onChange={set("equipmentStatus")}>
              {EQUIPMENT_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={set("remarks")} />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Equipment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteEquipmentDialog({ open, equipment, isPending, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>Delete Equipment</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Are you sure you want to delete this equipment? This action cannot be undone.
          </Typography>
          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
              p: 1.75
            }}
          >
            <Typography variant="subtitle2" fontWeight={800}>
              {equipment?.equipmentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Control No: {equipment?.controlNo}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" color="error" disabled={isPending} onClick={onConfirm}>
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BulkActionBar({ selectedCount, onAction, onClear }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "stretch", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.25,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        bgcolor: (theme) => alpha(theme.palette.primary.main, selectedCount > 0 ? 0.08 : 0.03),
        border: "1px solid",
        borderColor: (theme) =>
          alpha(theme.palette.primary.main, selectedCount > 0 ? 0.22 : 0.08)
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          color={selectedCount > 0 ? "primary" : "default"}
          label={selectedCount > 0 ? `${selectedCount} selected` : "No rows selected"}
          sx={{ fontWeight: 700 }}
        />
        <Typography variant="body2" color="text.secondary">
          Select rows to update section, PIC, status, or delete in bulk.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ ml: { sm: "auto" } }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<SwapHorizIcon />}
          disabled={selectedCount === 0}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          Bulk actions
        </Button>
        <Button size="small" color="inherit" disabled={selectedCount === 0} onClick={onClear}>
          Clear selection
        </Button>
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); onAction("section"); }}>
          <LayersIcon fontSize="small" sx={{ mr: 1 }} />
          Change Section
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAction("pic"); }}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          Change PIC
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAction("status"); }}>
          <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
          Change Status
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); onAction("delete"); }} sx={{ color: "error.main" }}>
          <DeleteSweepIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function EquipmentManagementContent() {
  const theme = useTheme();
  const registryRef = useRef(null);

  const [search, setSearch] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [calibType, setCalibType] = useState("");
  const [equipmentStatus, setEquipmentStatus] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [filterEquipmentName, setFilterEquipmentName] = useState("");
  const [equipmentNameInput, setEquipmentNameInput] = useState("");
  const [sortModel, setSortModel] = useState({ orderBy: "nextCalibDate", order: "asc" });

  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportAnchor, setExportAnchor] = useState(null);

  const filters = {
    Page: 1,
    PageSize: 100,
    Search: search || undefined,
    SectionId: sectionId ? Number(sectionId) : undefined,
    EquipmentName: filterEquipmentName || undefined,
    CalibType: calibType || undefined,
    EquipmentStatus: equipmentStatus || undefined
  };

  const { data, isLoading, isError, error } = useEquipments(filters);
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError
  } = useEquipmentNameSummary();
  const { data: sectionOptionsData } = useSectionOptions({ Top: 100, ActiveOnly: true });
  const { data: userOptionsData } = useUserOptions({ Top: 100 });
  const { data: defaultLocationOptionsData } = useDefaultLocationOptions({ Top: 50, ActiveOnly: true });

  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment(dialog.data?.id);
  const deleteEquipment = useDeleteEquipment();
  const exportEquipments = useExportEquipments();

  const sectionOptions = sectionOptionsData ?? [];
  const userOptions = userOptionsData ?? [];
  const defaultLocationOptions = defaultLocationOptionsData ?? [];
  const items = data?.items ?? [];
  const summaryRows = summaryData ?? [];

  const overview = useMemo(() => {
    const totals = summaryRows.reduce(
      (current, row) => ({
        totalItems: current.totalItems + row.totalItems,
        overdueItems: current.overdueItems + row.overdueItems,
        dueThisMonthItems: current.dueThisMonthItems + row.dueItems
      }),
      { totalItems: 0, overdueItems: 0, dueThisMonthItems: 0 }
    );

    return {
      totalItems: totals.totalItems,
      groupedEquipment: summaryRows.length,
      overdueItems: totals.overdueItems,
      dueThisMonthItems: totals.dueThisMonthItems
    };
  }, [summaryRows]);

  const tableRows = useMemo(() => {
    const filtered = items.filter((item) => matchesDueFilter(item, dueFilter));

    return [...filtered].sort((left, right) =>
      compareValues(
        getColumnValue(left, sortModel.orderBy),
        getColumnValue(right, sortModel.orderBy),
        sortModel.order
      )
    );
  }, [dueFilter, items, sortModel]);

  useEffect(() => {
    if (filterEquipmentName && !summaryRows.some((row) => row.equipmentName === filterEquipmentName)) {
      setFilterEquipmentName("");
      setEquipmentNameInput("");
    }
  }, [filterEquipmentName, summaryRows]);

  useEffect(() => {
    const visibleIds = new Set(tableRows.map((item) => item.id));

    setSelectedIds((previous) => {
      const next = new Set([...previous].filter((id) => visibleIds.has(id)));
      const unchanged = previous.size === next.size && [...previous].every((id) => next.has(id));
      return unchanged ? previous : next;
    });
  }, [tableRows]);

  const allIds = tableRows.map((item) => item.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(allIds));
  }, [allIds, allSelected]);

  const toggleRow = useCallback((id) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleSort = (columnId) => {
    setSortModel((current) => ({
      orderBy: columnId,
      order: current.orderBy === columnId && current.order === "asc" ? "desc" : "asc"
    }));
  };

  const handleExport = (withFilters) => {
    setExportAnchor(null);
    exportEquipments.mutate(withFilters ? filters : {});
  };

  const handleSummaryRowDoubleClick = (equipmentName) => {
    setFilterEquipmentName(equipmentName);
    setEquipmentNameInput(equipmentName);

    setTimeout(() => {
      registryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSectionId("");
    setCalibType("");
    setEquipmentStatus("");
    setDueFilter("");
    setFilterEquipmentName("");
    setEquipmentNameInput("");
  };

  const activeFilterCount = [search, sectionId, calibType, equipmentStatus, dueFilter, filterEquipmentName].filter(Boolean).length;

  const surfaceSx = {
    borderRadius: 4,
    borderColor: alpha(theme.palette.primary.main, 0.12),
    boxShadow: `0 18px 40px ${alpha(theme.palette.common.black, 0.05)}`,
    backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 160px)`
  };

  if (isError) {
    return (
      <PageFrame section="Calibration" title="Equipment Management" description="The equipment module could not load.">
        <Alert severity="error">{error.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="Calibration"
      title="Equipment Management"
      description="A cleaner, faster workspace for reviewing calibration assets, spotting due items, and acting on records without losing context."
      action={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={{ xs: "100%", md: "auto" }}>
          <Button variant="outlined" startIcon={<SystemUpdateAltIcon />} onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            disabled={exportEquipments.isPending}
            onClick={(event) => setExportAnchor(event.currentTarget)}
          >
            {exportEquipments.isPending ? "Exporting..." : "Export"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialog({ open: true, mode: "create", data: null })}
          >
            Add Equipment
          </Button>
        </Stack>
      }
    >
      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={() => handleExport(true)}>Export with current filters</MenuItem>
        <MenuItem onClick={() => handleExport(false)}>Export all records</MenuItem>
      </Menu>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<Inventory2OutlinedIcon />}
            title="Total items"
            value={isSummaryLoading ? <Skeleton width={72} /> : overview.totalItems}
            caption="all equipment records across the full inventory"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<LayersIcon />}
            title="Equipment groups"
            value={isSummaryLoading ? <Skeleton width={64} /> : overview.groupedEquipment}
            caption="unique equipment names in the summary"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<WarningAmberIcon />}
            title="Overdue"
            value={isSummaryLoading ? <Skeleton width={64} /> : overview.overdueItems}
            caption="overdue items across all equipment groups"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<ScheduleOutlinedIcon />}
            title="Due this month"
            value={isSummaryLoading ? <Skeleton width={64} /> : overview.dueThisMonthItems}
            caption="items scheduled before this month closes"
          />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Equipment Summary"
        description="Grouped across the full inventory. Double-click a row to re-filter the equipment registry below by that equipment name."
        sx={surfaceSx}
      >
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 3,
            maxHeight: 320,
            overflow: "auto",
            borderColor: alpha(theme.palette.primary.main, 0.12)
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: "background.paper" }}>Equipment Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: "background.paper" }}>
                  Total Items
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: "background.paper" }}>
                  Due This Month
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: "background.paper" }}>
                  Overdue
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: "background.paper" }}>
                  Due Next Month
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isSummaryLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`summary-skeleton-${index}`}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <TableCell key={`summary-skeleton-${index}-${cellIndex}`}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isSummaryError ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 3 }}>
                    <Alert severity="warning">
                      The grouped summary is temporarily unavailable. The equipment registry below is still available.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : summaryRows.length ? (
                summaryRows.map((row) => {
                  const isActive = row.equipmentName === filterEquipmentName;
                  return (
                    <TableRow
                      key={row.equipmentName}
                      hover
                      onDoubleClick={() => handleSummaryRowDoubleClick(row.equipmentName)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : undefined,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, isActive ? 0.12 : 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={800}>
                            {row.equipmentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Double-click to re-filter the registry by this equipment name
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {row.totalItems}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          color={row.dueItems > 0 ? "warning" : "default"}
                          label={row.dueItems}
                          variant={row.dueItems > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 700, minWidth: 48 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          color={row.overdueItems > 0 ? "error" : "default"}
                          label={row.overdueItems}
                          variant={row.overdueItems > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 700, minWidth: 48 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          color={row.dueNextMonthItems > 0 ? "info" : "default"}
                          label={row.dueNextMonthItems}
                          variant={row.dueNextMonthItems > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 700, minWidth: 48 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No grouped equipment data is available yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard
        title="Equipment Registry"
        description="Full records, faster filtering, sticky headers, and scroll-safe table behavior for dense calibration datasets."
        sx={surfaceSx}
      >
        <Stack spacing={2} ref={registryRef}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: { xs: 1.5, md: 2 },
              borderColor: alpha(theme.palette.primary.main, 0.12),
              bgcolor: alpha(theme.palette.primary.main, 0.025)
            }}
          >
            <Grid2 container spacing={1.5}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Search"
                  placeholder="Name, control no., serial, brand, or model"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Section"
                  value={sectionId}
                  onChange={(event) => setSectionId(event.target.value)}
                >
                  <MenuItem value="">All sections</MenuItem>
                  {sectionOptions.map((item) => (
                    <MenuItem key={item.sectionId} value={String(item.sectionId)}>
                      {item.sectionCode}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  size="small"
                  options={summaryRows}
                  getOptionLabel={(option) => option?.equipmentName || ""}
                  value={summaryRows.find((row) => row.equipmentName === filterEquipmentName) || null}
                  inputValue={equipmentNameInput}
                  onInputChange={(_, value, reason) => {
                    setEquipmentNameInput(value);
                    if (reason === "clear") {
                      setFilterEquipmentName("");
                    }
                  }}
                  onChange={(_, value) => {
                    const equipmentName = value?.equipmentName || "";
                    setFilterEquipmentName(equipmentName);
                    setEquipmentNameInput(equipmentName);
                  }}
                  isOptionEqualToValue={(option, value) => option.equipmentName === value?.equipmentName}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Equipment Name"
                      placeholder="Type or pick an equipment group"
                    />
                  )}
                  noOptionsText="No equipment names found"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Calibration Type"
                  value={calibType}
                  onChange={(event) => setCalibType(event.target.value)}
                >
                  <MenuItem value="">All types</MenuItem>
                  {CALIBRATION_TYPES.map((entry) => (
                    <MenuItem key={entry} value={entry}>
                      {entry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Status"
                  value={equipmentStatus}
                  onChange={(event) => setEquipmentStatus(event.target.value)}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  {EQUIPMENT_STATUSES.map((entry) => (
                    <MenuItem key={entry} value={entry}>
                      {entry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Schedule"
                  value={dueFilter}
                  onChange={(event) => setDueFilter(event.target.value)}
                >
                  {DUE_FILTER_OPTIONS.map((entry) => (
                    <MenuItem key={entry.value || "all"} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
            </Grid2>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ mt: 1.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                Double-clicking a summary row sets the equipment name filter here, then reloads the registry from the server with that equipment group.
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`${tableRows.length} visible`}
                  sx={{ fontWeight: 700 }}
                />
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<FilterAltOffIcon />}
                  disabled={activeFilterCount === 0}
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <BulkActionBar selectedCount={selectedIds.size} onAction={setBulkAction} onClear={clearSelection} />

          {isLoading ? <LinearProgress sx={{ borderRadius: 999 }} /> : null}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: alpha(theme.palette.primary.main, 0.12),
              maxHeight: { xs: 460, md: 680 },
              overflow: "auto",
              overscrollBehavior: "contain"
            }}
          >
            <Table stickyHeader size="small" sx={{ minWidth: 1760 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: "background.paper", pl: 1.5 }}>
                    <Tooltip title={allSelected ? "Deselect all visible rows" : "Select all visible rows"}>
                      <IconButton size="small" onClick={toggleAll}>
                        {allSelected ? (
                          <CheckBoxIcon fontSize="small" color="primary" />
                        ) : someSelected ? (
                          <IndeterminateCheckBoxIcon fontSize="small" color="primary" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  {TABLE_COLUMNS.map((column) => (
                    <TableCell
                      key={column.id}
                      sx={{
                        minWidth: column.minWidth,
                        fontWeight: 800,
                        bgcolor: "background.paper"
                      }}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortModel.orderBy === column.id}
                          direction={sortModel.orderBy === column.id ? sortModel.order : "asc"}
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ minWidth: 120, fontWeight: 800, bgcolor: "background.paper", pr: 2 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, rowIndex) => (
                    <TableRow key={`table-skeleton-${rowIndex}`}>
                      <TableCell padding="checkbox">
                        <Skeleton variant="rounded" width={22} height={22} sx={{ ml: 1.5 }} />
                      </TableCell>
                      {Array.from({ length: TABLE_COLUMNS.length + 1 }).map((__, cellIndex) => (
                        <TableCell key={`table-skeleton-${rowIndex}-${cellIndex}`}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : tableRows.length ? (
                  tableRows.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const details = [item.brand, item.model, item.serialNo].filter(Boolean).join(" / ") || "No brand, model, or serial";

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        selected={isSelected}
                        onClick={() => toggleRow(item.id)}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.07)
                          },
                          "&.Mui-selected:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.11)
                          }
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleRow(item.id);
                            }}
                          >
                            {isSelected ? (
                              <CheckBoxIcon fontSize="small" color="primary" />
                            ) : (
                              <CheckBoxOutlineBlankIcon fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={800}>
                              {item.equipmentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {details}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                            {item.controlNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.sectionCode || "-"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.sectionName || "No section name"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.location || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.picName || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.calibIntervalMonths ? `${item.calibIntervalMonths} months` : "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(item.lastCalibDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <CalibDateCell nextCalibDate={item.nextCalibDate} />
                        </TableCell>
                        <TableCell>
                          <Chip label={item.calibType || "-"} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.equipmentStatus} />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={item.remarks ? "text.primary" : "text.secondary"}
                            sx={{
                              display: "-webkit-box",
                              overflow: "hidden",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2
                            }}
                          >
                            {item.remarks || "No remarks"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => setDialog({ open: true, mode: "edit", data: item })}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLUMNS.length + 2} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 42, color: "text.disabled" }} />
                        <Typography variant="body1" fontWeight={700}>
                          No equipment records match the current filters.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try clearing one or more filters or double-clicking a different equipment group above.
                        </Typography>
                        {activeFilterCount > 0 ? (
                          <Button size="small" onClick={clearAllFilters}>
                            Clear filters
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {tableRows.length} row(s) from {data?.totalCount ?? items.length} records. Scroll vertically for browsing and horizontally to view the full record set.
            </Typography>
          </Stack>
        </Stack>
      </SectionCard>

      <EquipmentDialog
        open={dialog.open}
        mode={dialog.mode}
        initialData={dialog.data}
        sectionOptions={sectionOptions}
        userOptions={userOptions}
        defaultLocationOptions={defaultLocationOptions}
        isPending={createEquipment.isPending || updateEquipment.isPending}
        onClose={() => setDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          if (dialog.mode === "create") {
            await createEquipment.mutateAsync(payload);
          } else {
            await updateEquipment.mutateAsync(payload);
          }

          setDialog({ open: false, mode: "create", data: null });
        }}
      />

      <DeleteEquipmentDialog
        open={Boolean(deleteTarget)}
        equipment={deleteTarget}
        isPending={deleteEquipment.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteEquipment.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

      {bulkAction ? (
        <BulkActionDialog
          open={Boolean(bulkAction)}
          action={bulkAction}
          selectedIds={[...selectedIds]}
          sectionOptions={sectionOptions}
          userOptions={userOptions}
          onClose={(success) => {
            setBulkAction(null);
            if (success) clearSelection();
          }}
        />
      ) : null}
    </PageFrame>
  );
}
