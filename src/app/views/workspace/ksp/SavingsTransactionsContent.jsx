import { useMemo, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
import {
  useCreateSavingsTransaction,
  useDeleteSavingsTransaction,
  useSavingsAccounts,
  useSavingsTransactions
} from "app/hooks/useBusinessModules";
import { useMembers, useSavingsProducts } from "app/hooks/useKoperasi";
import {
  formatCurrency,
  formatDateTime,
  toDateTimeInputValue,
  toNullableNumberValue,
  toNumberValue
} from "../shared/workspaceFormatters";
import { MetricCard, SectionCard } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";
import KspPageShell from "./shared/KspPageShell";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "", label: "Semua tipe" },
  { value: "deposit", label: "Setoran" },
  { value: "withdrawal", label: "Penarikan" },
  { value: "adjustment", label: "Penyesuaian" }
];

const ENTRY_TYPE_OPTIONS = [
  { value: "credit", label: "Kredit" },
  { value: "debit", label: "Debit" }
];

function buildTransactionNumber() {
  return `SV-${Date.now()}`;
}

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function SavingsTransactionsContent() {
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("");
  const [productId, setProductId] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [accountPage, setAccountPage] = useState(0);
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(8);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(10);

  const transactionFilters = {
    Page: transactionPage + 1,
    PageSize: transactionRowsPerPage,
    Search: search || undefined,
    MemberId: memberId || undefined,
    SavingsProductId: productId || undefined,
    TransactionType: transactionType || undefined
  };

  const accountFilters = {
    Page: accountPage + 1,
    PageSize: accountRowsPerPage,
    Search: search || undefined,
    MemberId: memberId || undefined,
    SavingsProductId: productId || undefined
  };
  const { data: accounts, isLoading: accountsLoading, isError: accountsError, error: accountsQueryError } =
    useSavingsAccounts(accountFilters);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
    error: transactionsQueryError
  } = useSavingsTransactions(transactionFilters);
  const { data: members } = useMembers({ Page: 1, PageSize: 100 });
  const { data: savingsProducts } = useSavingsProducts({ Page: 1, PageSize: 100, IsActive: true });
  const createSavingsTransaction = useCreateSavingsTransaction();
  const deleteSavingsTransaction = useDeleteSavingsTransaction();

  const memberOptions = useMemo(() => members?.items ?? [], [members?.items]);
  const productOptions = useMemo(() => savingsProducts?.items ?? [], [savingsProducts?.items]);
  const accountItems = accounts?.items ?? [];
  const transactionItems = transactions?.items ?? [];
  const totalBalance = accountItems.reduce((sum, item) => sum + Number(item.balanceAmount || 0), 0);
  const accountColumns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        id: "member",
        header: "Anggota",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.memberNo}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("productName", {
        id: "product",
        header: "Produk",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{row.original.productName}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
              <Chip size="small" label={row.original.savingsKind} variant="outlined" />
              <Chip
                size="small"
                label={row.original.accountStatus}
                color={row.original.accountStatus === "active" ? "success" : "default"}
              />
            </Stack>
          </>
        )
      }),
      columnHelper.accessor("balanceAmount", {
        id: "balance",
        header: () => <Box sx={{ textAlign: "right" }}>Saldo</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      })
    ],
    []
  );
  const transactionColumns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        id: "transactionNo",
        header: "No. Transaksi",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.transactionNo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.productName}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("fullName", {
        id: "member",
        header: "Anggota",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{row.original.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.memberNo}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("transactionType", {
        id: "type",
        header: "Tipe",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.75}>
            <Chip size="small" label={row.original.transactionType} color="primary" variant="outlined" />
            {row.original.entryType ? <Chip size="small" label={row.original.entryType} variant="outlined" /> : null}
          </Stack>
        )
      }),
      columnHelper.accessor("amount", {
        id: "amount",
        header: () => <Box sx={{ textAlign: "right" }}>Nominal</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      }),
      columnHelper.accessor("transactionTs", {
        id: "transactionTs",
        header: "Waktu",
        cell: (info) => formatDateTime(info.getValue())
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <IconButton
            size="small"
            color="error"
            title="Hapus transaksi"
            onClick={() => setDeleteTarget(row.original)}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )
      })
    ],
    []
  );

  const dialogFields = useMemo(
    () => [
      {
        name: "memberId",
        label: "Anggota",
        type: "select",
        options: memberOptions.map((item) => ({ value: item.memberId, label: `${item.memberNo} - ${item.fullName}` }))
      },
      {
        name: "savingsProductId",
        label: "Produk Simpanan",
        type: "select",
        options: productOptions.map((item) => ({ value: item.savingsProductId, label: `${item.productCode} - ${item.productName}` }))
      },
      { name: "transactionNo", label: "No. Transaksi" },
      { name: "transactionTs", label: "Waktu Transaksi", type: "datetime-local", helperText: "Gunakan waktu transaksi aktual." },
      {
        name: "transactionType",
        label: "Jenis Transaksi",
        type: "select",
        options: TRANSACTION_TYPE_OPTIONS.filter((item) => item.value)
      },
      {
        name: "entryType",
        label: "Arah Ledger",
        type: "select",
        options: ENTRY_TYPE_OPTIONS
      },
      { name: "amount", label: "Nominal", type: "number" },
      { name: "periodYear", label: "Periode Tahun", type: "number", helperText: "Isi untuk simpanan periodik." },
      { name: "periodMonth", label: "Periode Bulan", type: "number", helperText: "1-12 untuk simpanan wajib bulanan." },
      { name: "note", label: "Catatan", multiline: true, size: 12 }
    ],
    [memberOptions, productOptions]
  );

  const activeProduct = productOptions.find((item) => String(item.savingsProductId) === String(productId));
  const accountTable = useReactTable({
    data: accountItems,
    columns: accountColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: accounts?.totalCount ?? 0
  });
  const transactionTable = useReactTable({
    data: transactionItems,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: transactions?.totalCount ?? 0
  });

  if (accountsError || transactionsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{accountsQueryError?.message || transactionsQueryError?.message}</Alert>
      </Box>
    );
  }

  return (
    <KspPageShell
      eyebrow="Operasional KSP"
      title="Transaksi Simpanan"
      description="Pencatatan setoran, penarikan, dan penyesuaian untuk seluruh produk simpanan anggota. Alur ini mengikuti aturan ledger pada spesifikasi bisnis."
      action={
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setDialogOpen(true)}>
          Catat Transaksi
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<WalletOutlinedIcon />}
            title="Akun Simpanan"
            value={accounts?.totalCount ?? 0}
            caption="akun yang sudah terbentuk"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<SyncAltOutlinedIcon />}
            title="Transaksi Terlihat"
            value={transactions?.totalCount ?? 0}
            caption="sesuai filter aktif"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard
            icon={<SavingsOutlinedIcon />}
            title="Saldo Terpantau"
            value={formatCurrency(totalBalance)}
            caption="akumulasi baris akun yang sedang tampil"
          />
        </Grid2>
      </Grid2>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Cari anggota, produk, atau nomor transaksi"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setAccountPage(0);
              setTransactionPage(0);
            }}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField
            size="small"
            select
            label="Anggota"
            value={memberId}
            onChange={(event) => {
              setMemberId(event.target.value);
              setAccountPage(0);
              setTransactionPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Semua anggota</MenuItem>
            {memberOptions.map((item) => (
              <MenuItem key={item.memberId} value={item.memberId}>
                {item.memberNo} - {item.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Produk"
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setAccountPage(0);
              setTransactionPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Semua produk</MenuItem>
            {productOptions.map((item) => (
              <MenuItem key={item.savingsProductId} value={item.savingsProductId}>
                {item.productCode} - {item.productName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Jenis"
            value={transactionType}
            onChange={(event) => {
              setTransactionType(event.target.value);
              setTransactionPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            {TRANSACTION_TYPE_OPTIONS.map((item) => (
              <MenuItem key={item.value || "all"} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        {activeProduct ? (
          <Alert severity="info" sx={{ mt: 2.5, borderRadius: 3 }}>
            Produk terpilih: <strong>{activeProduct.productName}</strong> dengan jenis <strong>{activeProduct.savingsKind}</strong> dan periodisitas <strong>{activeProduct.periodicity}</strong>.
          </Alert>
        ) : null}
      </Paper>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title="Akun Simpanan"
            description="Akun terbentuk otomatis saat anggota mulai bertransaksi pada produk terkait."
          >
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  {accountTable.getHeaderGroups().map((headerGroup) => (
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
                  {accountsLoading ? (
                    <TableRow>
                      <TableCell colSpan={accountColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat akun simpanan...
                      </TableCell>
                    </TableRow>
                  ) : accountTable.getRowModel().rows.length > 0 ? (
                    accountTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={accountColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Belum ada akun simpanan yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={accounts?.totalCount ?? 0}
              page={accountPage}
              onPageChange={(_, nextPage) => setAccountPage(nextPage)}
              rowsPerPage={accountRowsPerPage}
              onRowsPerPageChange={(event) => {
                setAccountRowsPerPage(Number(event.target.value));
                setAccountPage(0);
              }}
              rowsPerPageOptions={[8, 16, 32]}
            />
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Ledger Simpanan"
            description="Setiap transaksi masuk sebagai jejak audit untuk modul simpanan dan portal anggota."
          >
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  {transactionTable.getHeaderGroups().map((headerGroup) => (
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
                  {transactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={transactionColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat transaksi simpanan...
                      </TableCell>
                    </TableRow>
                  ) : transactionTable.getRowModel().rows.length > 0 ? (
                    transactionTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={transactionColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Belum ada transaksi pada filter ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={transactions?.totalCount ?? 0}
              page={transactionPage}
              onPageChange={(_, nextPage) => setTransactionPage(nextPage)}
              rowsPerPage={transactionRowsPerPage}
              onRowsPerPageChange={(event) => {
                setTransactionRowsPerPage(Number(event.target.value));
                setTransactionPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </SectionCard>
        </Grid2>
      </Grid2>

      <WorkspaceFormDialog
        title="Transaksi Simpanan"
        open={dialogOpen}
        mode="create"
        initialData={{
          memberId: memberId || "",
          savingsProductId: productId || "",
          transactionNo: buildTransactionNumber(),
          transactionTs: toDateTimeInputValue(),
          transactionType: "deposit",
          entryType: "credit",
          amount: "",
          periodYear: "",
          periodMonth: "",
          note: ""
        }}
        isPending={createSavingsTransaction.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          const request = {
            memberId: toNumberValue(payload.memberId),
            savingsProductId: toNumberValue(payload.savingsProductId),
            transactionNo: payload.transactionNo?.trim(),
            transactionTs: payload.transactionTs,
            transactionType: payload.transactionType,
            entryType: payload.transactionType === "adjustment" ? payload.entryType : payload.transactionType === "withdrawal" ? "debit" : "credit",
            amount: toNumberValue(payload.amount),
            periodYear: toNullableNumberValue(payload.periodYear),
            periodMonth: toNullableNumberValue(payload.periodMonth),
            note: payload.note?.trim() || null
          };

          await createSavingsTransaction.mutateAsync(request);
          setDialogOpen(false);
        }}
        fields={dialogFields}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Hapus Transaksi Simpanan?</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body2" gutterBottom>
              Anda akan menghapus transaksi berikut secara permanen:
            </Typography>
            {deleteTarget && (
              <Box
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  p: 1.5,
                  my: 1.5,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  columnGap: 1.5,
                  rowGap: 0.5
                }}
              >
                <Typography variant="caption" color="text.secondary">No.</Typography>
                <Typography variant="caption" fontWeight={700}>{deleteTarget.transactionNo}</Typography>
                <Typography variant="caption" color="text.secondary">Anggota</Typography>
                <Typography variant="caption">{deleteTarget.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">Tipe</Typography>
                <Typography variant="caption">{deleteTarget.transactionType} / {deleteTarget.entryType}</Typography>
                <Typography variant="caption" color="text.secondary">Nominal</Typography>
                <Typography variant="caption">{formatCurrency(deleteTarget.amount)}</Typography>
              </Box>
            )}
            <Alert severity="warning" sx={{ borderRadius: 2, mt: 0.5 }}>
              Penghapusan ini akan <strong>mengubah saldo akun simpanan</strong> anggota dan menghapus jejak ledger secara permanen.
            </Alert>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteSavingsTransaction.isPending}
            onClick={async () => {
              await deleteSavingsTransaction.mutateAsync(deleteTarget.savingsTransactionId);
              setDeleteTarget(null);
            }}
          >
            {deleteSavingsTransaction.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </KspPageShell>
  );
}
