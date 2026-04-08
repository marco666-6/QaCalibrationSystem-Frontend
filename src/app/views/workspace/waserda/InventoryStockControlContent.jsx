import { Link as RouterLink } from "react-router-dom";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
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
  Tab,
  TableSortLabel,
  Tabs,
  Typography
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useStockAdjustments, useStockMovements } from "app/hooks/useBusinessModules";
import { formatDateTime } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };
const tableEdgePaddingSx = {
  "& .MuiTableCell-root:first-of-type": { pl: 3 },
  "& .MuiTableCell-root:last-of-type": { pr: 3 }
};

export default function InventoryStockControlContent() {
  const [adjustmentPage, setAdjustmentPage] = useState(0);
  const [adjustmentRowsPerPage, setAdjustmentRowsPerPage] = useState(10);
  const [movementPage, setMovementPage] = useState(0);
  const [movementRowsPerPage, setMovementRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("adjustments");
  const [adjustmentSorting, setAdjustmentSorting] = useState([]);
  const [movementSorting, setMovementSorting] = useState([]);

  const { data: adjustments, isLoading: adjustmentsLoading, isError: adjustmentsError, error: adjustmentsQueryError } = useStockAdjustments({ Page: adjustmentPage + 1, PageSize: adjustmentRowsPerPage });
  const { data: movements, isLoading: movementsLoading, isError: movementsError, error: movementsQueryError } = useStockMovements({ Page: movementPage + 1, PageSize: movementRowsPerPage });

  const adjustmentItems = adjustments?.items ?? [];
  const movementItems = movements?.items ?? [];
  const adjustmentColumns = useMemo(
    () => [
      columnHelper.accessor("adjustmentNo", {
        id: "document",
        header: "Dokumen",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>{row.original.adjustmentNo}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.note || "tanpa catatan"}</Typography>
          </>
        )
      }),
      columnHelper.accessor("adjustmentType", {
        id: "type",
        header: "Tipe",
        enableSorting: true,
        sortingFn: "alphanumeric"
      }),
      columnHelper.accessor("reason", {
        id: "reason",
        header: "Alasan",
        enableSorting: true,
        sortingFn: "alphanumeric"
      }),
      columnHelper.accessor("adjustmentTs", {
        id: "time",
        header: "Waktu",
        enableSorting: true,
        sortingFn: "datetime",
        cell: (info) => formatDateTime(info.getValue())
      })
    ],
    []
  );

  const movementColumns = useMemo(
    () => [
      columnHelper.accessor("productName", {
        id: "product",
        header: "Produk",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>{row.original.productName}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.sku}</Typography>
          </>
        )
      }),
      columnHelper.accessor("movementType", {
        id: "type",
        header: "Tipe",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{row.original.movementType}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.sourceTable}</Typography>
          </>
        )
      }),
      columnHelper.accessor("quantity", {
        id: "qty",
        header: () => <Stack alignItems="flex-end">Qty</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: (info) => <Stack alignItems="flex-end">{info.getValue()}</Stack>
      }),
      columnHelper.accessor("movementTs", {
        id: "time",
        header: "Waktu",
        enableSorting: true,
        sortingFn: "datetime",
        cell: (info) => formatDateTime(info.getValue())
      })
    ],
    []
  );

  const adjustmentsTable = useReactTable({
    data: adjustmentItems,
    columns: adjustmentColumns,
    state: { sorting: adjustmentSorting },
    onSortingChange: setAdjustmentSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: adjustments?.totalCount ?? 0
  });

  const movementsTable = useReactTable({
    data: movementItems,
    columns: movementColumns,
    state: { sorting: movementSorting },
    onSortingChange: setMovementSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: movements?.totalCount ?? 0
  });

  if (adjustmentsError || movementsError) {
    return (
      <PageFrame section="POS Waserda" title="Riwayat Penyesuaian Stok" description="Riwayat stock opname dan audit movement.">
        <Alert severity="error">{adjustmentsQueryError?.message || movementsQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Riwayat Penyesuaian Stok"
      description="Halaman ini fokus untuk melihat riwayat stock opname, koreksi, dan audit movement. Proses input dipindah ke halaman entry terpisah agar kontrol stok lebih fokus."
      action={(
        <Button
          component={RouterLink}
          to="/waserda/inventori/penyesuaian/entry"
          variant="contained"
          startIcon={<AutoFixHighOutlinedIcon />}
        >
          Penyesuaian Stok Entry
        </Button>
      )}
    >
      <SectionCard
        title="Kontrol Stok"
        description={activeTab === "adjustments" ? "Semua dokumen stock opname dan koreksi." : "Jejak stok masuk, keluar, dan koreksi dari seluruh dokumen inventori."}
      >
        <Tabs value={activeTab} onChange={(_, nextValue) => setActiveTab(nextValue)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab value="adjustments" label={`Riwayat Penyesuaian (${adjustments?.totalCount ?? 0})`} />
          <Tab value="movements" label={`Audit Movement (${movements?.totalCount ?? 0})`} />
        </Tabs>

        {activeTab === "adjustments" ? (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small" sx={tableEdgePaddingSx}>
                <TableHead>
                  {adjustmentsTable.getHeaderGroups().map((headerGroup) => (
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
                  {adjustmentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={adjustmentColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat penyesuaian stok...
                      </TableCell>
                    </TableRow>
                  ) : adjustmentsTable.getRowModel().rows.length > 0 ? (
                    adjustmentsTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={adjustmentColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Belum ada penyesuaian stok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={adjustments?.totalCount ?? 0}
              page={adjustmentPage}
              onPageChange={(_, nextPage) => setAdjustmentPage(nextPage)}
              rowsPerPage={adjustmentRowsPerPage}
              onRowsPerPageChange={(event) => {
                setAdjustmentRowsPerPage(Number(event.target.value));
                setAdjustmentPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small" sx={tableEdgePaddingSx}>
                <TableHead>
                  {movementsTable.getHeaderGroups().map((headerGroup) => (
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
                  {movementsLoading ? (
                    <TableRow>
                      <TableCell colSpan={movementColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Memuat movement stok...
                      </TableCell>
                    </TableRow>
                  ) : movementsTable.getRowModel().rows.length > 0 ? (
                    movementsTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={movementColumns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>
                        Belum ada audit movement yang tampil.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={movements?.totalCount ?? 0}
              page={movementPage}
              onPageChange={(_, nextPage) => setMovementPage(nextPage)}
              rowsPerPage={movementRowsPerPage}
              onRowsPerPageChange={(event) => {
                setMovementRowsPerPage(Number(event.target.value));
                setMovementPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </SectionCard>
    </PageFrame>
  );
}
