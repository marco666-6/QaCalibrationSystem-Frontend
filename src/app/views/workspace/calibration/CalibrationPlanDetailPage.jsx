import { useEffect, useMemo, useState } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Button,
  Checkbox,
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
  useApprovePlanStep,
  useCalibPlanFull,
  useDeleteCalibPlan,
  useExternals,
  useGeneratePlanPdf,
  useLoadPlanDueEquipments,
  useLockCalibPlan,
  useRemovePlanTechnician,
  useRevokePlanStep,
  useSetPlanEquipmentSelected,
  useSubmitCalibPlan,
  useUpdateCalibPlan,
  useUpdatePlanSummaryRemarks,
  useUpsertPlanTechnician,
  useUserOptions
} from "app/hooks/useCalibration";
import { CALIBRATION_TYPES } from "app/utils/constant";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { formatDateTime } from "../shared/workspaceFormatters";
import {
  ConfirmationDialog,
  EmptyState,
  PdfActionButton,
  UserLookupField,
  WorkflowStatusChip,
  formatMonthYear
} from "./CalibrationShared";

function TechnicianForm({ userOptions, userOptionsLoading, isPending, onSubmit }) {
  const [technician, setTechnician] = useState(null);
  const [isPic, setIsPic] = useState(false);

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
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

export default function CalibrationPlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const numericPlanId = Number(planId);

  const planQuery = useCalibPlanFull(numericPlanId, { enabled: Number.isFinite(numericPlanId) });
  const userOptionsQuery = useUserOptions({ Top: 50 });
  const externalsQuery = useExternals();

  const updatePlanMutation = useUpdateCalibPlan(numericPlanId);
  const deletePlanMutation = useDeleteCalibPlan();
  const submitPlanMutation = useSubmitCalibPlan(numericPlanId);
  const lockPlanMutation = useLockCalibPlan(numericPlanId);
  const refreshDueMutation = useLoadPlanDueEquipments(numericPlanId);
  const upsertTechnicianMutation = useUpsertPlanTechnician(numericPlanId);
  const removeTechnicianMutation = useRemovePlanTechnician(numericPlanId);
  const setEquipmentSelectedMutation = useSetPlanEquipmentSelected(numericPlanId);
  const updateSummaryMutation = useUpdatePlanSummaryRemarks(numericPlanId);
  const approveMutation = useApprovePlanStep(numericPlanId);
  const revokeMutation = useRevokePlanStep(numericPlanId);
  const generatePdfMutation = useGeneratePlanPdf(numericPlanId);

  const [headerForm, setHeaderForm] = useState(null);
  const [summaryRemarks, setSummaryRemarks] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const data = planQuery.data;
  const header = data?.header;
  const technicians = data?.technicians ?? [];
  const equipments = data?.equipments ?? [];
  const summaries = data?.equipmentSummaries ?? [];
  const approvals = data?.approvals ?? [];

  useEffect(() => {
    if (!header) return;

    setHeaderForm({
      preparer: header.preparerId
        ? {
            userId: header.preparerId,
            username: header.preparerCode,
            employeeName: header.preparerName
          }
        : null,
      checker: header.checkerId
        ? {
            userId: header.checkerId,
            username: header.checkerCode,
            employeeName: header.checkerName
          }
        : null,
      approver: header.approverId
        ? {
            userId: header.approverId,
            username: header.approverCode,
            employeeName: header.approverName
          }
        : null,
      externalId: header.externalId ? String(header.externalId) : "",
      remarks: header.remarks ?? ""
    });
  }, [header]);

  useEffect(() => {
    const next = {};
    summaries.forEach((entry) => {
      next[entry.planEquipmentSummaryId] = entry.remarks ?? "";
    });
    setSummaryRemarks(next);
  }, [summaries]);

  const selectedEquipments = equipments.filter((entry) => entry.isSelected).length;
  const allApprovalsApproved = approvals.length > 0 && approvals.every((entry) => entry.approvalStatus === "Approved");
  const isDraft = header?.planStatus === "Draft";
  const isLocked = header?.planStatus === "Locked";

  const selectedExternal = externalsQuery.data?.find((entry) => String(entry.externalId) === headerForm?.externalId);

  const actionButtons = useMemo(
    () => (
      <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
        <Button variant="text" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/calibration-plans")}>
          Back to Plans
        </Button>
        <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} disabled={!isDraft || refreshDueMutation.isPending} onClick={() => refreshDueMutation.mutate()}>
          {refreshDueMutation.isPending ? "Refreshing..." : equipments.length ? "Refresh Due Equipment" : "Load Due Equipment"}
        </Button>
        <Button variant="outlined" startIcon={<SendOutlinedIcon />} disabled={!isDraft || submitPlanMutation.isPending} onClick={() => submitPlanMutation.mutate()}>
          {submitPlanMutation.isPending ? "Submitting..." : "Submit"}
        </Button>
        <Button variant="outlined" startIcon={<LockOutlinedIcon />} disabled={isLocked || !allApprovalsApproved || lockPlanMutation.isPending} onClick={() => lockPlanMutation.mutate()}>
          {lockPlanMutation.isPending ? "Locking..." : "Lock"}
        </Button>
        <PdfActionButton
          url={header?.pdfFileUrl}
          onGenerate={() => generatePdfMutation.mutate()}
          isGenerating={generatePdfMutation.isPending}
          disabled={!header}
          label="Open Plan PDF"
        />
        <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />} disabled={deletePlanMutation.isPending} onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </Stack>
    ),
    [
      allApprovalsApproved,
      deletePlanMutation.isPending,
      equipments.length,
      generatePdfMutation,
      header,
      isDraft,
      isLocked,
      lockPlanMutation,
      navigate,
      refreshDueMutation,
      submitPlanMutation
    ]
  );

  if (planQuery.isLoading || !headerForm) {
    return (
      <PageFrame section="Calibration Planning" title="Loading plan detail" description="Fetching the full plan workflow.">
        <Alert severity="info">Loading calibration plan detail...</Alert>
      </PageFrame>
    );
  }

  if (planQuery.isError || !header) {
    return (
      <PageFrame section="Calibration Planning" title="Plan not available" description="The selected calibration plan could not be loaded.">
        <Alert severity="error">{planQuery.error?.message || "Plan detail could not be loaded."}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="Calibration Planning"
      title={header.planCode}
      description={`${formatMonthYear(header.calibMonth, header.calibYear)} · ${header.calibType} plan workflow`}
      action={actionButtons}
    >
      <SectionCard
        title="Plan Header"
        description="Update workflow assignees, external vendor linkage, and summary remarks before final lock."
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Status" value={header.planStatus} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Period" value={formatMonthYear(header.calibMonth, header.calibYear)} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Type" value={header.calibType} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Created" value={formatDateTime(header.createdAt)} disabled />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <UserLookupField
              label="Preparer"
              value={headerForm.preparer}
              onChange={(value) => setHeaderForm((current) => ({ ...current, preparer: value }))}
              options={userOptionsQuery.data ?? []}
              loading={userOptionsQuery.isLoading}
              disabled={isLocked}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <UserLookupField
              label="Checker"
              value={headerForm.checker}
              onChange={(value) => setHeaderForm((current) => ({ ...current, checker: value }))}
              options={userOptionsQuery.data ?? []}
              loading={userOptionsQuery.isLoading}
              disabled={isLocked}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <UserLookupField
              label="Approver"
              value={headerForm.approver}
              onChange={(value) => setHeaderForm((current) => ({ ...current, approver: value }))}
              options={userOptionsQuery.data ?? []}
              loading={userOptionsQuery.isLoading}
              disabled={isLocked}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="External Vendor"
              value={headerForm.externalId}
              disabled={isLocked}
              onChange={(event) => setHeaderForm((current) => ({ ...current, externalId: event.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {(externalsQuery.data ?? []).map((entry) => (
                <MenuItem key={entry.externalId} value={entry.externalId}>
                  {entry.externalCompany}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Remarks"
              value={headerForm.remarks}
              disabled={isLocked}
              onChange={(event) => setHeaderForm((current) => ({ ...current, remarks: event.target.value }))}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Button
              variant="contained"
              disabled={isLocked || updatePlanMutation.isPending}
              onClick={() =>
                updatePlanMutation.mutate({
                  preparerId: headerForm.preparer?.userId ?? null,
                  preparerCode: headerForm.preparer?.username ?? null,
                  preparerName: headerForm.preparer?.employeeName ?? null,
                  checkerId: headerForm.checker?.userId ?? null,
                  checkerCode: headerForm.checker?.username ?? null,
                  checkerName: headerForm.checker?.employeeName ?? null,
                  approverId: headerForm.approver?.userId ?? null,
                  approverCode: headerForm.approver?.username ?? null,
                  approverName: headerForm.approver?.employeeName ?? null,
                  externalId: headerForm.externalId ? Number(headerForm.externalId) : null,
                  externalCompany: selectedExternal?.externalCompany ?? null,
                  remarks: headerForm.remarks.trim() || null
                })
              }
            >
              {updatePlanMutation.isPending ? "Saving..." : "Save Header"}
            </Button>
          </Grid2>
        </Grid2>
      </SectionCard>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, xl: 5 }}>
          <SectionCard title="Technicians" description="Assign technicians and manage the PIC flag used on the plan.">
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
                    key={technician.planTechnicianId}
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
                        {technician.technicianCode || "No code"}
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
                <EmptyState title="No technicians assigned" description="Add technicians here before submitting the plan for approval." />
              )}
            </Stack>
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 7 }}>
          <SectionCard
            title="Approvals"
            description="Approve or revoke individual steps using the backend approval workflow."
          >
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
                      <TableRow key={approval.planApprovalId}>
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
                        No approval steps are attached to this plan.
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
        title="Plan Equipment"
        description={`Select the equipment rows that should remain in scope for this plan. ${selectedEquipments} of ${equipments.length} rows are selected.`}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              disabled={setEquipmentSelectedMutation.isPending || !equipments.length}
              onClick={async () => {
                for (const equipment of equipments) {
                  if (!equipment.isSelected) {
                    await setEquipmentSelectedMutation.mutateAsync({
                      planEquipmentId: equipment.planEquipmentId,
                      isSelected: true
                    });
                  }
                }
              }}
            >
              Select All
            </Button>
            <Button
              size="small"
              disabled={setEquipmentSelectedMutation.isPending || !equipments.length}
              onClick={async () => {
                for (const equipment of equipments) {
                  if (equipment.isSelected) {
                    await setEquipmentSelectedMutation.mutateAsync({
                      planEquipmentId: equipment.planEquipmentId,
                      isSelected: false
                    });
                  }
                }
              }}
            >
              Deselect All
            </Button>
          </Stack>
        }
      >
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Select</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Control No.</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Overdue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipments.length ? (
                equipments.map((equipment) => (
                  <TableRow key={equipment.planEquipmentId}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={equipment.isSelected}
                        onChange={(event) =>
                          setEquipmentSelectedMutation.mutate({
                            planEquipmentId: equipment.planEquipmentId,
                            isSelected: event.target.checked
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {equipment.equipmentName || "Unnamed equipment"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[equipment.brand, equipment.model, equipment.serialNo].filter(Boolean).join(" / ") || "No detail"}
                      </Typography>
                    </TableCell>
                    <TableCell>{equipment.controlNo || "-"}</TableCell>
                    <TableCell>{equipment.location || "-"}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="result" value={equipment.isOverdue ? "NG" : "OK"} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      title="No equipment loaded yet"
                      description="Use the due-equipment action above to load or refresh equipment rows from the backend due list."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard title="Summary Remarks" description="Edit summary-level remarks by equipment grouping and save each row back to the backend.">
        <Stack spacing={2}>
          {summaries.length ? (
            summaries.map((summary) => (
              <Paper key={summary.planEquipmentSummaryId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack spacing={1.25}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {summary.equipmentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Section ID: {summary.sectionId ?? "-"} · Total: {summary.totalEquipmentCount}
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={summaryRemarks[summary.planEquipmentSummaryId] ?? ""}
                    onChange={(event) =>
                      setSummaryRemarks((current) => ({
                        ...current,
                        [summary.planEquipmentSummaryId]: event.target.value
                      }))
                    }
                  />
                  <Button
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                    disabled={updateSummaryMutation.isPending}
                    onClick={() =>
                      updateSummaryMutation.mutate({
                        planEquipmentSummaryId: summary.planEquipmentSummaryId,
                        remarks: summaryRemarks[summary.planEquipmentSummaryId] || null
                      })
                    }
                  >
                    Save Summary Remarks
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <EmptyState title="No summary rows yet" description="Summaries are rebuilt from the selected equipment list." />
          )}
        </Stack>
      </SectionCard>

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete Calibration Plan"
        description={`Delete ${header.planCode}? This removes the plan record from the active workspace.`}
        confirmColor="error"
        confirmLabel="Delete"
        isPending={deletePlanMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deletePlanMutation.mutateAsync(numericPlanId);
          navigate("/calibration-plans");
        }}
      />
    </PageFrame>
  );
}
