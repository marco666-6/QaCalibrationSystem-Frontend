import { useEffect, useState } from "react";
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
import { useCalibPlans, useCreateCalibPlan, useExternals, useUserOptions } from "app/hooks/useCalibration";
import { CALIBRATION_TYPES, PLAN_STATUSES } from "app/utils/constant";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { EmptyState, UserLookupField, WorkflowStatusChip, formatMonthYear, monthOptions, yearsAroundCurrent } from "./CalibrationShared";

function PlanCreateDialog({ open, isPending, userOptions, userOptionsLoading, externalOptions, onClose, onSubmit }) {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [calibType, setCalibType] = useState("Internal");
  const [preparer, setPreparer] = useState(null);
  const [checker, setChecker] = useState(null);
  const [approver, setApprover] = useState(null);
  const [externalId, setExternalId] = useState("");
  const [remarks, setRemarks] = useState("");

  const selectedExternal = externalOptions.find((entry) => entry.externalId === Number(externalId));

  useEffect(() => {
    if (!open) return;
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
      <DialogTitle>Create Calibration Plan</DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
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
            onSubmit({
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
            })
          }
        >
          {isPending ? "Creating..." : "Create Plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CalibrationPlansPage() {
  const [filters, setFilters] = useState({
    calibMonth: "",
    calibYear: "",
    calibType: "",
    planStatus: ""
  });
  const [openCreate, setOpenCreate] = useState(false);

  const navigate = useNavigate();

  const plansQuery = useCalibPlans({
    Page: 1,
    PageSize: 100,
    CalibMonth: filters.calibMonth ? Number(filters.calibMonth) : undefined,
    CalibYear: filters.calibYear ? Number(filters.calibYear) : undefined,
    CalibType: filters.calibType || undefined,
    PlanStatus: filters.planStatus || undefined
  });
  const createPlanMutation = useCreateCalibPlan();
  const userOptionsQuery = useUserOptions({ Top: 50 });
  const externalsQuery = useExternals();

  const rows = plansQuery.data?.items ?? [];
  const lockedCount = rows.filter((entry) => entry.planStatus === "Locked").length;
  const pendingCount = rows.filter((entry) => entry.planStatus === "Pending Approval").length;

  return (
    <PageFrame
      section="Calibration Planning"
      title="Calibration Plans"
      description="Create and review plan headers before moving into technician assignment, due-equipment selection, approvals, and final plan lock."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Create Plan
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Visible Plans" value={rows.length} caption="current query slice" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Pending Approval" value={pendingCount} caption="still moving through sign-off" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Locked Plans" value={lockedCount} caption="ready for actual execution" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Plan Register"
        description="Use the real backend filters for month, year, calibration type, and plan status."
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
            <TextField select fullWidth label="Status" value={filters.planStatus} onChange={(event) => setFilters((current) => ({ ...current, planStatus: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {PLAN_STATUSES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>

        {plansQuery.isError ? <Alert severity="error">{plansQuery.error.message}</Alert> : null}

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Plan Code</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Preparer</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plansQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    Loading plans...
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.planId} hover>
                    <TableCell>
                      <Stack spacing={0.4}>
                        <Typography variant="body2" fontWeight={800}>
                          {row.planCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.externalCompany || "No external vendor"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatMonthYear(row.calibMonth, row.calibYear)}</TableCell>
                    <TableCell>{row.calibType}</TableCell>
                    <TableCell>{row.preparerName || "-"}</TableCell>
                    <TableCell>{row.approverName || "-"}</TableCell>
                    <TableCell>
                      <WorkflowStatusChip type="plan" value={row.planStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        endIcon={<ArrowForwardOutlinedIcon />}
                        onClick={() => navigate(`/calibration-plans/${row.planId}`)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState title="No plans found" description="Create the first plan or clear the active filters." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <PlanCreateDialog
        open={openCreate}
        isPending={createPlanMutation.isPending}
        userOptions={userOptionsQuery.data ?? []}
        userOptionsLoading={userOptionsQuery.isLoading}
        externalOptions={externalsQuery.data ?? []}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (payload) => {
          const response = await createPlanMutation.mutateAsync(payload);
          setOpenCreate(false);

          const createdPlan = response?.data ?? response;
          if (createdPlan?.planId) {
            navigate(`/calibration-plans/${createdPlan.planId}`);
          }
        }}
      />
    </PageFrame>
  );
}
