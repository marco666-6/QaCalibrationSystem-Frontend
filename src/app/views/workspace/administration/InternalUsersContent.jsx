import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Link,
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
import Grid2 from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import useAuth from "app/hooks/useAuth";
import {
  useCreateInternalUser,
  useDeleteInternalUser,
  useInternalUsers,
  useResetInternalUserPassword,
  useUpdateInternalUser
} from "app/hooks/useBusinessModules";
import { formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

const ROLE_OPTIONS = ["admin", "cashier", "manager"];

function UserDialog({ open, mode, initialData, isPending, onClose, onSubmit }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    isActive: true,
    roles: ["cashier"]
  });

  useEffect(() => {
    setForm({
      username: initialData?.username ?? "",
      email: initialData?.email ?? "",
      displayName: initialData?.displayName ?? "",
      password: "",
      isActive: initialData?.isActive ?? true,
      roles: initialData?.roles?.length ? initialData.roles : ["cashier"]
    });
  }, [initialData, open]);

  const toggleRole = (role) => {
    setForm((current) => {
      const exists = current.roles.includes(role);
      const nextRoles = exists ? current.roles.filter((item) => item !== role) : [...current.roles, role];
      return { ...current, roles: nextRoles.length ? nextRoles : current.roles };
    });
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "edit" ? "Edit Pengguna Internal" : "Tambah Pengguna Internal"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField label="Username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
          <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <TextField label="Nama Tampil" value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} />
          {mode === "create" ? (
            <TextField
              label="Password Awal"
              type="password"
              value={form.password}
              helperText="Minimal 8 karakter."
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          ) : null}

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Peran Internal
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {ROLE_OPTIONS.map((role) => (
                <FormControlLabel
                  key={role}
                  control={<Checkbox checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />}
                  label={role}
                />
              ))}
            </Stack>
          </Paper>

          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(form.isActive)}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
            }
            label="Akun aktif"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={() => onSubmit(form)}
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetPasswordDialog({ open, user, isPending, onClose, onSubmit }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    setPassword("");
  }, [open, user]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Password baru untuk <strong>{user?.displayName || user?.username}</strong>.
          </Typography>
          <TextField
            label="Password Baru"
            type="password"
            value={password}
            helperText="Minimal 8 karakter."
            onChange={(event) => setPassword(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button variant="contained" color="warning" disabled={isPending} onClick={() => onSubmit(password)}>
          {isPending ? "Mereset..." : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteUserDialog({ open, user, isPending, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Hapus Pengguna</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Pengguna <strong>{user?.displayName || user?.username}</strong> akan dihapus dari tenant ini.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button variant="contained" color="error" disabled={isPending} onClick={onConfirm}>
          {isPending ? "Menghapus..." : "Hapus"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InternalUsersContent() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filters = {
    Page: 1,
    PageSize: 50,
    Search: search || undefined,
    UserType: "internal",
    IsActive: status === "" ? undefined : status === "active"
  };

  const { data, isLoading, isError, error } = useInternalUsers(filters);
  const createUser = useCreateInternalUser();
  const updateUser = useUpdateInternalUser(dialog.data?.userId);
  const resetPassword = useResetInternalUserPassword(resetTarget?.userId);
  const deleteUser = useDeleteInternalUser();

  const items = data?.items ?? [];
  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);
  const adminCount = useMemo(() => items.filter((item) => (item.roles || []).includes("admin")).length, [items]);

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    );
  }

  return (
    <PageFrame
      section="Administrasi"
      title="Pengguna Internal"
      description="Administrasi akun internal untuk admin, kasir, dan manager. Area ini mengikuti penuh kontrak endpoint `/users`."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<ManageAccountsOutlinedIcon />} title="Akun Internal" value={items.length} caption="hasil filter aktif" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<SupervisorAccountOutlinedIcon />} title="Akun Aktif" value={activeCount} caption="siap digunakan operasional" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<ShieldOutlinedIcon />} title="Admin" value={adminCount} caption="pemegang kontrol penuh" />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Akun Internal"
        description="Tambah, edit, reset password, dan hapus pengguna internal tanpa keluar dari modul administrasi."
        actions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Link component={RouterLink} to="/account/profile" underline="hover" sx={{ fontWeight: 700, alignSelf: "center" }}>
              Buka profil saya
            </Link>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: "create", data: null })}>
              Tambah Pengguna
            </Button>
          </Stack>
        }
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Cari username, email, atau nama"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField size="small" select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Nonaktif</MenuItem>
          </TextField>
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pengguna</TableCell>
                <TableCell>Kontak</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Login Terakhir</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Memuat akun internal...
                  </TableCell>
                </TableRow>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.userId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {item.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.username} • {item.userType}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{(item.roles || []).join(", ")}</TableCell>
                    <TableCell>
                      <Alert severity={item.isActive ? "success" : "warning"} icon={false} sx={{ py: 0, px: 1.5, borderRadius: 2 }}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </Alert>
                    </TableCell>
                    <TableCell>{formatDateTime(item.lastLoginAt)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ open: true, mode: "edit", data: item })}>
                          Edit
                        </Button>
                        <Button size="small" color="warning" startIcon={<LockResetOutlinedIcon />} onClick={() => setResetTarget(item)}>
                          Reset
                        </Button>
                        {item.userId !== user?.id ? (
                          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(item)}>
                            Hapus
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Tidak ada akun internal yang cocok dengan filter.
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
        onClose={() => setDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          if (dialog.mode === "create") {
            await createUser.mutateAsync({
              tenantId: user?.tenantId,
              username: payload.username.trim(),
              email: payload.email.trim(),
              displayName: payload.displayName.trim(),
              password: payload.password,
              userType: "internal",
              isActive: Boolean(payload.isActive),
              roles: payload.roles
            });
          } else {
            await updateUser.mutateAsync({
              username: payload.username.trim(),
              email: payload.email.trim(),
              displayName: payload.displayName.trim(),
              isActive: Boolean(payload.isActive),
              roles: payload.roles
            });
          }

          setDialog({ open: false, mode: "create", data: null });
        }}
      />

      <ResetPasswordDialog
        open={Boolean(resetTarget)}
        user={resetTarget}
        isPending={resetPassword.isPending}
        onClose={() => setResetTarget(null)}
        onSubmit={async (password) => {
          await resetPassword.mutateAsync({ newPassword: password });
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
