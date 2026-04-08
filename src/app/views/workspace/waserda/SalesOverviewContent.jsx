import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import {
  Alert,
  Box,
  Button,
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
  TableSortLabel,
  TextField,
  Typography
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useConvertSaleToLoan, useSales } from "app/hooks/useBusinessModules";
import { useLoanProducts } from "app/hooks/useKoperasi";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";
import SaleReceiptDialog from "../shared/SaleReceiptDialog";
import { formatCurrency, formatDateTime, toDateInputValue, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

function buildLoanNumber() {
  return `LN-SALE-${Date.now()}`;
}

export default function SalesOverviewContent() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptSaleId, setReceiptSaleId] = useState(null);
  const [sorting, setSorting] = useState([]);

  const salesFilters = {
    Page: page + 1,
    PageSize: rowsPerPage,
    Search: search || undefined,
    SaleType: saleTypeFilter || undefined
  };

  const { data: sales, isLoading, isError, error } = useSales(salesFilters);
  const { data: loanProducts } = useLoanProducts({ Page: 1, PageSize: 100, IsActive: true });
  const convertSaleToLoan = useConvertSaleToLoan(selectedSale?.saleId);
  const loanProductOptions = useMemo(() => loanProducts?.items ?? [], [loanProducts?.items]);
  const saleItems = sales?.items ?? [];
  const totalSalesAmount = saleItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const creditSalesCount = saleItems.filter((item) => item.saleType === "member_credit").length;

  const columns = useMemo(
    () => [
      columnHelper.accessor("saleNo", {
        id: "saleNo",
        header: "No. Penjualan",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.saleNo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.receiptNo || "-"}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("saleType", {
        id: "saleType",
        header: "Tipe",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{row.original.saleType === "cash" ? "Tunai" : "Kredit Anggota"}</Typography>
            <Typography variant="caption" color="text.secondary">
              Member {row.original.memberId || "-"}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("totalAmount", {
        id: "totalAmount",
        header: () => <Stack alignItems="flex-end">Total</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      }),
      columnHelper.accessor("paidAmount", {
        id: "paidAmount",
        header: () => <Stack alignItems="flex-end">Dibayar</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      }),
      columnHelper.accessor("saleTs", {
        id: "saleTs",
        header: "Waktu",
        enableSorting: true,
        sortingFn: "datetime",
        cell: (info) => formatDateTime(info.getValue())
      }),
      columnHelper.display({
        id: "actions",
        header: () => <Stack alignItems="flex-end">Aksi</Stack>,
        cell: ({ row }) => (
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button size="small" onClick={() => setReceiptSaleId(row.original.saleId)}>
              Lihat Struk
            </Button>
            {row.original.saleType === "member_credit" ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedSale(row.original);
                  setConvertDialogOpen(true);
                }}
              >
                Konversi ke Pinjaman
              </Button>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                Selesai
              </Typography>
            )}
          </Stack>
        )
      })
    ],
    []
  );

  const table = useReactTable({
    data: saleItems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: sales?.totalCount ?? 0
  });

  const convertFields = useMemo(
    () => [
      {
        name: "loanProductId",
        label: "Produk Pinjaman",
        type: "select",
        options: loanProductOptions.map((item) => ({ value: item.loanProductId, label: `${item.productCode} - ${item.productName}` }))
      },
      { name: "loanNo", label: "No. Pinjaman" },
      { name: "loanDate", label: "Tanggal Pinjaman", type: "date" },
      { name: "flatInterestRatePct", label: "Bunga Flat (%)", type: "number" },
      { name: "termMonths", label: "Tenor (bulan)", type: "number" },
      { name: "adminFeeAmount", label: "Biaya Admin", type: "number" },
      { name: "penaltyAmount", label: "Denda", type: "number" },
      { name: "note", label: "Catatan", multiline: true, size: 12 }
    ],
    [loanProductOptions]
  );

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Riwayat Penjualan"
      description="Monitor transaksi yang sudah tercatat, buka struk, dan lanjutkan konversi penjualan kredit ke pinjaman. Checkout kasir kini dipisah ke halaman khusus agar lebih cepat."
      action={
        <Button variant="contained" startIcon={<ShoppingCartCheckoutOutlinedIcon />} component={RouterLink} to="/waserda/penjualan/kasir">
          Buka Kasir POS
        </Button>
      }
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PointOfSaleOutlinedIcon />} title="Transaksi Terlihat" value={sales?.totalCount ?? 0} caption="sesuai filter aktif" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<ReceiptLongOutlinedIcon />} title="Nilai Penjualan" value={formatCurrency(totalSalesAmount)} caption="total dari daftar yang tampil" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<CurrencyExchangeOutlinedIcon />} title="Kredit Anggota" value={creditSalesCount} caption="transaksi yang bisa dikonversi ke pinjaman" />
        </Grid2>
      </Grid2>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Cari nomor penjualan, nomor struk, atau catatan"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField size="small" select label="Tipe Penjualan" value={saleTypeFilter} onChange={(event) => { setSaleTypeFilter(event.target.value); setPage(0); }} sx={{ minWidth: 220 }}>
            <MenuItem value="">Semua tipe</MenuItem>
            <MenuItem value="cash">Tunai</MenuItem>
            <MenuItem value="member_credit">Kredit Anggota</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <SectionCard title="Daftar Penjualan" description="Halaman ini sekarang fokus ke monitoring transaksi yang sudah masuk. Gunakan tombol Kasir POS untuk membuat transaksi baru.">
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableCell key={header.id} sx={tableCellSx}>
                        {header.isPlaceholder ? null : canSort ? (
                          <TableSortLabel active={Boolean(sortDirection)} direction={sortDirection || "asc"} onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableSortLabel>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Memuat transaksi penjualan...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
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
                  <TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Belum ada penjualan pada filter ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sales?.totalCount ?? 0}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </SectionCard>

      <SaleReceiptDialog saleId={receiptSaleId} open={Boolean(receiptSaleId)} onClose={() => setReceiptSaleId(null)} />

      <WorkspaceFormDialog
        title="Konversi ke Pinjaman"
        open={convertDialogOpen}
        mode="create"
        initialData={{
          loanProductId: "",
          loanNo: buildLoanNumber(),
          loanDate: toDateInputValue(),
          flatInterestRatePct: "",
          termMonths: "",
          adminFeeAmount: "",
          penaltyAmount: "",
          note: selectedSale ? `Konversi dari penjualan ${selectedSale.saleNo}` : ""
        }}
        isPending={convertSaleToLoan.isPending}
        onClose={() => setConvertDialogOpen(false)}
        onSubmit={async (payload) => {
          const request = {
            loanProductId: toNumberValue(payload.loanProductId),
            loanNo: payload.loanNo?.trim(),
            loanDate: payload.loanDate,
            flatInterestRatePct: toNullableNumberValue(payload.flatInterestRatePct),
            termMonths: toNullableNumberValue(payload.termMonths),
            adminFeeAmount: toNullableNumberValue(payload.adminFeeAmount),
            penaltyAmount: toNullableNumberValue(payload.penaltyAmount),
            note: payload.note?.trim() || null
          };

          await convertSaleToLoan.mutateAsync(request);
          setConvertDialogOpen(false);
        }}
        fields={convertFields}
      />
    </PageFrame>
  );
}
