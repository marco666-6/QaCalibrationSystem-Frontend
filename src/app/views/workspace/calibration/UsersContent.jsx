import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Grid2 from "@mui/material/Grid2";
import {
  Alert,
  Button,
  Checkbox,
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
import {
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUser,
  useUsers
} from "app/hooks/useCalibration";
import { formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

const ROLE_OPTIONS = ["SuperAdmin", "Admin", "Manager", "Employee"];

function UserDialog({ open, mode, initialData, isPending, onClose, onSubmit }) {
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
      <DialogTitle>{mode === "edit" ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25} sx={{ mt: 0.5 }}>
          <TextField
            fullWidth
            label="Employee Code"
            value={form.employeeCode}
            onChange={(event) => setForm((current) => ({ ...current, employeeCode: event.target.value }))}
          />
          <TextField
            fullWidth
            label="Username"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {mode === "create" ? (
            <TextField
              fullWidth
              type="password"
              label="Initial Password"
              value={form.password}
              helperText="Minimum 8 characters with uppercase, lowercase, and a number."
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          ) : null}
          <TextField
            fullWidth
            select
            label="Role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            {ROLE_OPTIONS.map((role) => (
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
            label="Require password change on next sign-in"
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
            Reset the password for <strong>{user?.username}</strong>.
          </Typography>
          <TextField
            label="New Password"
            type="password"
            value={password}
            helperText="Minimum 8 characters with uppercase, lowercase, and a number."
            onChange={(event) => setPassword(event.target.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={mustChangePassword} onChange={(event) => setMustChangePassword(event.target.checked)} />}
            label="Require password change after reset"
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
          User <strong>{user?.username}</strong> will be removed from the calibration system.
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

export default function UsersContent() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const [editId, setEditId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, error } = useUsers({
    Page: 1,
    PageSize: 100,
    Name: search || undefined
  });
  const { data: selectedUser } = useUser(editId, { enabled: Boolean(editId) });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(editId);
  const resetPassword = useResetUserPassword(resetTarget?.userId);
  const deleteUser = useDeleteUser();

  useEffect(() => {
    if (selectedUser && editId) {
      setDialog({ open: true, mode: "edit", data: selectedUser });
    }
  }, [editId, selectedUser]);

  if (isError) {
    return (
      <PageFrame section="Calibration" title="Users" description="The user management module could not load.">
        <Alert severity="error">{error.message}</Alert>
      </PageFrame>
    );
  }

  const items = data?.items ?? [];

  return (
    <PageFrame
      section="Calibration"
      title="User Administration"
      description="Manage user accounts against the `/users` backend contract."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Users" value={data?.totalCount ?? 0} caption="managed accounts" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<EditOutlinedIcon />} title="Active" value={items.filter((item) => item.isActive).length} caption="available for sign-in" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<LockResetOutlinedIcon />} title="Admins" value={items.filter((item) => item.role === "Admin" || item.role === "SuperAdmin").length} caption="elevated access accounts" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="System Users"
        description="Create, edit, reset, and delete calibration user accounts."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: "create", data: null })}>
            Add User
          </Button>
        }
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search by name, username, or email"
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

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.userId} hover>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{formatDateTime(item.lastLogin)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditId(item.userId)}>
                          Edit
                        </Button>
                        <Button size="small" color="warning" startIcon={<LockResetOutlinedIcon />} onClick={() => setResetTarget(item)}>
                          Reset
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(item)}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No users match the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <UserDialog
        open={dialog.open}
        mode={dialog.mode}
        initialData={dialog.data}
        isPending={createUser.isPending || updateUser.isPending}
        onClose={() => {
          setDialog({ open: false, mode: "create", data: null });
          setEditId(null);
        }}
        onSubmit={async (payload) => {
          if (dialog.mode === "create") {
            await createUser.mutateAsync({
              employeeCode: payload.employeeCode,
              employeeId: null,
              username: payload.username,
              email: payload.email,
              password: payload.password,
              role: payload.role,
              mustChangePassword: payload.mustChangePassword
            });
          } else {
            await updateUser.mutateAsync({
              employeeCode: payload.employeeCode,
              employeeId: null,
              username: payload.username,
              email: payload.email,
              role: payload.role,
              isActive: payload.isActive,
              mustChangePassword: payload.mustChangePassword
            });
          }

          setDialog({ open: false, mode: "create", data: null });
          setEditId(null);
        }}
      />

      <ResetPasswordDialog
        open={Boolean(resetTarget)}
        user={resetTarget}
        isPending={resetPassword.isPending}
        onClose={() => setResetTarget(null)}
        onSubmit={async (payload) => {
          await resetPassword.mutateAsync(payload);
          setResetTarget(null);
        }}
      />

      <DeleteUserDialog
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        isPending={deleteUser.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteUser.mutateAsync(deleteTarget.userId);
          setDeleteTarget(null);
        }}
      />
    </PageFrame>
  );
}
