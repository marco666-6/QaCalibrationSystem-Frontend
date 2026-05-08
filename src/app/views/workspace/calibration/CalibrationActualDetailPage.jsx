import { useEffect, useMemo, useState } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { useNavigate, useParams } from "react-router-dom";
import {
  useApproveActualStep,
  useCalibActualFull,
  useCompleteCalibActual,
  useEquipments,
  useGenerateActualPdf,
  useRemoveActualTechnician,
  useReplaceActualEquipments,
  useRevokeActualStep,
  useSetActualEquipmentResult,
  useStartCalibActual,
  useUpdateActualSummaryRemarks,
  useUpsertActualTechnician,
  useUserOptions
} from "app/hooks/useCalibration";
import { NG_ACTIONS } from "app/utils/constant";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { formatDate, formatDateTime } from "../shared/workspaceFormatters";
import {
  EmptyState,
  PdfActionButton,
  UserLookupField,
  WorkflowStatusChip,
  formatMonthYear,
  toDateInput
} from "./CalibrationShared";

function TechnicianForm({ userOptions, userOptionsLoading, isPending, onSubmit }) {
  const [technician, setTechnician] = useState(null);
  const [isPic, setIsPic] = useState(false);

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
      <UserLookupField
        label="Technician"
        value={technician}
        onChange={setTechnician}
        options={userOptions}
        loading={userOptionsLoading}
      />
      <TextField select label="PIC" value={String(isPic)} onChange={(event) => setIsPic(event.target.value === "true")} sx={{ minWidth: 160 }}>
        <MenuItem value="false">No</MenuItem>
        <MenuItem value="true">Yes</MenuItem>
      </TextField>
      <Button
        variant="contained"
        startIcon={<PersonAddAlt1OutlinedIcon />}
        disabled={!technician?.userId || isPending}
        onClick={async () => {
          await onSubmit({
            technicianId: technician.userId,
            technicianCode: technician.username,
            technicianName: technician.employeeName || technician.username,
            isPic
          });
          setTechnician(null);
          setIsPic(false);
        }}
      >
        {isPending ? "Saving..." : "Add Technician"}
      </Button>
    </Stack>
  );
}

