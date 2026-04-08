import { Link as RouterLink } from "react-router-dom";
import MoveDownOutlinedIcon from "@mui/icons-material/MoveDownOutlined";
import {
  Alert,
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
  TableSortLabel,
  Typography
} from "@mui/material";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { usePurchaseReceipts } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDate } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function InventoryStockReceiptsContent() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sorting, setSorting] = useState([]);

  const { data: receipts, isLoading: receiptsLoading, isError: receiptsError, error: receiptsQueryError } = usePurchaseReceipts({ Page: page + 1, PageSize: rowsPerPage });
  const receiptItems = receipts?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("receiptNo", {
        id: "document",
        header: "Dokumen",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>{row.original.receiptNo}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.note || "tanpa catatan"}</Typography>
          </>
        )
      }),
      columnHelper.accessor("supplierName", {
        id: "supplier",
        header: "Supplier",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: (info) => info.getValue() || "-"
      }),
      columnHelper.accessor("receiptDate", {
        id: "date",
        header: "Tanggal",
        enableSorting: true,
        sortingFn: "datetime",
        cell: (info) => formatDate(info.getValue())
      }),
      columnHelper.accessor("totalAmount", {
        id: "total",
        header: () => <Stack alignItems="flex-end">Total</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{formatCurrency(info.getValue())}</Stack>
      })
    ],
    []
  );

  const table = useReactTable({
    data: receiptItems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: receipts?.totalCount ?? 0
  });

  if (receiptsError) {
    return (
      <PageFrame section="POS Waserda" title="Riwayat Stok Masuk" description="Daftar dokumen penerimaan barang.">
        <Alert severity="error">{receiptsQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Riwayat Stok Masuk"
      description="Halaman ini fokus untuk melihat seluruh dokumen penerimaan barang. Proses input dipindah ke halaman entry terpisah agar alur gudang lebih cepat."
      action={
        <Button
          component={RouterLink}
          to="/waserda/inventori/stok-masuk/entry"
          variant="contained"
          startIcon={<MoveDownOutlinedIcon />}
        >
          Stok Masuk Entry
        </Button>
      }
    >
      <SectionCard title="Riwayat Dokumen" description="Daftar dokumen penerimaan barang yang sudah tercatat.">
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
              {receiptsLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Memuat dokumen stok masuk...
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
                    Belum ada dokumen stok masuk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={receipts?.totalCount ?? 0}
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
    </PageFrame>
  );
}
