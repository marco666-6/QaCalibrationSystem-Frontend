import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { useCreateUser, useDeleteUser, useResetUserPassword, useUpdateUser, useUser, useUsers } from "app/hooks/useCalibration";
import { USER_ROLES } from "app/utils/constant";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { formatDateTime } from "../shared/workspaceFormatters";

function UserFormDialog({ open, mode, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    employeeCode: "",
    username: "",
    email: "",
    password: "",
    role: "Employee",
    isActive: true,
    mustChangePassword: true
  });

  useEffect(() => {
    setForm({
      employeeCode: initialData?.employeeCode ?? "",
      username: initialData?.username ?? "",
      email: initialData?.email ?? "",
      password: "",
      role: initialData?.role ?? "Employee",
      isActive: initialData?.isActive ?? true,
      mustChangePassword: initialData?.mustChangePassword ?? true
    });
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Create User" : "Update User"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Employee Code"
            value={form.employeeCode}
            onChange={(event) => setForm((current) => ({ ...current, employeeCode: event.target.value }))}
            helperText="Optional numeric employee code up to 6 characters."
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          {mode === "create" ? (
            <TextField
              label="Initial Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              helperText="Backend requires at least 8 characters, upper/lowercase, and a number."
              required
            />
          ) : null}
          <TextField
            select
            label="Role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            {USER_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          {mode === "edit" ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
              }
              label="Active account"
            />
          ) : null}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.mustChangePassword}
                onChange={(event) => setForm((current) => ({ ...current, mustChangePassword: event.target.checked }))}
              />
            }
            label="Force password change on next sign-in"
          />
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
              employeeId: null,
              employeeCode: form.employeeCode.trim() || null,
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
              role: form.role,
              isActive: form.isActive,
              mustChangePassword: form.mustChangePassword
            })
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetPasswordDialog({ open, user, isPending, onClose, onSubmit }) {
  const [password, setPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(true);

  useEffect(() => {
    setPassword("");
    setMustChangePassword(true);
  }, [open, user]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Reset password for <strong>{user?.username}</strong>.
          </Typography>
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            helperText="Backend requires at least 8 characters, upper/lowercase, and a number."
          />
          <FormControlLabel
            control={<Checkbox checked={mustChangePassword} onChange={(event) => setMustChangePassword(event.target.checked)} />}
            label="Force password change after reset"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" color="warning" disabled={isPending} onClick={() => onSubmit({ newPassword: password, mustChangePassword })}>
          {isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteUserDialog({ open, user, isPending, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          <strong>{user?.username}</strong> will be permanently removed from the calibration system.
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

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dialogState, setDialogState] = useState({ open: false, mode: "create", data: null });
  const [editId, setEditId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const usersQuery = useUsers({
    Page: 1,
    PageSize: 100,
    Name: search || undefined
  });
  const selectedUserQuery = useUser(editId, { enabled: Boolean(editId) });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser(editId);
  const resetPasswordMutation = useResetUserPassword(resetTarget?.userId);
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    if (selectedUserQuery.data && editId) {
      setDialogState({ open: true, mode: "edit", data: selectedUserQuery.data });
    }
  }, [selectedUserQuery.data, editId]);

  const allUsers = usersQuery.data?.items ?? [];
  const filteredUsers = roleFilter ? allUsers.filter((entry) => entry.role === roleFilter) : allUsers;

  const activeUsers = filteredUsers.filter((entry) => entry.isActive).length;
  const adminUsers = filteredUsers.filter((entry) => entry.role === "Admin" || entry.role === "SuperAdmin").length;

  return (
    <PageFrame
      section="Calibration Administration"
      title="User Management"
      description="Manage authenticated calibration users, account state, reset operations, and force-change-password flags against the real `/api/users` contract."
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogState({ open: true, mode: "create", data: null })}
        >
          Add User
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Visible Users" value={filteredUsers.length} caption="current filter result" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<EditOutlinedIcon />} title="Active Users" value={activeUsers} caption="accounts enabled for sign-in" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<LockResetOutlinedIcon />} title="Admin Accounts" value={adminUsers} caption="elevated access users" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="System Accounts"
        description="The backend handles role validation, account activation, and password reset rules. This table stays intentionally dense for quick industrial operations."
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            label="Search"
            placeholder="Username or email"
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
          <TextField
            size="small"
            select
            label="Role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All roles</MenuItem>
            {USER_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {usersQuery.isError ? <Alert severity="error">{usersQuery.error.message}</Alert> : null}

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Employee Code</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={800}>
                          {user.username}
                        </Typography>
                        {user.mustChangePassword ? (
                          <Typography variant="caption" color="warning.main">
                            Force password change enabled
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.employeeCode || "-"}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.isActive ? "Active" : "Inactive"}
                        color={user.isActive ? "success" : "default"}
                        variant={user.isActive ? "filled" : "outlined"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditId(user.userId)}>
                          Edit
                        </Button>
                        <Button size="small" color="warning" startIcon={<LockResetOutlinedIcon />} onClick={() => setResetTarget(user)}>
                          Reset
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(user)}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    No users match the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Create and update operations follow the backend validators exactly, including password policy, role list, and employee-code formatting.
          </Typography>
        </Box>
      </SectionCard>

      <UserFormDialog
        open={dialogState.open}
        mode={dialogState.mode}
        initialData={dialogState.data}
        isPending={createUserMutation.isPending || updateUserMutation.isPending}
        onClose={() => {
          setDialogState({ open: false, mode: "create", data: null });
          setEditId(null);
        }}
        onSubmit={async (payload) => {
          if (dialogState.mode === "create") {
            await createUserMutation.mutateAsync(payload);
          } else {
            await updateUserMutation.mutateAsync(payload);
          }

          setDialogState({ open: false, mode: "create", data: null });
          setEditId(null);
        }}
      />

      <ResetPasswordDialog
        open={Boolean(resetTarget)}
        user={resetTarget}
        isPending={resetPasswordMutation.isPending}
        onClose={() => setResetTarget(null)}
        onSubmit={async (payload) => {
          await resetPasswordMutation.mutateAsync(payload);
          setResetTarget(null);
        }}
      />

      <DeleteUserDialog
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        isPending={deleteUserMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteUserMutation.mutateAsync(deleteTarget.userId);
          setDeleteTarget(null);
        }}
      />
    </PageFrame>
  );
}
