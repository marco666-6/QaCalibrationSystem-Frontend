import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Grid2 from "@mui/material/Grid2";
import { Alert, Chip, Stack, Typography } from "@mui/material";
import {
  useDefaultLocations,
  useEquipments,
  useSections,
  useUsers
} from "app/hooks/useCalibration";
import { formatDate } from "../shared/workspaceFormatters";
import { MetricCard, ModuleCard, PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";

function getOverdueCount(items) {
  const today = new Date();

  return items.filter((item) => {
    if (!item.nextCalibDate) return false;
    return new Date(item.nextCalibDate) < today;
  }).length;
}

export default function CalibrationDashboardContent() {
  const { data: equipments, isError, error } = useEquipments({ Page: 1, PageSize: 10 });
  const { data: sections } = useSections({ Page: 1, PageSize: 1 });
  const { data: defaultLocations } = useDefaultLocations({ Page: 1, PageSize: 1 });
  const { data: users } = useUsers({ Page: 1, PageSize: 1 });

  if (isError) {
    return (
      <PageFrame
        section="Calibration"
        title="Dashboard"
        description="Backend connectivity is in place, but the first equipment query failed."
      >
        <Alert severity="error">{error.message}</Alert>
      </PageFrame>
    );
  }

  const equipmentItems = equipments?.items ?? [];
  const rows = equipmentItems.slice(0, 5).map((item) => ({
    id: item.id,
    equipmentName: item.equipmentName,
    controlNo: item.controlNo,
    sectionName: item.sectionName,
    picName: item.picName,
    nextCalibDate: item.nextCalibDate,
    equipmentStatus: item.equipmentStatus
  }));

  return (
    <PageFrame
      section="Calibration"
      title="QA Calibration Dashboard"
      description="This frontend is now aligned to the calibration backend contract: equipments, sections, positions, default locations, users, and account management."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<PrecisionManufacturingOutlinedIcon />}
            title="Equipments"
            value={equipments?.totalCount ?? 0}
            caption="registered calibration assets"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<RuleOutlinedIcon />}
            title="Overdue"
            value={getOverdueCount(equipmentItems)}
            caption="from the current dashboard slice"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<TuneOutlinedIcon />}
            title="Sections"
            value={sections?.totalCount ?? 0}
            caption="available production areas"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<PeopleOutlinedIcon />}
            title="Users"
            value={users?.totalCount ?? 0}
            caption="managed system accounts"
          />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Calibration Workspace"
        description="The workspace is now focused on the calibration modules that exist in the backend today."
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6, xl: 4 }}>
            <ModuleCard
              title="Equipment Management"
              description="Track equipment identity, sections, PIC ownership, calibration interval, and current status."
              icon={<Inventory2OutlinedIcon />}
              to="/equipments"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 4 }}>
            <ModuleCard
              title="Master Data"
              description="Maintain sections, positions, and default locations from one place."
              icon={<TuneOutlinedIcon />}
              to="/master-data"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 4 }}>
            <ModuleCard
              title="User Administration"
              description="Create, update, reset, and deactivate calibration system users."
              icon={<PeopleOutlinedIcon />}
              to="/users"
            />
          </Grid2>
        </Grid2>
      </SectionCard>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Latest Equipment Snapshot"
            description="Recent records from the live equipment endpoint."
          >
            <SimpleTable
              columns={[
                { key: "equipmentName", label: "Equipment" },
                { key: "controlNo", label: "Control No." },
                { key: "sectionName", label: "Section" },
                { key: "picName", label: "PIC" },
                {
                  key: "nextCalibDate",
                  label: "Next Calibration",
                  render: (row) => formatDate(row.nextCalibDate)
                },
                {
                  key: "equipmentStatus",
                  label: "Status",
                  render: (row) => (
                    <Chip
                      size="small"
                      label={row.equipmentStatus}
                      color={row.equipmentStatus === "Active" ? "success" : "default"}
                      variant="outlined"
                    />
                  )
                }
              ]}
              rows={rows}
              emptyText="No equipment records are available yet."
            />
          </SectionCard>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="System Notes"
            description="A few quick checkpoints after the cleanup."
            sx={{ height: "100%" }}
          >
            <Stack spacing={1.5}>
              <Alert severity="success">The frontend base API points to the calibration backend.</Alert>
              <Alert severity="info">Profile uses `/users/me`, and authentication no longer expects tenant or member fields.</Alert>
              <Typography variant="body2" color="text.secondary">
                Default locations currently available: <strong>{defaultLocations?.totalCount ?? 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Next step for richer workflow pages would be bulk actions, import/export, and approval-specific modules once the backend endpoints are ready.
              </Typography>
            </Stack>
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageFrame>
  );
}
