import { useMemo, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import {
  Alert,
  Box,
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
  Typography
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import Grid2 from "@mui/material/Grid2";
import { useMemberBalances } from "app/hooks/useKoperasi";
import { formatCurrency } from "../shared/workspaceFormatters";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function MemberBalancesContent() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sorting, setSorting] = useState([]);
  const filters = { Page: page + 1, PageSize: rowsPerPage };
  const { data, isLoading, isError, error } = useMemberBalances(filters);
  const items = data?.members?.items ?? [];
  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        id: "member",
        header: "Anggota",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>
              {row.original.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.memberNo}
              {row.original.employeeCode ? ` - ${row.original.employeeCode}` : ""}
            </Typography>
          </>
        )
      }),
      columnHelper.accessor("savingsBalance", {
        id: "savingsBalance",
        header: () => <Stack alignItems="flex-end">Simpanan</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      }),
      columnHelper.accessor("outstandingLoanAmount", {
        id: "outstandingLoanAmount",
        header: () => <Stack alignItems="flex-end">Pinjaman</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      }),
      columnHelper.accessor("memberCreditOutstandingAmount", {
        id: "memberCreditOutstandingAmount",
        header: () => <Stack alignItems="flex-end">Kredit POS</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      }),
      columnHelper.accessor("netPositionAmount", {
        id: "netPositionAmount",
        header: () => <Stack alignItems="flex-end">Posisi Bersih</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      })
    ],
    []
  );
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: data?.members?.totalCount ?? 0
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
      title="Posisi Saldo Anggota"
      description="Rekap saldo simpanan, outstanding pinjaman, dan eksposur kredit POS per anggota untuk kebutuhan pengawasan koperasi."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<GroupOutlinedIcon />}
            title="Anggota Tercatat"
            value={data?.memberCountWithTransactions ?? 0}
            caption="anggota yang sudah punya transaksi"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<SavingsOutlinedIcon />}
            title="Total Simpanan"
            value={formatCurrency(data?.totalSavingsBalance)}
            caption="akumulasi saldo simpanan"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<AccountBalanceWalletOutlinedIcon />}
            title="Outstanding Pinjaman"
            value={formatCurrency(data?.totalOutstandingLoanAmount)}
            caption="sisa kewajiban pinjaman anggota"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<BalanceOutlinedIcon />}
            title="Kredit POS"
            value={formatCurrency(data?.totalMemberCreditOutstandingAmount)}
            caption="hutang anggota dari penjualan Waserda"
          />
        </Grid2>
      </Grid2>

      <SectionCard
        title="Rincian per Anggota"
        description="Daftar ini membantu manager membaca posisi bersih anggota dari sisi simpanan, pinjaman, dan kredit POS."
      >
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
                          <TableSortLabel
                            active={Boolean(sortDirection)}
                            direction={sortDirection || "asc"}
                            onClick={header.column.getToggleSortingHandler()}
                          >
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
                    Memuat posisi saldo anggota...
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
                    Belum ada data saldo anggota.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.members?.totalCount ?? 0}
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

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={800}>
            Cara membaca laporan ini
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Posisi bersih dihitung dari saldo simpanan dikurangi kewajiban pinjaman dan kredit POS anggota.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nilai ini membantu koperasi melihat eksposur anggota secara cepat tanpa membuka satu per satu modul transaksi.
          </Typography>
        </Stack>
      </Paper>
    </PageFrame>
  );
}
