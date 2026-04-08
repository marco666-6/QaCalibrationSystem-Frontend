import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useCreateMember, useMembers, useUpdateMember } from "app/hooks/useKoperasi";
import KspPageShell from "./shared/KspPageShell";
import KspSimpleDialog from "./shared/KspSimpleDialog";
import { MEMBER_STATUS_OPTIONS } from "./shared/kspConstants";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function MemberMasterContent() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const { data, isLoading, isError, error } = useMembers({
    Page: page + 1,
    PageSize: rowsPerPage,
    Search: search || undefined,
    MemberStatus: status || undefined
  });
  const createMember = useCreateMember();
  const updateMember = useUpdateMember(dialog.data?.memberId);

  const items = data?.items ?? [];
  const columns = [
    columnHelper.accessor("fullName", {
      id: "member",
      header: "Anggota",
      cell: ({ row }) => (
        <>
          <Typography variant="body2" fontWeight={700}>{row.original.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{row.original.memberNo}</Typography>
        </>
      )
    }),
    columnHelper.accessor("email", {
      id: "contact",
      header: "Kontak",
      cell: ({ row }) => (
        <>
          <Typography variant="body2">{row.original.email || "-"}</Typography>
          <Typography variant="caption" color="text.secondary">{row.original.phoneNumber || "-"}</Typography>
        </>
      )
    }),
    columnHelper.accessor("joinDate", {
      header: "Join Date",
      cell: (info) => info.getValue() || "-"
    }),
    columnHelper.accessor("memberStatus", {
      header: "Status",
      cell: (info) => (
        <Chip label={info.getValue()} size="small" color={info.getValue() === "active" ? "success" : "default"} />
      )
    }),
    columnHelper.display({
      id: "actions",
      header: () => <Box sx={{ textAlign: "right" }}>Aksi</Box>,
      cell: ({ row }) => (
        <Box sx={{ textAlign: "right" }}>
          <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ open: true, mode: "edit", data: row.original })}>
            Edit
          </Button>
        </Box>
      )
    })
  ];
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data?.totalCount ?? 0
  });

  if (isError) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>;

  return (
    <KspPageShell
      eyebrow="Master Data"
      title="Anggota"
      description="Pusat data anggota koperasi untuk relasi simpanan, pinjaman, dan portal member."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: "create", data: null })}>
          Tambah Anggota
        </Button>
      }
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField
            size="small"
            placeholder="Cari anggota"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Semua</MenuItem>
            {MEMBER_STATUS_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Stack>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} sx={tableCellSx}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 6 }}>Memuat data anggota...</TableCell></TableRow>
              ) : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} sx={tableCellSx}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {!isLoading && items.length === 0 ? <TableRow><TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 6 }}>Tidak ada data anggota.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data?.totalCount ?? 0}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </TableContainer>
      </Paper>

      <KspSimpleDialog
        title="Anggota"
        open={dialog.open}
        mode={dialog.mode}
        initialData={dialog.data || { joinDate: new Date().toISOString().slice(0, 10), memberStatus: "active" }}
        isPending={createMember.isPending || updateMember.isPending}
        onClose={() => setDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = {
            memberNo: payload.memberNo?.trim(),
            employeeCode: payload.employeeCode?.trim() || null,
            fullName: payload.fullName?.trim(),
            identityNo: payload.identityNo?.trim() || null,
            phoneNumber: payload.phoneNumber?.trim() || null,
            email: payload.email?.trim() || null,
            addressLine: payload.addressLine?.trim() || null,
            joinDate: payload.joinDate,
            memberStatus: payload.memberStatus,
            notes: payload.notes?.trim() || null
          };

          if (dialog.mode === "edit") await updateMember.mutateAsync(request);
          else await createMember.mutateAsync(request);

          setDialog({ open: false, mode: "create", data: null });
        }}
        fields={[
          { name: "memberNo", label: "No. Anggota", disabledOnEdit: true },
          { name: "employeeCode", label: "Employee Code" },
          { name: "fullName", label: "Nama Lengkap" },
          { name: "identityNo", label: "NIK" },
          { name: "phoneNumber", label: "Telepon" },
          { name: "email", label: "Email" },
          { name: "joinDate", label: "Tanggal Bergabung", type: "date" },
          { name: "memberStatus", label: "Status", type: "select", options: MEMBER_STATUS_OPTIONS },
          { name: "addressLine", label: "Alamat", multiline: true, size: 12 },
          { name: "notes", label: "Catatan", multiline: true, size: 12 }
        ]}
      />
    </KspPageShell>
  );
}