function ReplaceEquipmentDialog({ open, isPending, onClose, onSubmit }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const equipmentQuery = useEquipments({ Page: 1, PageSize: 100, Search: search || undefined });

  const rows = equipmentQuery.data?.items ?? [];

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelectedIds([]);
  }, [open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle>Replace Actual Equipment List</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            This is only valid for standalone actuals while the actual status is <strong>Wait</strong>.
          </Alert>
          <TextField label="Search Equipment" value={search} onChange={(event) => setSearch(event.target.value)} />
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, maxHeight: 440 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Control No.</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Section ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const checked = selectedIds.includes(row.id);
                  return (
                    <TableRow key={row.id}>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked ? [...current, row.id] : current.filter((entry) => entry !== row.id)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{row.equipmentName}</TableCell>
                      <TableCell>{row.controlNo}</TableCell>
                      <TableCell>{row.location || "-"}</TableCell>
                      <TableCell>{row.sectionId ?? "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isPending || !selectedIds.length}
          onClick={() =>
            onSubmit(
              rows
                .filter((row) => selectedIds.includes(row.id))
                .map((row) => ({
                  equipmentId: row.id,
                  equipmentName: row.equipmentName,
                  controlNo: row.controlNo,
                  serialNo: row.serialNo,
                  brand: row.brand,
                  model: row.model,
                  range: row.range,
                  location: row.location,
                  sectionId: row.sectionId
                }))
            )
          }
        >
          {isPending ? "Replacing..." : "Replace Equipment List"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResultDialog({ open, equipment, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    calibDate: equipment?.calibDate ? toDateInput(equipment.calibDate) : "",
    resultStatus: equipment?.resultStatus || "Pending",
    ngAction: equipment?.ngAction || "",
    repairNotes: equipment?.repairNotes || "",
    replacementNotes: equipment?.replacementNotes || "",
    remarks: equipment?.remarks || ""
  });

  useEffect(() => {
    setForm({
      calibDate: equipment?.calibDate ? toDateInput(equipment.calibDate) : "",
      resultStatus: equipment?.resultStatus || "Pending",
      ngAction: equipment?.ngAction || "",
      repairNotes: equipment?.repairNotes || "",
      replacementNotes: equipment?.replacementNotes || "",
      remarks: equipment?.remarks || ""
    });
  }, [equipment, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Equipment Result</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {equipment?.equipmentName || "Equipment"} · {equipment?.controlNo || "-"}
          </Typography>
          <TextField type="date" label="Calibration Date" value={form.calibDate} onChange={(event) => setForm((current) => ({ ...current, calibDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField select label="Result Status" value={form.resultStatus} onChange={(event) => setForm((current) => ({ ...current, resultStatus: event.target.value }))}>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="OK">OK</MenuItem>
            <MenuItem value="NG">NG</MenuItem>
          </TextField>
          {form.resultStatus === "NG" ? (
            <>
              <TextField select label="NG Action" value={form.ngAction} onChange={(event) => setForm((current) => ({ ...current, ngAction: event.target.value }))}>
                {NG_ACTIONS.map((entry) => (
                  <MenuItem key={entry} value={entry}>
                    {entry}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Repair Notes" multiline minRows={2} value={form.repairNotes} onChange={(event) => setForm((current) => ({ ...current, repairNotes: event.target.value }))} />
              <TextField label="Replacement Notes" multiline minRows={2} value={form.replacementNotes} onChange={(event) => setForm((current) => ({ ...current, replacementNotes: event.target.value }))} />
            </>
          ) : null}
          <TextField label="Remarks" multiline minRows={2} value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} />
        </Stack>
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
              calibDate: form.calibDate || null,
              resultStatus: form.resultStatus,
              ngAction: form.resultStatus === "NG" ? form.ngAction || null : null,
              repairNotes: form.resultStatus === "NG" ? form.repairNotes.trim() || null : null,
              replacementNotes: form.resultStatus === "NG" ? form.replacementNotes.trim() || null : null,
              remarks: form.remarks.trim() || null
            })
          }
        >
          {isPending ? "Saving..." : "Save Result"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CalibrationActualDetailPage() {
  const { actualId } = useParams();
  const navigate = useNavigate();
  const numericActualId = Number(actualId);

  const actualQuery = useCalibActualFull(numericActualId, { enabled: Number.isFinite(numericActualId) });
  const userOptionsQuery = useUserOptions({ Top: 50 });

  const startMutation = useStartCalibActual(numericActualId);
  const completeMutation = useCompleteCalibActual(numericActualId);
  const upsertTechnicianMutation = useUpsertActualTechnician(numericActualId);
  const removeTechnicianMutation = useRemoveActualTechnician(numericActualId);
  const replaceEquipmentsMutation = useReplaceActualEquipments(numericActualId);
  const setResultMutation = useSetActualEquipmentResult(numericActualId);
  const updateSummaryMutation = useUpdateActualSummaryRemarks(numericActualId);
  const approveMutation = useApproveActualStep(numericActualId);
  const revokeMutation = useRevokeActualStep(numericActualId);
  const generatePdfMutation = useGenerateActualPdf(numericActualId);

  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState(null);
  const [summaryRemarks, setSummaryRemarks] = useState({});

  const data = actualQuery.data;
  const header = data?.header;
  const technicians = data?.technicians ?? [];
  const equipments = data?.equipments ?? [];
  const summaries = data?.equipmentSummaries ?? [];
  const approvals = data?.approvals ?? [];

  useEffect(() => {
    const next = {};
    summaries.forEach((entry) => {
      next[entry.actualEquipmentSummaryId] = entry.remarks ?? "";
    });
    setSummaryRemarks(next);
  }, [summaries]);

  const isStandalone = !header?.planId;
  const isWait = header?.actualStatus === "Wait";
  const isOngoing = header?.actualStatus === "Ongoing";
  const isCompleted = header?.actualStatus === "Completed";
  const pendingResults = equipments.filter((entry) => entry.resultStatus === "Pending").length;

  const actionButtons = useMemo(
    () => (
      <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
        <Button variant="text" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/calibration-actuals")}>
          Back to Actuals
        </Button>
        <Button variant="outlined" startIcon={<PlayArrowOutlinedIcon />} disabled={!isWait || startMutation.isPending} onClick={() => startMutation.mutate()}>
          {startMutation.isPending ? "Starting..." : "Start"}
        </Button>
        <Button variant="outlined" startIcon={<TaskAltOutlinedIcon />} disabled={!isOngoing || completeMutation.isPending} onClick={() => completeMutation.mutate()}>
          {completeMutation.isPending ? "Completing..." : "Complete"}
        </Button>
        {isStandalone && isWait ? (
          <Button variant="outlined" startIcon={<PlaylistAddCheckOutlinedIcon />} disabled={replaceEquipmentsMutation.isPending} onClick={() => setReplaceDialogOpen(true)}>
            Replace Equipment List
          </Button>
        ) : null}
        <PdfActionButton
          url={header?.pdfFileUrl}
          onGenerate={() => generatePdfMutation.mutate()}
          isGenerating={generatePdfMutation.isPending}
          label="Open Final PDF"
        />
      </Stack>
    ),
    [
      completeMutation,
      generatePdfMutation,
      header?.pdfFileUrl,
      isOngoing,
      isStandalone,
      isWait,
      navigate,
      replaceEquipmentsMutation.isPending,
      startMutation
    ]
  );

  if (actualQuery.isLoading || !header) {
    return (
      <PageFrame section="Calibration Execution" title="Loading actual detail" description="Fetching the full actual workflow.">
        <Alert severity="info">Loading calibration actual detail...</Alert>
      </PageFrame>
    );
  }

  if (actualQuery.isError) {
    return (
      <PageFrame section="Calibration Execution" title="Actual not available" description="The selected calibration actual could not be loaded.">
        <Alert severity="error">{actualQuery.error.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="Calibration Execution"
      title={header.actualCode}
      description={`${formatMonthYear(header.calibMonth, header.calibYear)} · ${header.calibType} actual workflow`}
      action={actionButtons}
    >
      <SectionCard
        title="Actual Header"
        description="This header is sourced from the backend actual record. Standalone actuals can still replace equipment while status is Wait."
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Status" value={header.actualStatus} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Plan Link" value={header.planId ? `Plan ${header.planId}` : "Standalone"} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Started" value={formatDateTime(header.startedAt)} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Completed" value={formatDateTime(header.completedAt)} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Preparer" value={header.preparerName || header.preparerCode || "-"} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Checker" value={header.checkerName || header.checkerCode || "-"} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Approver" value={header.approverName || header.approverCode || "-"} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="External Vendor" value={header.externalCompany || "-"} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={3} label="Remarks" value={header.remarks || ""} disabled />
          </Grid2>
        </Grid2>
      </SectionCard>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, xl: 5 }}>
          <SectionCard title="Technicians" description="Actual technicians can be assigned and PIC can be toggled while the workflow progresses.">
            <TechnicianForm
              userOptions={userOptionsQuery.data ?? []}
              userOptionsLoading={userOptionsQuery.isLoading}
              isPending={upsertTechnicianMutation.isPending}
              onSubmit={(payload) => upsertTechnicianMutation.mutateAsync(payload)}
            />
            <Divider />
            <Stack spacing={1}>
              {technicians.length ? (
                technicians.map((technician) => (
                  <Stack
                    key={technician.actualTechnicianId}
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1}
                  >
                    <Stack spacing={0.35}>
                      <Typography variant="body2" fontWeight={800}>
                        {technician.technicianName || technician.technicianCode || `User ${technician.technicianId}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {technician.isPic ? "PIC" : "Technician"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() =>
                          upsertTechnicianMutation.mutate({
                            technicianId: technician.technicianId,
                            technicianCode: technician.technicianCode,
                            technicianName: technician.technicianName,
                            isPic: !technician.isPic
                          })
                        }
                      >
                        {technician.isPic ? "Clear PIC" : "Mark PIC"}
                      </Button>
                      <Button size="small" color="error" onClick={() => removeTechnicianMutation.mutate(technician.technicianId)}>
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <EmptyState title="No technicians assigned" description="Add the technicians who will execute or supervise the actual work." />
              )}
            </Stack>
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 7 }}>
          <SectionCard title="Approvals" description="Approve or revoke actual approval steps after completion.">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Step</TableCell>
                    <TableCell>Approver</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvals.length ? (
                    approvals.map((approval) => (
                      <TableRow key={approval.actualApprovalId}>
                        <TableCell>{approval.stepNo}</TableCell>
                        <TableCell>{approval.approverName || approval.approverCode || "-"}</TableCell>
                        <TableCell>
                          <WorkflowStatusChip type="approval" value={approval.approvalStatus} />
                        </TableCell>
                        <TableCell>{formatDateTime(approval.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                            <Button size="small" onClick={() => approveMutation.mutate(approval.stepNo)}>
                              Approve
                            </Button>
                            <Button size="small" color="warning" onClick={() => revokeMutation.mutate(approval.stepNo)}>
                              Revoke
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        No approval steps are attached to this actual.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid2>
      </Grid2>

      <SectionCard
        title="Actual Equipment Results"
        description={`${pendingResults} of ${equipments.length} equipment rows still show Pending.`}
      >
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Control No.</TableCell>
                <TableCell>Calib Date</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>NG Action</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipments.length ? (
                equipments.map((equipment) => (
                  <TableRow key={equipment.actualEquipmentId}>
                    <TableCell>{equipment.equipmentName || "Unnamed equipment"}</TableCell>
                    <TableCell>{equipment.controlNo || "-"}</TableCell>
                    <TableCell>{formatDate(equipment.calibDate)}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="result" value={equipment.resultStatus} />
                    </TableCell>
                    <TableCell>{equipment.ngAction || "-"}</TableCell>
                    <TableCell>{equipment.remarks || "-"}</TableCell>
                    <TableCell align="right">
                      <Button size="small" disabled={!isOngoing && !isWait} onClick={() => setResultTarget(equipment)}>
                        Record Result
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState title="No equipment rows yet" description="Plan-based actuals inherit equipment automatically. Standalone actuals can replace equipment while status is Wait." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard title="Summary Remarks" description="Save summary-level actual remarks back to the backend.">
        <Stack spacing={2}>
          {summaries.length ? (
            summaries.map((summary) => (
              <Paper key={summary.actualEquipmentSummaryId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack spacing={1.25}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {summary.equipmentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Done {summary.totalDoneCount}/{summary.totalEquipmentCount} · OK {summary.totalOkCount} · NG {summary.totalNgCount}
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={summaryRemarks[summary.actualEquipmentSummaryId] ?? ""}
                    onChange={(event) =>
                      setSummaryRemarks((current) => ({
                        ...current,
                        [summary.actualEquipmentSummaryId]: event.target.value
                      }))
                    }
                  />
                  <Button
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                    disabled={updateSummaryMutation.isPending}
                    onClick={() =>
                      updateSummaryMutation.mutate({
                        actualEquipmentSummaryId: summary.actualEquipmentSummaryId,
                        remarks: summaryRemarks[summary.actualEquipmentSummaryId] || null
                      })
                    }
                  >
                    Save Summary Remarks
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <EmptyState title="No summary rows yet" description="Summaries appear once equipment rows are attached to the actual." />
          )}
        </Stack>
      </SectionCard>

      <ReplaceEquipmentDialog
        open={replaceDialogOpen}
        isPending={replaceEquipmentsMutation.isPending}
        onClose={() => setReplaceDialogOpen(false)}
        onSubmit={async (items) => {
          await replaceEquipmentsMutation.mutateAsync(items);
          setReplaceDialogOpen(false);
        }}
      />

      <ResultDialog
        open={Boolean(resultTarget)}
        equipment={resultTarget}
        isPending={setResultMutation.isPending}
        onClose={() => setResultTarget(null)}
        onSubmit={async (payload) => {
          await setResultMutation.mutateAsync({
            actualEquipmentId: resultTarget.actualEquipmentId,
            payload
          });
          setResultTarget(null);
        }}
      />
    </PageFrame>
  );
}
