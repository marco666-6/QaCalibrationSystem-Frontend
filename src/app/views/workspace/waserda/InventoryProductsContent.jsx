import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
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
  TableSortLabel,
  TextField,
  Typography
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  useCreateProduct,
  useProductCategories,
  useProducts,
  useUpdateProduct
} from "app/hooks/useBusinessModules";
import { formatCurrency, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";

const columnHelper = createColumnHelper();
const tableCellSx = { px: 2.5, py: 1.75 };

export default function InventoryProductsContent() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productDialog, setProductDialog] = useState({ open: false, mode: "create", data: null });
  const [sorting, setSorting] = useState([]);

  const productFilters = {
    Page: page + 1,
    PageSize: rowsPerPage,
    Search: search || undefined,
    ProductCategoryId: categoryFilter || undefined
  };

  const { data: categories, isError: categoriesError, error: categoriesQueryError } = useProductCategories();
  const { data: products, isLoading: productsLoading, isError: productsError, error: productsQueryError } = useProducts(productFilters);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productDialog.data?.productId);

  const categoryItems = categories ?? [];
  const productItems = products?.items ?? [];
  const lowStockCount = productItems.filter((item) => Number(item.onHandQty || 0) <= Number(item.minStockQty || 0)).length;
  const columns = useMemo(
    () => [
      columnHelper.accessor("productName", {
        id: "product",
        header: "Produk",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <>
            <Typography variant="body2" fontWeight={700}>{row.original.productName}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.sku} - {row.original.unitName}</Typography>
          </>
        )
      }),
      columnHelper.accessor("onHandQty", {
        id: "stock",
        header: "Stok",
        enableSorting: true,
        sortingFn: "basic",
        cell: ({ row }) => (
          <>
            <Typography variant="body2">{row.original.onHandQty}</Typography>
            <Typography variant="caption" color="text.secondary">minimum {row.original.minStockQty}</Typography>
          </>
        )
      }),
      columnHelper.accessor("salePrice", {
        id: "price",
        header: () => <Stack alignItems="flex-end">Harga</Stack>,
        enableSorting: true,
        sortingFn: "basic",
        cell: ({ row }) => (
          <Stack alignItems="flex-end" spacing={0}>
            <Typography variant="body2">{formatCurrency(row.original.salePrice)}</Typography>
            <Typography variant="caption" color="text.secondary">modal {formatCurrency(row.original.costPrice)}</Typography>
          </Stack>
        )
      }),
      columnHelper.accessor("isActive", {
        id: "status",
        header: "Status",
        enableSorting: true,
        sortingFn: "basic",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.75}>
            <Chip size="small" label={row.original.isActive ? "Aktif" : "Nonaktif"} color={row.original.isActive ? "success" : "default"} />
            {Number(row.original.onHandQty || 0) <= Number(row.original.minStockQty || 0) ? <Chip size="small" label="Low stock" color="warning" /> : null}
          </Stack>
        )
      }),
      columnHelper.display({
        id: "actions",
        header: () => <Stack alignItems="flex-end">Aksi</Stack>,
        cell: ({ row }) => (
          <Stack alignItems="flex-end">
            <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setProductDialog({ open: true, mode: "edit", data: row.original })}>
              Edit
            </Button>
          </Stack>
        )
      })
    ],
    []
  );
  const table = useReactTable({
    data: productItems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: products?.totalCount ?? 0
  });

  if (categoriesError || productsError) {
    return (
      <PageFrame section="POS Waserda" title="Master Produk" description="Kelola produk inventori Waserda.">
        <Alert severity="error">{categoriesQueryError?.message || productsQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Master Produk"
      description="Kelola SKU, harga, satuan, kategori, dan batas minimum stok pada satu area khusus produk."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setProductDialog({ open: true, mode: "create", data: null })}>
          Tambah Produk
        </Button>
      }
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Cari SKU, barcode, atau nama produk"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField
            size="small"
            select
            label="Kategori"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Semua kategori</MenuItem>
            {categoryItems.map((item) => (
              <MenuItem key={item.productCategoryId} value={item.productCategoryId}>
                {item.categoryCode} - {item.categoryName}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <SectionCard
        title="Daftar Produk"
        description={`Produk aktif untuk gudang dan kasir. Low stock pada halaman ini: ${lowStockCount} item.`}
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
              {productsLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>Memuat master produk...</TableCell>
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
                  <TableCell colSpan={columns.length} align="center" sx={{ ...tableCellSx, py: 5 }}>Belum ada produk yang cocok dengan filter.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={products?.totalCount ?? 0}
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

      <WorkspaceFormDialog
        title="Produk"
        open={productDialog.open}
        mode={productDialog.mode}
        initialData={productDialog.data || { productCategoryId: "", unitName: "pcs", costPrice: 0, salePrice: 0, minStockQty: 0, isActive: true }}
        isPending={createProduct.isPending || updateProduct.isPending}
        onClose={() => setProductDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = {
            productCategoryId: toNullableNumberValue(payload.productCategoryId),
            sku: payload.sku?.trim(),
            barcode: payload.barcode?.trim() || null,
            productName: payload.productName?.trim(),
            unitName: payload.unitName?.trim(),
            costPrice: toNumberValue(payload.costPrice),
            salePrice: toNumberValue(payload.salePrice),
            isActive: Boolean(payload.isActive),
            minStockQty: toNumberValue(payload.minStockQty)
          };

          if (productDialog.mode === "edit") await updateProduct.mutateAsync(request);
          else await createProduct.mutateAsync(request);

          setProductDialog({ open: false, mode: "create", data: null });
        }}
        fields={[
          { name: "productCategoryId", label: "Kategori", type: "select", options: categoryItems.map((item) => ({ value: item.productCategoryId, label: `${item.categoryCode} - ${item.categoryName}` })) },
          { name: "sku", label: "SKU", disabledOnEdit: true },
          { name: "barcode", label: "Barcode" },
          { name: "productName", label: "Nama Produk" },
          { name: "unitName", label: "Satuan" },
          { name: "costPrice", label: "Harga Pokok", type: "number" },
          { name: "salePrice", label: "Harga Jual", type: "number" },
          { name: "minStockQty", label: "Min. Stock", type: "number" },
          { name: "isActive", label: "Aktif", type: "switch", defaultValue: true, size: 12 }
        ]}
      />
    </PageFrame>
  );
}
