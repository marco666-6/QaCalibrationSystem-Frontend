import { useEffect, useMemo, useState } from "react";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import Grid2 from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import useAuth from "app/hooks/useAuth";
import {
  useCreateLoan,
  useCreateLoanPayment,
  useDeleteLoan,
  useDeleteLoanPayment,
  useLoanPayments,
  useLoans
} from "app/hooks/useBusinessModules";
import { useLoanProducts, useMembers } from "app/hooks/useKoperasi";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  toDateInputValue,
  toDateTimeInputValue,
  toNullableNumberValue,
  toNumberValue
} from "../shared/workspaceFormatters";
import { MetricCard, SectionCard } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";
import KspPageShell from "./shared/KspPageShell";

const LOAN_STATUS_OPTIONS = [
  { value: "", label: "Semua status" },
  { value: "active", label: "Aktif" },
  { value: "paid_off", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" }
];

function buildLoanNumber() {
  return `LOAN-${Date.now()}`;
}

function buildPaymentNumber() {
  return `PMT-${Date.now()}`;
}

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function LoansManagementContent() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") || user?.role === "admin";
  const [loanPage, setLoanPage] = useState(0);
  const [loanRowsPerPage, setLoanRowsPerPage] = useState(10);
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(10);
  const [searchMemberId, setSearchMemberId] = useState("");
  const [status, setStatus] = useState("");
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelPaymentTarget, setCancelPaymentTarget] = useState(null);

  const filters = {
    Page: loanPage + 1,
    PageSize: loanRowsPerPage,
    MemberId: searchMemberId || undefined,
    Status: status || undefined
  };

  const paymentFilters = {
    Page: paymentPage + 1,
    PageSize: paymentRowsPerPage,
    LoanId: selectedLoan?.loanId || undefined,
    MemberId: searchMemberId || undefined
  };
  const { data: loans, isLoading: loansLoading, isError: loansError, error: loansQueryError } = useLoans(filters);
  const {
    data: payments,
    isLoading: paymentsLoading,
    isError: paymentsError,
    error: paymentsQueryError
  } = useLoanPayments(paymentFilters, { enabled: true });
  const { data: members } = useMembers({ Page: 1, PageSize: 100 });
  const { data: loanProducts } = useLoanProducts({ Page: 1, PageSize: 100, IsActive: true });
  const createLoan = useCreateLoan();
  const createPayment = useCreateLoanPayment(selectedLoan?.loanId);
  const deleteLoan = useDeleteLoan();
  const deleteLoanPayment = useDeleteLoanPayment();

  const loanItems = loans?.items ?? [];
  const paymentItems = payments?.items ?? [];
  const latestVisiblePaymentId = paymentItems[0]?.loanPaymentId ?? null;
  const memberOptions = useMemo(() => members?.items ?? [], [members?.items]);
  const loanProductOptions = useMemo(() => loanProducts?.items ?? [], [loanProducts?.items]);
  const totalOutstanding = loanItems.reduce((sum, item) => sum + Number(item.outstandingTotalAmount || 0), 0);
  const installmentItems = selectedLoan?.installments ?? [];

  useEffect(() => {
    if (!selectedLoan) return;

    const refreshedSelectedLoan = loanItems.find((item) => item.loanId === selectedLoan.loanId);
    if (refreshedSelectedLoan) {
      setSelectedLoan(refreshedSelectedLoan);
      return;
    }

    setSelectedLoan(null);
  }, [loanItems, selectedLoan]);

  const loanDialogFields = useMemo(
    () => [
      {
        name: "memberId",
        label: "Anggota",
        type: "select",
        options: memberOptions.map((item) => ({ value: item.memberId, label: `${item.memberNo} - ${item.fullName}` }))
      },
      {
        name: "loanProductId",
        label: "Produk Pinjaman",
        type: "select",
        options: loanProductOptions.map((item) => ({ value: item.loanProductId, label: `${item.productCode} - ${item.productName}` }))
      },
      { name: "loanNo", label: "No. Pinjaman" },
      { name: "loanDate", label: "Tanggal Akad", type: "date" },
      { name: "principalAmount", label: "Pokok Pinjaman", type: "number" },
      { name: "flatInterestRatePct", label: "Bunga Flat (%)", type: "number" },
      { name: "termMonths", label: "Tenor (bulan)", type: "number" },
      { name: "adminFeeAmount", label: "Biaya Admin", type: "number" },
      { name: "penaltyAmount", label: "Denda", type: "number" },
      { name: "note", label: "Catatan", multiline: true, size: 12 }
    ],
    [loanProductOptions, memberOptions]
  );

  const paymentDialogFields = [
    { name: "paymentNo", label: "No. Pembayaran" },
    { name: "paymentTs", label: "Waktu Pembayaran", type: "datetime-local" },
    { name: "paymentAmount", label: "Nominal Pembayaran", type: "number" },
    { name: "note", label: "Catatan", multiline: true, size: 12 }
  ];
  const loanColumns = useMemo(
    () => [
      columnHelper.accessor("loanNo", {
        id: "loan",
        header: "Pinjaman",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.loanNo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Anggota #{row.original.memberId} - akad {formatDate(row.original.loanDate)}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("principalAmount", {
        id: "principal",
        header: "Pokok",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{formatCurrency(row.original.principalAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              tenor {row.original.termMonths} bulan
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("outstandingTotalAmount", {
        id: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{formatCurrency(row.original.outstandingTotalAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              angsuran {formatCurrency(row.original.installmentAmount)}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: (info) => (
          <Chip size="small" label={info.getValue()} color={info.getValue() === "active" ? "success" : "default"} />
        )
      })
    ],
    []
  );
  const installmentColumns = useMemo(
    () => [
      columnHelper.accessor("installmentNo", {
        id: "installmentNo",
        header: "Angsuran",
        cell: (info) => `#${info.getValue()}`
      }),
      columnHelper.accessor("dueDate", {
        id: "dueDate",
        header: "Jatuh Tempo",
        cell: (info) => formatDate(info.getValue())
      }),
      columnHelper.accessor("installmentAmount", {
        id: "installmentAmount",
        header: () => <Box sx={{ textAlign: "right" }}>Tagihan</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      }),
      columnHelper.accessor("installmentStatus", {
        id: "installmentStatus",
        header: "Status",
        cell: (info) => (
          <Chip size="small" label={info.getValue()} color={info.getValue() === "paid" ? "success" : "default"} />
        )
      })
    ],
    []
  );
  const paymentColumns = useMemo(
    () => [
      columnHelper.accessor("paymentNo", {
        id: "paymentNo",
        header: "No. Pembayaran",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.paymentNo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.fullName}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("loanNo", {
        id: "loanNo",
        header: "Pinjaman"
      }),
      columnHelper.accessor("paymentAmount", {
        id: "paymentAmount",
        header: () => <Box sx={{ textAlign: "right" }}>Nominal</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      }),
      columnHelper.accessor("paymentTs", {
        id: "paymentTs",
        header: "Waktu",
        cell: (info) => formatDateTime(info.getValue())
      }),
      columnHelper.accessor("note", {
        id: "note",
        header: "Catatan",
        cell: (info) => info.getValue() || "-"
      }),
      columnHelper.display({
        id: "actions",
        header: () => <Box sx={{ textAlign: "right" }}>Aksi</Box>,
        cell: ({ row }) => {
          const canCancel = isAdmin && selectedLoan?.loanId === row.original.loanId && row.original.loanPaymentId === latestVisiblePaymentId;

          return canCancel ? (
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="small"
                color="warning"
                startIcon={<UndoOutlinedIcon />}
                onClick={() => setCancelPaymentTarget(row.original)}
              >
                Batalkan
              </Button>
            </Stack>
          ) : null;
        }
      })
    ],
    [isAdmin, latestVisiblePaymentId, selectedLoan]
  );
  const loansTable = useReactTable({
    data: loanItems,
    columns: loanColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: loans?.totalCount ?? 0
  });
  const installmentsTable = useReactTable({
    data: installmentItems,
    columns: installmentColumns,
    getCoreRowModel: getCoreRowModel()
  });
  const paymentsTable = useReactTable({
    data: paymentItems,
    columns: paymentColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: payments?.totalCount ?? 0
  });

  if (loansError || paymentsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{loansQueryError?.message || paymentsQueryError?.message}</Alert>
      </Box>
    );
  }

  return (
    <KspPageShell
      eyebrow="Operasional KSP"
      title="Pinjaman dan Cicilan"
      description="Pemrosesan pinjaman anggota, pemantauan outstanding, dan pencatatan pembayaran cicilan dalam satu area kerja."
      action={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" disabled={!selectedLoan} startIcon={<PriceCheckOutlinedIcon />} onClick={() => setPaymentDialogOpen(true)}>
            Catat Pembayaran
          </Button>
          <Button variant="contained" startIcon={<AddCardOutlinedIcon />} onClick={() => setLoanDialogOpen(true)}>
            Buat Pinjaman
          </Button>
        </Stack>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PaymentsOutlinedIcon />} title="Pinjaman Aktif" value={loans?.totalCount ?? 0} caption="pinjaman sesuai filter" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AssignmentTurnedInOutlinedIcon />} title="Pembayaran Tercatat" value={payments?.totalCount ?? 0} caption={selectedLoan ? "untuk pinjaman terpilih" : "riwayat terbaru"} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PriceCheckOutlinedIcon />} title="Outstanding Terlihat" value={formatCurrency(totalOutstanding)} caption="total sisa kewajiban pada daftar saat ini" />
        </Grid2>
      </Grid2>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField size="small" select label="Anggota" value={searchMemberId} onChange={(event) => { setSearchMemberId(event.target.value); setLoanPage(0); setPaymentPage(0); }} sx={{ minWidth: 240 }}>
            <MenuItem value="">Semua anggota</MenuItem>
            {memberOptions.map((item) => (
              <MenuItem key={item.memberId} value={item.memberId}>
                {item.memberNo} - {item.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" select label="Status Pinjaman" value={status} onChange={(event) => { setStatus(event.target.value); setLoanPage(0); }} sx={{ minWidth: 180 }}>
            {LOAN_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || "all"} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            disabled
            fullWidth
            value={selectedLoan ? `${selectedLoan.loanNo} - ${selectedLoan.status}` : "Pilih satu pinjaman untuk melihat jadwal dan menerima pembayaran."}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>
      </Paper>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Kontrak Pinjaman" description="Data akad pinjaman anggota. Pilih baris untuk melihat jadwal cicilan dan memproses pembayaran.">
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  {loansTable.getHeaderGroups().map((headerGroup) => (
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
                  {loansLoading ? (
                    <TableRow>
                      <TableCell colSpan={loanColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat data pinjaman...
                      </TableCell>
                    </TableRow>
                  ) : loansTable.getRowModel().rows.length > 0 ? (
                    loansTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        selected={selectedLoan?.loanId === row.original.loanId}
                        onClick={() => setSelectedLoan(row.original)}
                        sx={{ cursor: "pointer" }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} sx={tableCellSx}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={loanColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Belum ada pinjaman yang sesuai filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={loans?.totalCount ?? 0}
              page={loanPage}
              onPageChange={(_, nextPage) => setLoanPage(nextPage)}
              rowsPerPage={loanRowsPerPage}
              onRowsPerPageChange={(event) => {
                setLoanRowsPerPage(Number(event.target.value));
                setLoanPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title={selectedLoan ? `Jadwal Cicilan ${selectedLoan.loanNo}` : "Jadwal Cicilan"}
            description={selectedLoan ? "Ringkasan jadwal untuk membantu proses penagihan dan pembayaran." : "Pilih pinjaman pada tabel kiri untuk melihat jadwal cicilan."}
            actions={selectedLoan ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setPaymentDialogOpen(true)}>
                  Catat Pembayaran
                </Button>
                {isAdmin ? (
                  <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(selectedLoan)}>
                    Hapus Kontrak
                  </Button>
                ) : null}
              </Stack>
            ) : null}
          >
            {selectedLoan ? (
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
                    columnGap: 2,
                    rowGap: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary">No. Pinjaman</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedLoan.loanNo}</Typography>
                  <Typography variant="body2" color="text.secondary">Member ID</Typography>
                  <Typography variant="body2">{selectedLoan.memberId}</Typography>
                  <Typography variant="body2" color="text.secondary">Tanggal Akad</Typography>
                  <Typography variant="body2">{formatDate(selectedLoan.loanDate)}</Typography>
                  <Typography variant="body2" color="text.secondary">Pokok</Typography>
                  <Typography variant="body2">{formatCurrency(selectedLoan.principalAmount)}</Typography>
                  <Typography variant="body2" color="text.secondary">Outstanding</Typography>
                  <Typography variant="body2">{formatCurrency(selectedLoan.outstandingTotalAmount)}</Typography>
                  <Typography variant="body2" color="text.secondary">Angsuran</Typography>
                  <Typography variant="body2">{formatCurrency(selectedLoan.installmentAmount)}</Typography>
                  <Typography variant="body2" color="text.secondary">Tenor</Typography>
                  <Typography variant="body2">{selectedLoan.termMonths} bulan</Typography>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Box>
                    <Chip size="small" label={selectedLoan.status} color={selectedLoan.status === "active" ? "success" : "default"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Catatan</Typography>
                  <Typography variant="body2">{selectedLoan.note || "-"}</Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead>
                      {installmentsTable.getHeaderGroups().map((headerGroup) => (
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
                      {installmentsTable.getRowModel().rows.length > 0 ? (
                        installmentsTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} hover>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} sx={tableCellSx}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={installmentColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                            Jadwal cicilan belum tersedia pada data ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {isAdmin ? (
                  <Alert severity="warning" sx={{ borderRadius: 3 }}>
                    Penghapusan kontrak hanya tersedia untuk admin dan hanya bisa dilakukan bila pinjaman belum punya pembayaran serta tidak berasal dari konversi kredit POS.
                  </Alert>
                ) : null}
              </Stack>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Pilih satu kontrak pinjaman untuk melihat jatuh tempo dan memudahkan pencatatan pembayaran.
              </Alert>
            )}
          </SectionCard>
        </Grid2>
      </Grid2>

      <SectionCard
        title={selectedLoan ? `Riwayat Pembayaran ${selectedLoan.loanNo}` : "Riwayat Pembayaran"}
        description="Semua pembayaran cicilan yang sudah tercatat. Saat pinjaman dipilih, daftar dipersempit ke pinjaman tersebut."
      >
        {isAdmin && selectedLoan ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Hanya pembayaran paling baru untuk pinjaman terpilih yang bisa dibatalkan.
          </Alert>
        ) : null}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              {paymentsTable.getHeaderGroups().map((headerGroup) => (
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
              {paymentsLoading ? (
                <TableRow>
                  <TableCell colSpan={paymentColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Memuat riwayat pembayaran...
                  </TableCell>
                </TableRow>
              ) : paymentsTable.getRowModel().rows.length > 0 ? (
                paymentsTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} hover>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} sx={tableCellSx}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={paymentColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Belum ada pembayaran yang sesuai filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={payments?.totalCount ?? 0}
          page={paymentPage}
          onPageChange={(_, nextPage) => setPaymentPage(nextPage)}
          rowsPerPage={paymentRowsPerPage}
          onRowsPerPageChange={(event) => {
            setPaymentRowsPerPage(Number(event.target.value));
            setPaymentPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </SectionCard>

      <WorkspaceFormDialog
        title="Pinjaman"
        open={loanDialogOpen}
        mode="create"
        initialData={{
          memberId: searchMemberId || "",
          loanProductId: "",
          loanNo: buildLoanNumber(),
          loanDate: toDateInputValue(),
          principalAmount: "",
          flatInterestRatePct: "",
          termMonths: "",
          adminFeeAmount: "",
          penaltyAmount: "",
          note: ""
        }}
        isPending={createLoan.isPending}
        onClose={() => setLoanDialogOpen(false)}
        onSubmit={async (payload) => {
          const request = {
            memberId: toNumberValue(payload.memberId),
            loanProductId: toNumberValue(payload.loanProductId),
            loanNo: payload.loanNo?.trim(),
            loanDate: payload.loanDate,
            principalAmount: toNumberValue(payload.principalAmount),
            flatInterestRatePct: toNullableNumberValue(payload.flatInterestRatePct),
            termMonths: toNullableNumberValue(payload.termMonths),
            adminFeeAmount: toNullableNumberValue(payload.adminFeeAmount),
            penaltyAmount: toNullableNumberValue(payload.penaltyAmount),
            note: payload.note?.trim() || null
          };

          await createLoan.mutateAsync(request);
          setLoanDialogOpen(false);
        }}
        fields={loanDialogFields}
      />

      <WorkspaceFormDialog
        title="Pembayaran Cicilan"
        open={paymentDialogOpen}
        mode="create"
        initialData={{
          paymentNo: buildPaymentNumber(),
          paymentTs: toDateTimeInputValue(),
          paymentAmount: selectedLoan?.installmentAmount || "",
          note: selectedLoan ? `Pembayaran untuk ${selectedLoan.loanNo}` : ""
        }}
        isPending={createPayment.isPending}
        onClose={() => setPaymentDialogOpen(false)}
        onSubmit={async (payload) => {
          const request = {
            paymentNo: payload.paymentNo?.trim(),
            paymentTs: payload.paymentTs,
            paymentAmount: toNumberValue(payload.paymentAmount),
            loanInstallmentScheduleId: null,
            note: payload.note?.trim() || null
          };

          await createPayment.mutateAsync(request);
          setPaymentDialogOpen(false);
        }}
        fields={paymentDialogFields}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={deleteLoan.isPending ? undefined : () => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Hapus Kontrak Pinjaman?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              Kontrak pinjaman <strong>{deleteTarget?.loanNo}</strong> akan dihapus permanen dari sistem.
            </Typography>
            {deleteTarget ? (
              <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 1.5, rowGap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Anggota</Typography>
                <Typography variant="caption">{deleteTarget.memberId}</Typography>
                <Typography variant="caption" color="text.secondary">Pokok</Typography>
                <Typography variant="caption">{formatCurrency(deleteTarget.principalAmount)}</Typography>
                <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                <Typography variant="caption">{formatCurrency(deleteTarget.outstandingTotalAmount)}</Typography>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="caption">{deleteTarget.status}</Typography>
              </Box>
            ) : null}
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Hapus hanya bisa dilakukan untuk kontrak yang belum memiliki pembayaran dan tidak berasal dari konversi kredit POS.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteLoan.isPending}>Batal</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoan.isPending}
            onClick={async () => {
              await deleteLoan.mutateAsync(deleteTarget.loanId);
              if (selectedLoan?.loanId === deleteTarget.loanId) {
                setSelectedLoan(null);
              }
              setDeleteTarget(null);
            }}
          >
            {deleteLoan.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(cancelPaymentTarget)} onClose={deleteLoanPayment.isPending ? undefined : () => setCancelPaymentTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Batalkan Pembayaran Terakhir?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              Pembayaran <strong>{cancelPaymentTarget?.paymentNo}</strong> akan dibatalkan dan outstanding pinjaman akan dikembalikan.
            </Typography>
            {cancelPaymentTarget ? (
              <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 1.5, rowGap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Pinjaman</Typography>
                <Typography variant="caption">{cancelPaymentTarget.loanNo}</Typography>
                <Typography variant="caption" color="text.secondary">Nominal</Typography>
                <Typography variant="caption">{formatCurrency(cancelPaymentTarget.paymentAmount)}</Typography>
                <Typography variant="caption" color="text.secondary">Waktu</Typography>
                <Typography variant="caption">{formatDateTime(cancelPaymentTarget.paymentTs)}</Typography>
              </Box>
            ) : null}
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Aksi ini hanya boleh untuk pembayaran paling baru agar urutan rekonsiliasi pinjaman tetap benar.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelPaymentTarget(null)} disabled={deleteLoanPayment.isPending}>Batal</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={deleteLoanPayment.isPending}
            onClick={async () => {
              await deleteLoanPayment.mutateAsync(cancelPaymentTarget.loanPaymentId);
              setCancelPaymentTarget(null);
            }}
          >
            {deleteLoanPayment.isPending ? "Membatalkan..." : "Batalkan Pembayaran"}
          </Button>
        </DialogActions>
      </Dialog>
    </KspPageShell>
  );
}
