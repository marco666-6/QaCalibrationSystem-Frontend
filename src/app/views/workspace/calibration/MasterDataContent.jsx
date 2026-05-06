import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
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
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import {
  useCreateDefaultLocation,
  useCreatePosition,
  useCreateSection,
  useDefaultLocations,
  useDeleteDefaultLocation,
  useDeletePosition,
  useDeleteSection,
  usePositions,
  useSections,
  useUpdateDefaultLocation,
  useUpdatePosition,
  useUpdateSection
} from "app/hooks/useCalibration";
import { formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";

function NamedEntityDialog({ open, mode, entity, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({ code: "", name: "", isActive: true });

  useEffect(() => {
    setForm({
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      isActive: initialData?.isActive ?? true
    });
  }, [initialData, open]);

  const isLocation = entity === "default location";

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "edit" ? `Edit ${entity}` : `Add ${entity}`}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {!isLocation ? (
            <TextField
              fullWidth
              label="Code"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            />
          ) : null}
          <TextField
            fullWidth
            label={isLocation ? "Default Location Name" : "Name"}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          {mode === "edit" ? (
            <TextField
              fullWidth
              select
              label="Status"
              value={form.isActive ? "active" : "inactive"}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "active" }))}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={() => onSubmit({ code: form.code.trim(), name: form.name.trim(), isActive: form.isActive })}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog({ open, itemLabel, isPending, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete Record</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          <strong>{itemLabel}</strong> will be permanently deleted.
        </Typography>
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

export default function MasterDataContent() {
  const [activeTab, setActiveTab] = useState("sections");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", entity: "section", data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const commonFilters = useMemo(
    () => ({
      Page: 1,
      PageSize: 100,
      IsActive: status === "" ? undefined : status === "active"
    }),
    [status]
  );

  const sectionsQuery = useSections({ ...commonFilters, Code: search || undefined, Name: search || undefined });
  const positionsQuery = usePositions({ ...commonFilters, Code: search || undefined, Name: search || undefined });
  const locationsQuery = useDefaultLocations({ ...commonFilters, Name: search || undefined });

  const createSection = useCreateSection();
  const updateSection = useUpdateSection(dialog.data?.id);
  const deleteSection = useDeleteSection();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition(dialog.data?.id);
  const deletePosition = useDeletePosition();
  const createDefaultLocation = useCreateDefaultLocation();
  const updateDefaultLocation = useUpdateDefaultLocation(dialog.data?.id);
  const deleteDefaultLocation = useDeleteDefaultLocation();

  const activeQuery =
    activeTab === "sections" ? sectionsQuery : activeTab === "positions" ? positionsQuery : locationsQuery;

  const items = activeQuery.data?.items ?? [];

  if (activeQuery.isError) {
    return (
      <PageFrame section="Calibration" title="Master Data" description="The master data module could not load.">
        <Alert severity="error">{activeQuery.error.message}</Alert>
      </PageFrame>
    );
  }

  const cards = [
    {
      title: "Sections",
      value: sectionsQuery.data?.totalCount ?? 0
    },
    {
      title: "Positions",
      value: positionsQuery.data?.totalCount ?? 0
    },
    {
      title: "Default Locations",
      value: locationsQuery.data?.totalCount ?? 0
    }
  ];

  const rows =
    activeTab === "sections"
      ? items.map((item) => ({
          id: item.sectionId,
          code: item.sectionCode,
          name: item.sectionName,
          isActive: item.isActive
        }))
      : activeTab === "positions"
        ? items.map((item) => ({
            id: item.positionId,
            code: item.positionCode,
            name: item.positionName,
            isActive: item.isActive
          }))
        : items.map((item) => ({
            id: item.defaultLocationId,
            code: "-",
            name: item.defaultLocationName,
            isActive: item.isActive
          }));

  return (
    <PageFrame
      section="Calibration"
      title="Master Data"
      description="Maintain lookup data used throughout the calibration system."
    >
      <Grid2 container spacing={2.5}>
        {cards.map((card) => (
          <Grid2 key={card.title} size={{ xs: 12, sm: 4 }}>
            <MetricCard icon={<AddIcon />} title={card.title} value={card.value} caption="available records" />
          </Grid2>
        ))}
      </Grid2>

      <SectionCard
        title="Configuration Tables"
        description="Sections, positions, and default locations are now separated from the old business template and mapped to calibration backend endpoints."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              setDialog({
                open: true,
                mode: "create",
                entity: activeTab === "sections" ? "section" : activeTab === "positions" ? "position" : "default location",
                data: null
              })
            }
          >
            Add Record
          </Button>
        }
      >
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Sections" value="sections" />
          <Tab label="Positions" value="positions" />
          <Tab label="Default Locations" value="locations" />
        </Tabs>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            placeholder={activeTab === "locations" ? "Search by name" : "Search by code or name"}
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
          <TextField size="small" select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Stack>

        <SimpleTable
          columns={[
            ...(activeTab === "locations" ? [] : [{ key: "code", label: "Code" }]),
            { key: "name", label: activeTab === "locations" ? "Default Location Name" : "Name" },
            {
              key: "isActive",
              label: "Status",
              render: (row) => (row.isActive ? "Active" : "Inactive")
            },
            {
              key: "actions",
              label: "Actions",
              align: "right",
              render: (row) => (
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() =>
                      setDialog({
                        open: true,
                        mode: "edit",
                        entity: activeTab === "sections" ? "section" : activeTab === "positions" ? "position" : "default location",
                        data: row
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteTarget({ ...row, entity: activeTab })}
                  >
                    Delete
                  </Button>
                </Stack>
              )
            }
          ]}
          rows={rows}
          emptyText={`No ${activeTab} records match the current filters.`}
        />
        <Typography variant="caption" color="text.secondary">
          Last query timestamp: {formatDateTime(new Date().toISOString())}
        </Typography>
      </SectionCard>

      <NamedEntityDialog
        open={dialog.open}
        mode={dialog.mode}
        entity={dialog.entity}
        initialData={dialog.data}
        isPending={
          createSection.isPending ||
          updateSection.isPending ||
          createPosition.isPending ||
          updatePosition.isPending ||
          createDefaultLocation.isPending ||
          updateDefaultLocation.isPending
        }
        onClose={() => setDialog({ open: false, mode: "create", entity: "section", data: null })}
        onSubmit={async (payload) => {
          if (dialog.entity === "section") {
            if (dialog.mode === "create") {
              await createSection.mutateAsync({
                sectionCode: payload.code,
                sectionName: payload.name
              });
            } else {
              await updateSection.mutateAsync({
                sectionCode: payload.code,
                sectionName: payload.name,
                isActive: payload.isActive
              });
            }
          } else if (dialog.entity === "position") {
            if (dialog.mode === "create") {
              await createPosition.mutateAsync({
                positionCode: payload.code,
                positionName: payload.name
              });
            } else {
              await updatePosition.mutateAsync({
                positionCode: payload.code,
                positionName: payload.name,
                isActive: payload.isActive
              });
            }
          } else if (dialog.mode === "create") {
            await createDefaultLocation.mutateAsync({
              defaultLocationName: payload.name
            });
          } else {
            await updateDefaultLocation.mutateAsync({
              defaultLocationName: payload.name,
              isActive: payload.isActive
            });
          }

          setDialog({ open: false, mode: "create", entity: "section", data: null });
        }}
      />

      <DeleteDialog
        open={Boolean(deleteTarget)}
        itemLabel={deleteTarget?.name}
        isPending={deleteSection.isPending || deletePosition.isPending || deleteDefaultLocation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget.entity === "sections") {
            await deleteSection.mutateAsync(deleteTarget.id);
          } else if (deleteTarget.entity === "positions") {
            await deletePosition.mutateAsync(deleteTarget.id);
          } else {
            await deleteDefaultLocation.mutateAsync(deleteTarget.id);
          }

          setDeleteTarget(null);
        }}
      />
    </PageFrame>
  );
}
