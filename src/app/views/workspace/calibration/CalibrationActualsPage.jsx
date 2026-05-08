import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useNavigate } from "react-router-dom";
import { useCalibActuals, useCalibPlans, useCreateCalibActual, useExternals, useUserOptions } from "app/hooks/useCalibration";
import { ACTUAL_STATUSES, CALIBRATION_TYPES } from "app/utils/constant";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { EmptyState, UserLookupField, WorkflowStatusChip, formatMonthYear, monthOptions, yearsAroundCurrent } from "./CalibrationShared";

function ActualCreateDialog({
  open,
  isPending,
  lockedPlans,
  userOptions,
  userOptionsLoading,
  externalOptions,
  onClose,
  onSubmit
}) {
  const currentDate = new Date();
  const [mode, setMode] = useState("plan");
  const [planId, setPlanId] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [calibType, setCalibType] = useState("Internal");
  const [preparer, setPreparer] = useState(null);
  const [checker, setChecker] = useState(null);
  const [approver, setApprover] = useState(null);
  const [externalId, setExternalId] = useState("");
  const [remarks, setRemarks] = useState("");

  const selectedPlan = lockedPlans.find((entry) => String(entry.planId) === planId);
  const selectedExternal = externalOptions.find((entry) => entry.externalId === Number(externalId));

  useEffect(() => {
    if (!open) return;
    setMode("plan");
    setPlanId("");
    setMonth(currentDate.getMonth() + 1);
    setYear(currentDate.getFullYear());
    setCalibType("Internal");
    setPreparer(null);
    setChecker(null);
    setApprover(null);
    setExternalId("");
    setRemarks("");
  }, [open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Calibration Actual</DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="Creation Mode" value={mode} onChange={(event) => setMode(event.target.value)}>
              <MenuItem value="plan">From Locked Plan</MenuItem>
              <MenuItem value="standalone">Standalone Actual</MenuItem>
            </TextField>
          </Grid2>

          {mode === "plan" ? (
            <Grid2 size={{ xs: 12, md: 8 }}>
              <TextField select fullWidth label="Locked Plan" value={planId} onChange={(event) => setPlanId(event.target.value)}>
                <MenuItem value="">Select plan</MenuItem>
                {lockedPlans.map((entry) => (
                  <MenuItem key={entry.planId} value={entry.planId}>
                    {entry.planCode} · {formatMonthYear(entry.calibMonth, entry.calibYear)} · {entry.calibType}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
          ) : (
            <>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Calibration Month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                  {monthOptions.map((entry) => (
                    <MenuItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Calibration Year" value={year} onChange={(event) => setYear(Number(event.target.value))}>
                  {yearsAroundCurrent(4).map((entry) => (
                    <MenuItem key={entry} value={entry}>
                      {entry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Calibration Type" value={calibType} onChange={(event) => setCalibType(event.target.value)}>
                  {CALIBRATION_TYPES.map((entry) => (
                    <MenuItem key={entry} value={entry}>
                      {entry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <UserLookupField label="Preparer" value={preparer} onChange={setPreparer} options={userOptions} loading={userOptionsLoading} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <UserLookupField label="Checker" value={checker} onChange={setChecker} options={userOptions} loading={userOptionsLoading} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <UserLookupField label="Approver" value={approver} onChange={setApprover} options={userOptions} loading={userOptionsLoading} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="External Vendor" value={externalId} onChange={(event) => setExternalId(event.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {externalOptions.map((entry) => (
                    <MenuItem key={entry.externalId} value={entry.externalId}>
                      {entry.externalCompany}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
            </>
          )}

          <Grid2 size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={3} label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
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
            onSubmit(
              mode === "plan"
                ? {
                    planId: planId ? Number(planId) : null,
                    calibMonth: selectedPlan?.calibMonth ?? month,
                    calibYear: selectedPlan?.calibYear ?? year,
                    calibType: selectedPlan?.calibType ?? calibType,
                    preparerId: selectedPlan?.preparerId ?? null,
                    preparerCode: selectedPlan?.preparerCode ?? null,
                    preparerName: selectedPlan?.preparerName ?? null,
                    checkerId: selectedPlan?.checkerId ?? null,
                    checkerCode: selectedPlan?.checkerCode ?? null,
                    checkerName: selectedPlan?.checkerName ?? null,
                    approverId: selectedPlan?.approverId ?? null,
                    approverCode: selectedPlan?.approverCode ?? null,
                    approverName: selectedPlan?.approverName ?? null,
                    externalId: selectedPlan?.externalId ?? null,
                    externalCompany: selectedPlan?.externalCompany ?? null,
                    remarks: remarks.trim() || null
                  }
                : {
                    planId: null,
                    calibMonth: month,
                    calibYear: year,
                    calibType,
                    preparerId: preparer?.userId ?? null,
                    preparerCode: preparer?.username ?? null,
                    preparerName: preparer?.employeeName ?? null,
                    checkerId: checker?.userId ?? null,
                    checkerCode: checker?.username ?? null,
                    checkerName: checker?.employeeName ?? null,
                    approverId: approver?.userId ?? null,
                    approverCode: approver?.username ?? null,
                    approverName: approver?.employeeName ?? null,
                    externalId: externalId ? Number(externalId) : null,
                    externalCompany: selectedExternal?.externalCompany ?? null,
                    remarks: remarks.trim() || null
                  }
            )
          }
        >
          {isPending ? "Creating..." : "Create Actual"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CalibrationActualsPage() {
  const [filters, setFilters] = useState({
    calibMonth: "",
    calibYear: "",
    calibType: "",
    actualStatus: ""
  });
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();

  const actualsQuery = useCalibActuals({
    Page: 1,
    PageSize: 100,
    CalibMonth: filters.calibMonth ? Number(filters.calibMonth) : undefined,
    CalibYear: filters.calibYear ? Number(filters.calibYear) : undefined,
    CalibType: filters.calibType || undefined,
    ActualStatus: filters.actualStatus || undefined
  });
  const lockedPlansQuery = useCalibPlans({
    Page: 1,
    PageSize: 100,
    PlanStatus: "Locked"
  });
  const createActualMutation = useCreateCalibActual();
  const userOptionsQuery = useUserOptions({ Top: 50 });
  const externalsQuery = useExternals();

  const rows = actualsQuery.data?.items ?? [];
  const ongoingCount = rows.filter((entry) => entry.actualStatus === "Ongoing").length;
  const completedCount = rows.filter((entry) => entry.actualStatus === "Completed").length;

  const lockedPlanOptions = useMemo(
    () => (lockedPlansQuery.data?.items ?? []).map((entry) => ({ ...entry })),
    [lockedPlansQuery.data?.items]
  );

  return (
    <PageFrame
      section="Calibration Execution"
      title="Calibration Actuals"
      description="Create actual work orders from locked plans or as standalone executions, then move into live equipment results and final approvals."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Create Actual
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Visible Actuals" value={rows.length} caption="current query slice" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Ongoing" value={ongoingCount} caption="execution currently in progress" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Completed" value={completedCount} caption="awaiting or past approval flow" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Actual Register"
        description="Use the real backend filters for month, year, type, and actual status."
      >
        <Grid2 container spacing={1.5}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField select fullWidth label="Month" value={filters.calibMonth} onChange={(event) => setFilters((current) => ({ ...current, calibMonth: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {monthOptions.map((entry) => (
                <MenuItem key={entry.value} value={entry.value}>
                  {entry.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField select fullWidth label="Year" value={filters.calibYear} onChange={(event) => setFilters((current) => ({ ...current, calibYear: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {yearsAroundCurrent(4).map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField select fullWidth label="Type" value={filters.calibType} onChange={(event) => setFilters((current) => ({ ...current, calibType: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {CALIBRATION_TYPES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <TextField select fullWidth label="Status" value={filters.actualStatus} onChange={(event) => setFilters((current) => ({ ...current, actualStatus: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {ACTUAL_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>

        {actualsQuery.isError ? <Alert severity="error">{actualsQuery.error.message}</Alert> : null}

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Actual Code</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Started</TableCell>
                <TableCell align="right">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actualsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    Loading actuals...
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.actualId} hover>
                    <TableCell>
                      <Stack spacing={0.4}>
                        <Typography variant="body2" fontWeight={800}>
                          {row.actualCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.externalCompany || "No external vendor"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.planId ? `Plan ${row.planId}` : "Standalone"}</TableCell>
                    <TableCell>{formatMonthYear(row.calibMonth, row.calibYear)}</TableCell>
                    <TableCell>{row.calibType}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="actual" value={row.actualStatus} />
                    </TableCell>
                    <TableCell>{row.startedAt ? new Date(row.startedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell align="right">
                      <Button size="small" endIcon={<ArrowForwardOutlinedIcon />} onClick={() => navigate(`/calibration-actuals/${row.actualId}`)}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState title="No actuals found" description="Create the first actual from a locked plan or as a standalone record." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <ActualCreateDialog
        open={openCreate}
        isPending={createActualMutation.isPending}
        lockedPlans={lockedPlanOptions}
        userOptions={userOptionsQuery.data ?? []}
        userOptionsLoading={userOptionsQuery.isLoading}
        externalOptions={externalsQuery.data ?? []}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (payload) => {
          const response = await createActualMutation.mutateAsync(payload);
          setOpenCreate(false);

          const createdActual = response?.data ?? response;
          if (createdActual?.actualId) {
            navigate(`/calibration-actuals/${createdActual.actualId}`);
          }
        }}
      />
    </PageFrame>
  );
}
