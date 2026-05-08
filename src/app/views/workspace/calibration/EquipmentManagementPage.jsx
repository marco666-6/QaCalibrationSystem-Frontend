import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import {
  useCreateEquipment,
  useDueEquipments,
  useEquipments,
  useUpdateEquipment,
  useUpdateEquipmentStatus
} from "app/hooks/useCalibration";
import { CALIBRATION_TYPES, EQUIPMENT_STATUSES } from "app/utils/constant";
import { formatDate } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { EmptyState, WorkflowStatusChip, monthOptions, yearsAroundCurrent } from "./CalibrationShared";

const currentDate = new Date();

function EquipmentDialog({ open, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    equipmentName: "",
    controlNo: "",
    serialNo: "",
    brand: "",
    model: "",
    range: "",
    location: "",
    sectionId: "",
    calibIntervalMonths: 12,
    lastCalibDate: "",
    calibType: "Internal",
    equipmentStatus: "Active",
    remarks: ""
  });

  useEffect(() => {
    setForm({
      equipmentName: initialData?.equipmentName ?? "",
      controlNo: initialData?.controlNo ?? "",
      serialNo: initialData?.serialNo ?? "",
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      range: initialData?.range ?? "",
      location: initialData?.location ?? "",
      sectionId: initialData?.sectionId ?? "",
      calibIntervalMonths: initialData?.calibIntervalMonths ?? 12,
      lastCalibDate: initialData?.lastCalibDate ? new Date(initialData.lastCalibDate).toISOString().slice(0, 10) : "",
      calibType: initialData?.calibType ?? "Internal",
      equipmentStatus: initialData?.equipmentStatus ?? "Active",
      remarks: initialData?.remarks ?? ""
    });
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? "Update Equipment" : "Create Equipment"}</DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Equipment Name" value={form.equipmentName} onChange={(event) => setForm((current) => ({ ...current, equipmentName: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Control No." value={form.controlNo} onChange={(event) => setForm((current) => ({ ...current, controlNo: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Serial No." value={form.serialNo} onChange={(event) => setForm((current) => ({ ...current, serialNo: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Brand" value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Model" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Range" value={form.range} onChange={(event) => setForm((current) => ({ ...current, range: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="number" label="Section ID" value={form.sectionId} onChange={(event) => setForm((current) => ({ ...current, sectionId: event.target.value }))} helperText="Numeric section identifier used by due-plan grouping." />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="number" label="Calibration Interval (Months)" value={form.calibIntervalMonths} onChange={(event) => setForm((current) => ({ ...current, calibIntervalMonths: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="date" label="Last Calibration Date" value={form.lastCalibDate} onChange={(event) => setForm((current) => ({ ...current, lastCalibDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select label="Calibration Type" value={form.calibType} onChange={(event) => setForm((current) => ({ ...current, calibType: event.target.value }))}>
              {CALIBRATION_TYPES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select label="Equipment Status" value={form.equipmentStatus} onChange={(event) => setForm((current) => ({ ...current, equipmentStatus: event.target.value }))}>
              {EQUIPMENT_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={3} label="Remarks" value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={() =>
            onSubmit({
              equipmentName: form.equipmentName.trim(),
              controlNo: form.controlNo.trim(),
              serialNo: form.serialNo.trim() || null,
              brand: form.brand.trim() || null,
              model: form.model.trim() || null,
              range: form.range.trim() || null,
              location: form.location.trim() || null,
              sectionId: form.sectionId === "" ? null : Number(form.sectionId),
              calibIntervalMonths: Number(form.calibIntervalMonths),
              lastCalibDate: form.lastCalibDate || null,
              calibType: form.calibType,
              equipmentStatus: form.equipmentStatus,
              remarks: form.remarks.trim() || null
            })
          }
        >
          {isPending ? "Saving..." : "Save Equipment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StatusDialog({ open, equipment, isPending, onClose, onSubmit }) {
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    setStatus(equipment?.equipmentStatus || "Active");
  }, [equipment, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Equipment Status</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Update live equipment status for <strong>{equipment?.controlNo}</strong>.
          </Typography>
          <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {EQUIPMENT_STATUSES.map((entry) => (
              <MenuItem key={entry} value={entry}>
                {entry}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" disabled={isPending} onClick={() => onSubmit(status)}>
          {isPending ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EquipmentManagementPage() {
  const [search, setSearch] = useState("");
  const [calibTypeFilter, setCalibTypeFilter] = useState("");
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState("");
  const [sectionIdFilter, setSectionIdFilter] = useState("");
  const [dialogState, setDialogState] = useState({ open: false, data: null });
  const [statusTarget, setStatusTarget] = useState(null);
  const [dueMonth, setDueMonth] = useState(currentDate.getMonth() + 1);
  const [dueYear, setDueYear] = useState(currentDate.getFullYear());
  const [dueType, setDueType] = useState("");

  const equipmentsQuery = useEquipments({
    Page: 1,
    PageSize: 100,
    Search: search || undefined,
    CalibType: calibTypeFilter || undefined,
    EquipmentStatus: equipmentStatusFilter || undefined,
    SectionId: sectionIdFilter ? Number(sectionIdFilter) : undefined
  });
  const dueQuery = useDueEquipments({
    calibMonth: dueMonth,
    calibYear: dueYear,
    calibType: dueType || undefined
  });

  const createEquipmentMutation = useCreateEquipment();
  const updateEquipmentMutation = useUpdateEquipment(dialogState.data?.id);
  const updateStatusMutation = useUpdateEquipmentStatus(statusTarget?.id);

  const equipmentRows = equipmentsQuery.data?.items ?? [];
  const dueRows = dueQuery.data ?? [];
  const overdueCount = dueRows.filter((entry) => entry.isOverdue).length;

  const visibleSummary = useMemo(
    () => ({
      total: equipmentRows.length,
      active: equipmentRows.filter((entry) => entry.equipmentStatus === "Active").length,
      overdue: equipmentRows.filter((entry) => {
        if (!entry.nextCalibDate) return false;
        return new Date(entry.nextCalibDate) < new Date();
      }).length
    }),
    [equipmentRows]
  );

  return (
    <PageFrame
      section="Calibration Assets"
      title="Equipment Management"
      description="Maintain the live instrument registry used by the planning workflow. This page only exposes operations the backend actually supports: list, create, update, status update, and due-equipment lookup."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogState({ open: true, data: null })}>
          Add Equipment
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<SettingsSuggestOutlinedIcon />} title="Visible Equipments" value={visibleSummary.total} caption="current query slice" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<SettingsSuggestOutlinedIcon />} title="Active Equipments" value={visibleSummary.active} caption="status currently active" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<SettingsSuggestOutlinedIcon />} title="Overdue in Slice" value={visibleSummary.overdue} caption="next calibration date already passed" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Registry"
        description="Search by backend-supported filters. Section filtering uses the numeric section identifier stored on each equipment row."
      >
        <Grid2 container spacing={1.5}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              size="small"
              fullWidth
              label="Search"
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
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField size="small" fullWidth label="Section ID" value={sectionIdFilter} onChange={(event) => setSectionIdFilter(event.target.value)} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2.5 }}>
            <TextField size="small" select fullWidth label="Type" value={calibTypeFilter} onChange={(event) => setCalibTypeFilter(event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {CALIBRATION_TYPES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2.5 }}>
            <TextField size="small" select fullWidth label="Status" value={equipmentStatusFilter} onChange={(event) => setEquipmentStatusFilter(event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {EQUIPMENT_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>

        {equipmentsQuery.isError ? <Alert severity="error">{equipmentsQuery.error.message}</Alert> : null}

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Control No.</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last Calib</TableCell>
                <TableCell>Next Calib</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    Loading equipment registry...
                  </TableCell>
                </TableRow>
              ) : equipmentRows.length ? (
                equipmentRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack spacing={0.4}>
                        <Typography variant="body2" fontWeight={800}>
                          {row.equipmentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[row.brand, row.model, row.serialNo].filter(Boolean).join(" / ") || "No brand/model/serial"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.controlNo}</TableCell>
                    <TableCell>{row.sectionId ?? "-"}</TableCell>
                    <TableCell>{row.calibType}</TableCell>
                    <TableCell>{formatDate(row.lastCalibDate)}</TableCell>
                    <TableCell>{formatDate(row.nextCalibDate)}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="equipment" value={row.equipmentStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialogState({ open: true, data: row })}>
                          Edit
                        </Button>
                        <Button size="small" onClick={() => setStatusTarget(row)}>
                          Status
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      title="No equipment records found"
                      description="Adjust the search or create the first calibration asset in the registry."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard
        title="Due Equipment Lookup"
        description="This uses the same backend due-lookup contract that the plan refresh flow relies on."
      >
        <Grid2 container spacing={1.5}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField size="small" select fullWidth label="Month" value={dueMonth} onChange={(event) => setDueMonth(Number(event.target.value))}>
              {monthOptions.map((entry) => (
                <MenuItem key={entry.value} value={entry.value}>
                  {entry.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField size="small" select fullWidth label="Year" value={dueYear} onChange={(event) => setDueYear(Number(event.target.value))}>
              {yearsAroundCurrent(4).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField size="small" select fullWidth label="Calibration Type" value={dueType} onChange={(event) => setDueType(event.target.value)}>
              <MenuItem value="">All</MenuItem>
              {CALIBRATION_TYPES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <Alert severity={overdueCount > 0 ? "warning" : "info"} sx={{ height: "100%" }}>
              {dueRows.length} due rows, {overdueCount} overdue
            </Alert>
          </Grid2>
        </Grid2>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Control No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Section ID</TableCell>
                <TableCell>Next Calib</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dueQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Loading due-equipment lookup...
                  </TableCell>
                </TableRow>
              ) : dueRows.length ? (
                dueRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.equipmentName}</TableCell>
                    <TableCell>{row.controlNo}</TableCell>
                    <TableCell>{row.location || "-"}</TableCell>
                    <TableCell>{row.sectionId ?? "-"}</TableCell>
                    <TableCell>{formatDate(row.nextCalibDate)}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="result" value={row.isOverdue ? "NG" : "OK"} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      title="No due equipment returned"
                      description="The due lookup came back empty for the selected month, year, and type."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <EquipmentDialog
        open={dialogState.open}
        initialData={dialogState.data}
        isPending={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}
        onClose={() => setDialogState({ open: false, data: null })}
        onSubmit={async (payload) => {
          if (dialogState.data?.id) {
            await updateEquipmentMutation.mutateAsync(payload);
          } else {
            await createEquipmentMutation.mutateAsync(payload);
          }

          setDialogState({ open: false, data: null });
        }}
      />

      <StatusDialog
        open={Boolean(statusTarget)}
        equipment={statusTarget}
        isPending={updateStatusMutation.isPending}
        onClose={() => setStatusTarget(null)}
        onSubmit={async (status) => {
          await updateStatusMutation.mutateAsync(status);
          setStatusTarget(null);
        }}
      />
    </PageFrame>
  );
}
