import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import {
  useAssignCalibRole,
  useCalibRolesByUser,
  useCalibRoleUsers,
  useCreateDefaultLocation,
  useCreateExternal,
  useCreateSectionPic,
  useDefaultLocations,
  useDeleteDefaultLocation,
  useDeleteExternal,
  useDeleteSectionPic,
  useExternals,
  useRevokeCalibRole,
  useSectionPics,
  useSendDueDateReminders,
  useUpdateDefaultLocation,
  useUpdateExternal,
  useUpdateSectionPic,
  useUserOptions
} from "app/hooks/useCalibration";
import { CALIBRATION_ROLES, SECTION_PIC_ROLES } from "app/utils/constant";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { BooleanFilterField, ConfirmationDialog, EmptyState, UserLookupField } from "./CalibrationShared";

function ExternalDialog({ open, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    externalCompany: initialData?.externalCompany ?? "",
    externalEmail: initialData?.externalEmail ?? "",
    externalPhone: initialData?.externalPhone ?? "",
    address: initialData?.address ?? ""
  });

  useEffect(() => {
    setForm({
      externalCompany: initialData?.externalCompany ?? "",
      externalEmail: initialData?.externalEmail ?? "",
      externalPhone: initialData?.externalPhone ?? "",
      address: initialData?.address ?? ""
    });
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Update External Vendor" : "Create External Vendor"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField label="Company" value={form.externalCompany} onChange={(event) => setForm((current) => ({ ...current, externalCompany: event.target.value }))} />
          <TextField label="Email" type="email" value={form.externalEmail} onChange={(event) => setForm((current) => ({ ...current, externalEmail: event.target.value }))} />
          <TextField label="Phone" value={form.externalPhone} onChange={(event) => setForm((current) => ({ ...current, externalPhone: event.target.value }))} />
          <TextField label="Address" multiline minRows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
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
              externalCompany: form.externalCompany.trim(),
              externalEmail: form.externalEmail.trim() || null,
              externalPhone: form.externalPhone.trim() || null,
              address: form.address.trim() || null
            })
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DefaultLocationDialog({ open, initialData, isPending, onClose, onSubmit }) {
  const [name, setName] = useState(initialData?.defaultLocationName ?? "");

  useEffect(() => {
    setName(initialData?.defaultLocationName ?? "");
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initialData ? "Update Default Location" : "Create Default Location"}</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth label="Location Name" value={name} onChange={(event) => setName(event.target.value)} sx={{ mt: 0.5 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" disabled={isPending} onClick={() => onSubmit({ defaultLocationName: name.trim() })}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionPicDialog({ open, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    sectionId: initialData?.sectionId ?? "",
    sectionName: initialData?.sectionName ?? "",
    sectionEmail: initialData?.sectionEmail ?? "",
    employeeCode: initialData?.employeeCode ?? "",
    employeeName: initialData?.employeeName ?? "",
    email: initialData?.email ?? "",
    picRole: initialData?.picRole ?? "PIC",
    isActive: initialData?.isActive ?? true
  });

  useEffect(() => {
    setForm({
      sectionId: initialData?.sectionId ?? "",
      sectionName: initialData?.sectionName ?? "",
      sectionEmail: initialData?.sectionEmail ?? "",
      employeeCode: initialData?.employeeCode ?? "",
      employeeName: initialData?.employeeName ?? "",
      email: initialData?.email ?? "",
      picRole: initialData?.picRole ?? "PIC",
      isActive: initialData?.isActive ?? true
    });
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? "Update Section PIC" : "Create Section PIC"}</DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="number" label="Section ID" value={form.sectionId} onChange={(event) => setForm((current) => ({ ...current, sectionId: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Section Name" value={form.sectionName} onChange={(event) => setForm((current) => ({ ...current, sectionName: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Section Email" value={form.sectionEmail} onChange={(event) => setForm((current) => ({ ...current, sectionEmail: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Employee Code" value={form.employeeCode} onChange={(event) => setForm((current) => ({ ...current, employeeCode: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Employee Name" value={form.employeeName} onChange={(event) => setForm((current) => ({ ...current, employeeName: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Employee Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="PIC Role" value={form.picRole} onChange={(event) => setForm((current) => ({ ...current, picRole: event.target.value }))}>
              {SECTION_PIC_ROLES.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="Active" value={String(form.isActive)} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "true" }))}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
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
              sectionId: Number(form.sectionId),
              sectionName: form.sectionName.trim() || null,
              sectionEmail: form.sectionEmail.trim() || null,
              employeeCode: form.employeeCode.trim() || null,
              employeeName: form.employeeName.trim(),
              email: form.email.trim() || null,
              picRole: form.picRole,
              isActive: form.isActive
            })
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("externals");
  const [externalDialog, setExternalDialog] = useState({ open: false, data: null });
  const [locationDialog, setLocationDialog] = useState({ open: false, data: null });
  const [sectionPicDialog, setSectionPicDialog] = useState({ open: false, data: null });
  const [deleteState, setDeleteState] = useState(null);
  const [sectionFilter, setSectionFilter] = useState("");
  const [sectionActiveFilter, setSectionActiveFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState("Preparer");
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignUser, setAssignUser] = useState(null);
  const [assignRole, setAssignRole] = useState("Preparer");
  const [daysThreshold, setDaysThreshold] = useState(7);
  const [reminderResult, setReminderResult] = useState(null);

  const userOptionsQuery = useUserOptions({ Top: 50 });
  const externalsQuery = useExternals();
  const defaultLocationsQuery = useDefaultLocations();
  const sectionPicsQuery = useSectionPics({
    sectionId: sectionFilter ? Number(sectionFilter) : undefined,
    isActive: sectionActiveFilter === "" ? undefined : sectionActiveFilter === "true"
  });
  const roleUsersQuery = useCalibRoleUsers(selectedRole, { enabled: Boolean(selectedRole) });
  const userRolesQuery = useCalibRolesByUser(selectedUser?.userId, { enabled: Boolean(selectedUser?.userId) });

  const createExternalMutation = useCreateExternal();
  const updateExternalMutation = useUpdateExternal(externalDialog.data?.externalId);
  const deleteExternalMutation = useDeleteExternal();

  const createLocationMutation = useCreateDefaultLocation();
  const updateLocationMutation = useUpdateDefaultLocation(locationDialog.data?.defaultLocationId);
  const deleteLocationMutation = useDeleteDefaultLocation();

  const createSectionPicMutation = useCreateSectionPic();
  const updateSectionPicMutation = useUpdateSectionPic(sectionPicDialog.data?.sectionPicId);
  const deleteSectionPicMutation = useDeleteSectionPic();

  const assignRoleMutation = useAssignCalibRole();
  const revokeRoleMutation = useRevokeCalibRole();
  const sendRemindersMutation = useSendDueDateReminders();

  const externalRows = externalsQuery.data ?? [];
  const defaultLocationRows = defaultLocationsQuery.data ?? [];
  const sectionPicRows = sectionPicsQuery.data ?? [];

  const cards = useMemo(
    () => [
      { title: "External Vendors", value: externalRows.length, icon: <PrecisionManufacturingOutlinedIcon /> },
      { title: "Default Locations", value: defaultLocationRows.length, icon: <PlaceOutlinedIcon /> },
      { title: "Section PICs", value: sectionPicRows.length, icon: <PeopleAltOutlinedIcon /> },
      { title: "Assigned Roles", value: roleUsersQuery.data?.length ?? 0, icon: <VerifiedUserOutlinedIcon /> }
    ],
    [defaultLocationRows.length, externalRows.length, roleUsersQuery.data?.length, sectionPicRows.length]
  );

  return (
    <PageFrame
      section="Calibration Administration"
      title="Master Data and Controls"
      description="Maintain the operational data the backend exposes today: vendors, default locations, section PICs, role assignment/lookup, and manual due-date reminder dispatch."
    >
      <Grid2 container spacing={2.5}>
        {cards.map((card) => (
          <Grid2 key={card.title} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard icon={card.icon} title={card.title} value={card.value} caption="backend-backed records" />
          </Grid2>
        ))}
      </Grid2>

      <SectionCard title="Administration Modules" description="Everything in this page maps directly to an existing backend controller.">
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab value="externals" label="External Vendors" />
          <Tab value="locations" label="Default Locations" />
          <Tab value="section-pics" label="Section PICs" />
          <Tab value="roles" label="Role Assignments" />
          <Tab value="reminders" label="Reminders" />
        </Tabs>

        {activeTab === "externals" ? (
          <Stack spacing={2}>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => setExternalDialog({ open: true, data: null })}>
              Add Vendor
            </Button>
            {externalsQuery.isError ? <Alert severity="error">{externalsQuery.error.message}</Alert> : null}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {externalRows.length ? (
                    externalRows.map((row) => (
                      <TableRow key={row.externalId}>
                        <TableCell>{row.externalCompany}</TableCell>
                        <TableCell>{row.externalEmail || "-"}</TableCell>
                        <TableCell>{row.externalPhone || "-"}</TableCell>
                        <TableCell>{row.address || "-"}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                            <Button size="small" onClick={() => setExternalDialog({ open: true, data: row })}>
                              Edit
                            </Button>
                            <Button size="small" color="error" onClick={() => setDeleteState({ type: "external", row })}>
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState title="No external vendors yet" description="Add the first vendor used by external calibration plans and actuals." />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}

        {activeTab === "locations" ? (
          <Stack spacing={2}>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => setLocationDialog({ open: true, data: null })}>
              Add Default Location
            </Button>
            {defaultLocationsQuery.isError ? <Alert severity="error">{defaultLocationsQuery.error.message}</Alert> : null}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Location Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {defaultLocationRows.length ? (
                    defaultLocationRows.map((row) => (
                      <TableRow key={row.defaultLocationId}>
                        <TableCell>{row.defaultLocationName}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                            <Button size="small" onClick={() => setLocationDialog({ open: true, data: row })}>
                              Edit
                            </Button>
                            <Button size="small" color="error" onClick={() => setDeleteState({ type: "location", row })}>
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <EmptyState title="No default locations yet" description="Create reusable location names the calibration team can reference." />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}

        {activeTab === "section-pics" ? (
          <Stack spacing={2}>
            <Grid2 container spacing={1.5}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <TextField label="Section ID" value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <BooleanFilterField label="Active Filter" value={sectionActiveFilter} onChange={setSectionActiveFilter} trueLabel="Active" falseLabel="Inactive" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSectionPicDialog({ open: true, data: null })}>
                  Add Section PIC
                </Button>
              </Grid2>
            </Grid2>
            {sectionPicsQuery.isError ? <Alert severity="error">{sectionPicsQuery.error.message}</Alert> : null}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Section</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectionPicRows.length ? (
                    sectionPicRows.map((row) => (
                      <TableRow key={row.sectionPicId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {row.sectionName || `Section ${row.sectionId}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID {row.sectionId} · {row.sectionEmail || "No section email"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.employeeName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.employeeCode || "No code"}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.email || "-"}</TableCell>
                        <TableCell>{row.picRole}</TableCell>
                        <TableCell>{row.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                            <Button size="small" onClick={() => setSectionPicDialog({ open: true, data: row })}>
                              Edit
                            </Button>
                            <Button size="small" color="error" onClick={() => setDeleteState({ type: "section-pic", row })}>
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState title="No section PIC data" description="Create section-PIC assignments directly against the backend section-pics controller." />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}

        {activeTab === "roles" ? (
          <Stack spacing={2.5}>
            <SectionCard
              title="Assign Calibration Role"
              description="Assign one of the backend-supported calibration roles to a user account."
              sx={{ p: 2.5 }}
            >
              <Grid2 container spacing={1.5}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <UserLookupField
                    label="User"
                    value={assignUser}
                    onChange={setAssignUser}
                    options={userOptionsQuery.data ?? []}
                    loading={userOptionsQuery.isLoading}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField select fullWidth label="Role" value={assignRole} onChange={(event) => setAssignRole(event.target.value)}>
                    {CALIBRATION_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!assignUser?.userId || assignRoleMutation.isPending}
                    onClick={async () => {
                      await assignRoleMutation.mutateAsync({ userId: assignUser.userId, role: assignRole });
                    }}
                  >
                    {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                  </Button>
                </Grid2>
              </Grid2>
            </SectionCard>

            <Grid2 container spacing={2.5}>
              <Grid2 size={{ xs: 12, lg: 6 }}>
                <SectionCard title="Lookup by Role" description="See which users currently hold a specific calibration role." sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <TextField select label="Role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                      {CALIBRATION_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(roleUsersQuery.data || []).length ? (
                            (roleUsersQuery.data || []).map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>{row.username}</TableCell>
                                <TableCell>{row.employeeName || "-"}</TableCell>
                                <TableCell align="right">
                                  <Button
                                    size="small"
                                    color="error"
                                    disabled={revokeRoleMutation.isPending}
                                    onClick={() => revokeRoleMutation.mutateAsync({ userId: row.userId, role: row.role })}
                                  >
                                    Revoke
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                No users currently hold this role.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </SectionCard>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 6 }}>
                <SectionCard title="Lookup by User" description="Inspect all calibration roles currently assigned to a specific user." sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <UserLookupField
                      label="User"
                      value={selectedUser}
                      onChange={setSelectedUser}
                      options={userOptionsQuery.data ?? []}
                      loading={userOptionsQuery.isLoading}
                    />
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(userRolesQuery.data || []).length ? (
                            (userRolesQuery.data || []).map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>{row.role}</TableCell>
                                <TableCell align="right">
                                  <Button
                                    size="small"
                                    color="error"
                                    disabled={revokeRoleMutation.isPending}
                                    onClick={() => revokeRoleMutation.mutateAsync({ userId: row.userId, role: row.role })}
                                  >
                                    Revoke
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                                No calibration roles assigned to this user.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </SectionCard>
              </Grid2>
            </Grid2>
          </Stack>
        ) : null}

        {activeTab === "reminders" ? (
          <Stack spacing={2.5}>
            <Alert severity="warning">
              The anonymous cron-dispatch endpoint is treated as background automation only and is intentionally not exposed here. This UI only triggers the authenticated admin endpoint.
            </Alert>
            <SectionCard
              title="Manual Due-Date Reminders"
              description="Dispatch reminder emails using `/api/calibration-reminders/send-due-date-reminders` and review the returned sent count."
              sx={{ p: 2.5 }}
            >
              <Grid2 container spacing={1.5} alignItems="center">
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Days Threshold"
                    value={daysThreshold}
                    onChange={(event) => setDaysThreshold(Number(event.target.value))}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<NotificationsActiveOutlinedIcon />}
                    disabled={sendRemindersMutation.isPending}
                    onClick={async () => {
                      const response = await sendRemindersMutation.mutateAsync(daysThreshold);
                      setReminderResult(response?.data ?? null);
                    }}
                  >
                    {sendRemindersMutation.isPending ? "Dispatching..." : "Send Reminders"}
                  </Button>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  {reminderResult ? (
                    <Alert severity="success">Reminder dispatch completed. Sent count: {reminderResult.sentCount}</Alert>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Use this when operations wants to push the next reminder batch immediately.
                    </Typography>
                  )}
                </Grid2>
              </Grid2>
            </SectionCard>
          </Stack>
        ) : null}
      </SectionCard>

      <ExternalDialog
        open={externalDialog.open}
        initialData={externalDialog.data}
        isPending={createExternalMutation.isPending || updateExternalMutation.isPending}
        onClose={() => setExternalDialog({ open: false, data: null })}
        onSubmit={async (payload) => {
          if (externalDialog.data?.externalId) {
            await updateExternalMutation.mutateAsync(payload);
          } else {
            await createExternalMutation.mutateAsync(payload);
          }

          setExternalDialog({ open: false, data: null });
        }}
      />

      <DefaultLocationDialog
        open={locationDialog.open}
        initialData={locationDialog.data}
        isPending={createLocationMutation.isPending || updateLocationMutation.isPending}
        onClose={() => setLocationDialog({ open: false, data: null })}
        onSubmit={async (payload) => {
          if (locationDialog.data?.defaultLocationId) {
            await updateLocationMutation.mutateAsync(payload);
          } else {
            await createLocationMutation.mutateAsync(payload);
          }

          setLocationDialog({ open: false, data: null });
        }}
      />

      <SectionPicDialog
        open={sectionPicDialog.open}
        initialData={sectionPicDialog.data}
        isPending={createSectionPicMutation.isPending || updateSectionPicMutation.isPending}
        onClose={() => setSectionPicDialog({ open: false, data: null })}
        onSubmit={async (payload) => {
          if (sectionPicDialog.data?.sectionPicId) {
            await updateSectionPicMutation.mutateAsync(payload);
          } else {
            await createSectionPicMutation.mutateAsync(payload);
          }

          setSectionPicDialog({ open: false, data: null });
        }}
      />

      <ConfirmationDialog
        open={Boolean(deleteState)}
        title="Delete Record"
        description={
          deleteState?.type === "external"
            ? `Delete vendor ${deleteState?.row?.externalCompany}?`
            : deleteState?.type === "location"
              ? `Delete default location ${deleteState?.row?.defaultLocationName}?`
              : `Delete section PIC ${deleteState?.row?.employeeName}?`
        }
        confirmColor="error"
        confirmLabel="Delete"
        isPending={deleteExternalMutation.isPending || deleteLocationMutation.isPending || deleteSectionPicMutation.isPending}
        onClose={() => setDeleteState(null)}
        onConfirm={async () => {
          if (deleteState?.type === "external") {
            await deleteExternalMutation.mutateAsync(deleteState.row.externalId);
          } else if (deleteState?.type === "location") {
            await deleteLocationMutation.mutateAsync(deleteState.row.defaultLocationId);
          } else if (deleteState?.type === "section-pic") {
            await deleteSectionPicMutation.mutateAsync(deleteState.row.sectionPicId);
          }

          setDeleteState(null);
        }}
      />
    </PageFrame>
  );
}
