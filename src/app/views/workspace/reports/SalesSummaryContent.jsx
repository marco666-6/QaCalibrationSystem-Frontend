import { useMemo, useState } from "react";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import {
  Alert,
  Box,
  Button,
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
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import Grid2 from "@mui/material/Grid2";
import { useSalesSummary } from "app/hooks/useKoperasi";
import { formatCurrency, formatDate, toDateInputValue } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

function getDefaultDateRange() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    dateFrom: toDateInputValue(monthStart),
    dateTo: toDateInputValue(now)
  };
}

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };
const edgeTableSx = {
  "& .MuiTableCell-root:first-of-type": { pl: 3 },
  "& .MuiTableCell-root:last-of-type": { pr: 3 }
};

export default function SalesSummaryContent() {
  const defaults = useMemo(() => getDefaultDateRange(), []);
  const [filters, setFilters] = useState(defaults);
  const [dailyPage, setDailyPage] = useState(0);
  const [dailyRowsPerPage, setDailyRowsPerPage] = useState(10);

  const { data, isLoading, isError, error } = useSalesSummary({
    DateFrom: filters.dateFrom,
    DateTo: filters.dateTo
  });

  const dailyItems = data?.dailySummaries ?? [];
  const dailyColumns = useMemo(
    () => [
      columnHelper.accessor("saleDate", {
        id: "saleDate",
        header: "Tanggal",
        cell: (info) => formatDate(info.getValue())
      }),
      columnHelper.accessor("totalSalesCount", {
        id: "totalSalesCount",
        header: () => <Box sx={{ textAlign: "right" }}>Jumlah</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{info.getValue()}</Box>
      }),
      columnHelper.accessor("totalSalesAmount", {
        id: "totalSalesAmount",
        header: () => <Box sx={{ textAlign: "right" }}>Total</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      }),
      columnHelper.accessor("cashSalesAmount", {
        id: "cashSalesAmount",
        header: () => <Box sx={{ textAlign: "right" }}>Tunai</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      }),
      columnHelper.accessor("memberCreditSalesAmount", {
        id: "memberCreditSalesAmount",
        header: () => <Box sx={{ textAlign: "right" }}>Kredit</Box>,
        cell: (info) => <Box sx={{ textAlign: "right" }}>{formatCurrency(info.getValue())}</Box>
      })
    ],
    []
  );
  const dailyTable = useReactTable({
    data: dailyItems,
    columns: dailyColumns,
    state: {
      pagination: {
        pageIndex: dailyPage,
        pageSize: dailyRowsPerPage
      }
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function"
        ? updater({ pageIndex: dailyPage, pageSize: dailyRowsPerPage })
        : updater;
      setDailyPage(next.pageIndex);
      setDailyRowsPerPage(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    );
  }

  return (
    <PageFrame
      section="Laporan"
      title="Ringkasan Penjualan"
      description="Laporan performa penjualan Waserda per periode untuk kebutuhan manajerial dan monitoring arus transaksi harian."
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            label="Dari Tanggal"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => {
              setDailyPage(0);
              setFilters((current) => ({ ...current, dateFrom: event.target.value }));
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Sampai Tanggal"
            type="date"
            value={filters.dateTo}
            onChange={(event) => {
              setDailyPage(0);
              setFilters((current) => ({ ...current, dateTo: event.target.value }));
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" onClick={() => setFilters(defaults)}>
            Reset Periode
          </Button>
        </Stack>
      </Paper>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<PointOfSaleOutlinedIcon />}
            title="Jumlah Penjualan"
            value={data?.totalSalesCount ?? 0}
            caption="transaksi pada periode terpilih"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<RequestQuoteOutlinedIcon />}
            title="Total Penjualan"
            value={formatCurrency(data?.totalSalesAmount)}
            caption="omzet bruto seluruh transaksi"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<PriceCheckOutlinedIcon />}
            title="Tunai"
            value={formatCurrency(data?.totalCashSalesAmount)}
            caption="realisasi penjualan tunai"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<InsightsOutlinedIcon />}
            title="Kredit Anggota"
            value={formatCurrency(data?.totalMemberCreditSalesAmount)}
            caption="penjualan yang menjadi hutang anggota"
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="Ikhtisar Periode"
            description="Pembacaan cepat untuk manager sebelum turun ke rincian per hari."
          >
            <Stack spacing={1.25}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Rata-rata Nilai Transaksi
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(data?.averageSaleAmount)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Diskon
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(data?.totalDiscountAmount)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Periode Laporan
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {data?.dateFrom ? formatDate(data.dateFrom) : "-"} sampai {data?.dateTo ? formatDate(data.dateTo) : "-"}
                </Typography>
              </Paper>
            </Stack>
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Rincian Harian"
            description="Distribusi penjualan per hari untuk membaca ritme transaksi tunai dan kredit anggota."
          >
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, ...edgeTableSx }}>
              <Table size="small">
                <TableHead>
                  {dailyTable.getHeaderGroups().map((headerGroup) => (
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
                    <TableRow>
                      <TableCell colSpan={dailyColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat ringkasan penjualan...
                      </TableCell>
                    </TableRow>
                  ) : dailyTable.getRowModel().rows.length > 0 ? (
                    dailyTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={dailyColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Tidak ada data penjualan untuk periode ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={dailyItems.length}
              page={dailyPage}
              onPageChange={(_, nextPage) => setDailyPage(nextPage)}
              rowsPerPage={dailyRowsPerPage}
              onRowsPerPageChange={(event) => {
                setDailyRowsPerPage(Number(event.target.value));
                setDailyPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageFrame>
  );
}
