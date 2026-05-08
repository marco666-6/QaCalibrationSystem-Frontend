import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Grid2 from "@mui/material/Grid2";
import { Button, Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCalibActuals, useCalibPlans, useDueEquipments } from "app/hooks/useCalibration";
import { formatDate } from "../shared/workspaceFormatters";
import { MetricCard, ModuleCard, PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";
import { EmptyState, WorkflowStatusChip } from "./CalibrationShared";

export default function CalibrationDashboardPage() {
  const now = new Date();
  const dashboardMonth = now.getMonth() + 1;
  const dashboardYear = now.getFullYear();

  const plansQuery = useCalibPlans({ Page: 1, PageSize: 20 });
  const actualsQuery = useCalibActuals({ Page: 1, PageSize: 20 });
  const dueQuery = useDueEquipments({
    calibMonth: dashboardMonth,
    calibYear: dashboardYear
  });

  const dueEquipments = dueQuery.data ?? [];
  const overdueCount = dueEquipments.filter((entry) => entry.isOverdue).length;
  const dueCount = dueEquipments.length - overdueCount;
  const pendingPlanApprovals =
    plansQuery.data?.items?.filter((entry) => entry.planStatus === "Pending Approval").length ?? 0;
  const pendingActualApprovals =
    actualsQuery.data?.items?.filter((entry) => entry.actualStatus === "Completed").length ?? 0;

  return (
    <PageFrame
      section="Calibration Workspace"
      title="Industrial Calibration Operations"
      description="Monitor the current calibration cycle, review approval queues, and jump directly into plan, actual, and equipment work without leaving the authenticated Matx workspace."
      action={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button component={RouterLink} to="/calibration-plans" variant="contained">
            Create or Review Plans
          </Button>
          <Button component={RouterLink} to="/calibration-actuals" variant="outlined">
            Run Actuals
          </Button>
        </Stack>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<PrecisionManufacturingOutlinedIcon />}
            title="Due Equipment"
            value={dueCount}
            caption={`${dashboardMonth}/${dashboardYear} due list`}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<WarningAmberOutlinedIcon />}
            title="Overdue Equipment"
            value={overdueCount}
            caption="requires attention before cycle slips"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<FactCheckOutlinedIcon />}
            title="Pending Plan Approvals"
            value={pendingPlanApprovals}
            caption="plans still waiting in approval flow"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<AssignmentTurnedInOutlinedIcon />}
            title="Pending Actual Approvals"
            value={pendingActualApprovals}
            caption="completed actuals still awaiting sign-off"
          />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Quick Actions"
        description="The workspace is organized around the real backend lifecycle: planning, execution, supporting master data, and controlled reminders."
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard
              title="Calibration Plans"
              description="Create monthly plans, refresh due equipment, manage technicians, and move approvals through to lock."
              icon={<FactCheckOutlinedIcon />}
              to="/calibration-plans"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard
              title="Calibration Actuals"
              description="Start execution from locked plans or standalone actuals, record OK/NG results, and release final PDFs."
              icon={<AssignmentTurnedInOutlinedIcon />}
              to="/calibration-actuals"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard
              title="Equipment Registry"
              description="Maintain control numbers, intervals, due lookups, and live status used by the plan import workflow."
              icon={<PrecisionManufacturingOutlinedIcon />}
              to="/equipments"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard
              title="Master Data"
              description="Manage vendors, default locations, section PICs, role assignments, reminders, and users."
              icon={<WarningAmberOutlinedIcon />}
              to="/master-data"
            />
          </Grid2>
        </Grid2>
      </SectionCard>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, xl: 6 }}>
          <SectionCard
            title="Due Equipment Snapshot"
            description="Current month equipment due list pulled from `/api/equipments/due`."
          >
            {dueQuery.data?.length ? (
              <SimpleTable
                columns={[
                  { key: "equipmentName", label: "Equipment" },
                  { key: "controlNo", label: "Control No." },
                  { key: "location", label: "Location" },
                  {
                    key: "nextCalibDate",
                    label: "Next Calib",
                    render: (row) => formatDate(row.nextCalibDate)
                  },
                  {
                    key: "isOverdue",
                    label: "State",
                    render: (row) => (
                      <Chip
                        size="small"
                        color={row.isOverdue ? "error" : "warning"}
                        label={row.isOverdue ? "Overdue" : "Due"}
                        sx={{ fontWeight: 700 }}
                      />
                    )
                  }
                ]}
                rows={dueEquipments.slice(0, 8)}
                emptyText="No due equipment for the current cycle."
              />
            ) : (
              <EmptyState
                title="No due equipment found"
                description="The backend returned an empty due list for the current month and year."
              />
            )}
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 6 }}>
          <SectionCard
            title="Approval Queue"
            description="Recent plans and actuals that are still in motion."
          >
            <Stack spacing={1.25}>
              {(plansQuery.data?.items || []).slice(0, 4).map((plan) => (
                <Stack
                  key={`plan-${plan.planId}`}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1}
                  sx={{ py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Stack spacing={0.35}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {plan.planCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Plan · {plan.calibType} · {plan.calibMonth}/{plan.calibYear}
                    </Typography>
                  </Stack>
                  <WorkflowStatusChip type="plan" value={plan.planStatus} />
                </Stack>
              ))}

              {(actualsQuery.data?.items || []).slice(0, 4).map((actual) => (
                <Stack
                  key={`actual-${actual.actualId}`}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1}
                  sx={{ py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Stack spacing={0.35}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {actual.actualCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actual · {actual.calibType} · {actual.calibMonth}/{actual.calibYear}
                    </Typography>
                  </Stack>
                  <WorkflowStatusChip type="actual" value={actual.actualStatus} />
                </Stack>
              ))}

              {!plansQuery.data?.items?.length && !actualsQuery.data?.items?.length ? (
                <EmptyState
                  title="No active calibration flow"
                  description="Once plans and actuals are created, the approval queue will appear here."
                />
              ) : null}
            </Stack>
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageFrame>
  );
}
