import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoveDownOutlinedIcon from "@mui/icons-material/MoveDownOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { useCreatePurchaseReceipt, useProductLookup, useSuppliers } from "app/hooks/useBusinessModules";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { formatCurrency, toDateInputValue, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";

function nextNo(prefix) {
  return `${prefix}-${Date.now()}`;
}

function createInitialReceiptForm() {
  return {
    receiptNo: nextNo("GRN"),
    supplierId: "",
    receiptDate: toDateInputValue(),
    note: "",
    items: []
  };
}

function findBestProductMatch(items, query) {
  if (!query) return null;
  const normalized = query.trim().toLowerCase();
  return (
    items.find((item) => item.barcode?.toLowerCase() === normalized) ||
    items.find((item) => item.sku?.toLowerCase() === normalized) ||
    (items.length === 1 ? items[0] : null)
  );
}

const tableEdgePaddingSx = {
  "& .MuiTableCell-root:first-of-type": { pl: 3 },
  "& .MuiTableCell-root:last-of-type": { pr: 3 }
};

export default function InventoryStockReceiptsEntryContent() {
  const scannerInputRef = useRef(null);
  const [receiptForm, setReceiptForm] = useState(createInitialReceiptForm);
  const [productQuery, setProductQuery] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogQuery, setProductDialogQuery] = useState("");
  const [inlineError, setInlineError] = useState("");

  const deferredProductQuery = useDeferredValue(productQuery.trim());
  const deferredProductDialogQuery = useDeferredValue(productDialogQuery.trim());
  const { data: suppliers, isError: suppliersError, error: suppliersQueryError } = useSuppliers();
  const productLookup = useProductLookup(
    { query: deferredProductQuery, limit: 8 },
    { enabled: deferredProductQuery.length >= 1 }
  );
  const productDialogLookup = useProductLookup(
    { query: deferredProductDialogQuery, limit: 25 },
    { enabled: productDialogOpen && deferredProductDialogQuery.length >= 1 }
  );
  const createReceipt = useCreatePurchaseReceipt();

  const supplierItems = suppliers ?? [];
  const productResults = productLookup.data ?? [];
  const productDialogResults = productDialogLookup.data ?? [];
  const receiptTotal = receiptForm.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
  const totalQuantity = receiptForm.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const lowStockCount = receiptForm.items.filter((item) => Number(item.onHandQty || 0) <= 0).length;

  useEffect(() => {
    scannerInputRef.current?.focus();
  }, []);

  const addProductToReceipt = (product) => {
    setReceiptForm((current) => {
      const existingIndex = current.items.findIndex((item) => item.productId === product.productId);
      if (existingIndex >= 0) {
        return {
          ...current,
          items: current.items.map((item, index) =>
            index === existingIndex ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item
          )
        };
      }

      return {
        ...current,
        items: [
          {
            productId: String(product.productId),
            sku: product.sku,
            barcode: product.barcode,
            productName: product.productName,
            quantity: 1,
            unitCost: product.purchasePrice ?? product.costPrice ?? "",
            unitName: product.unitName,
            onHandQty: product.onHandQty
          },
          ...current.items
        ]
      };
    });
    setProductQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const updateReceiptItem = (productId, field, value) => {
    setReceiptForm((current) => ({
      ...current,
      items: current.items.map((item) => (
        String(item.productId) === String(productId) ? { ...item, [field]: value } : item
      ))
    }));
  };

  const removeReceiptItem = (productId) => {
    setReceiptForm((current) => ({
      ...current,
      items: current.items.filter((item) => String(item.productId) !== String(productId))
    }));
  };

  const resetReceiptForm = () => {
    setReceiptForm(createInitialReceiptForm());
    setProductQuery("");
    setProductDialogQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const openProductDialog = () => {
    setProductDialogQuery(productQuery);
    setProductDialogOpen(true);
    setInlineError("");
  };

  const handleAddProductFromQuery = async () => {
    const match = findBestProductMatch(productResults, productQuery);
    if (match) {
      addProductToReceipt(match);
      return;
    }

    const response = await productLookup.refetch();
    const refreshedItems = response.data ?? [];
    const fallbackMatch = findBestProductMatch(refreshedItems, productQuery);
    if (fallbackMatch) {
      addProductToReceipt(fallbackMatch);
      return;
    }

    setInlineError("Barang belum ditemukan. Scan barcode lagi atau gunakan Cari di Tabel.");
  };

  if (suppliersError) {
    return (
      <PageFrame section="POS Waserda" title="Stok Masuk Entry" description="Pencatatan penerimaan barang.">
        <Alert severity="error">{suppliersQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Stok Masuk Entry"
      description="Halaman input penerimaan barang yang fokus untuk scan, cari manual, dan menyusun item stok masuk tanpa berpindah dialog."
      action={
        <Button component={RouterLink} to="/waserda/inventori/stok-masuk" variant="outlined" startIcon={<ArrowBackOutlinedIcon />}>
          Riwayat Stok Masuk
        </Button>
      }
    >
      {inlineError ? <Alert severity="warning">{inlineError}</Alert> : null}

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<MoveDownOutlinedIcon />} title="Baris Barang" value={receiptForm.items.length} caption="item aktif pada dokumen berjalan" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AddIcon />} title="Qty Diterima" value={totalQuantity} caption="total unit yang akan masuk ke stok" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<QrCodeScannerOutlinedIcon />} title="Perlu Cek Stok" value={lowStockCount} caption="item dengan stok saat ini masih nol" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <SectionCard
              title="Scan atau Cari Barang"
              description="Gunakan barcode scanner, SKU, atau nama produk. Jika hasil cocok persis, barang langsung masuk ke dokumen."
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  autoFocus
                  inputRef={scannerInputRef}
                  label="Barcode / SKU / nama produk"
                  placeholder="Contoh: 899600160026 atau GULA PASIR"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleAddProductFromQuery();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  helperText="Tekan Enter untuk scan cepat. Untuk pencarian manual, pakai Cari di Tabel."
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => void handleAddProductFromQuery()}>
                    Tambah Cepat
                  </Button>
                  <Button size="small" variant="outlined" onClick={openProductDialog}>
                    Cari di Tabel
                  </Button>
                </Stack>

                {productQuery.trim() && productResults.length > 0 ? (
                  <Stack spacing={1}>
                    {productResults.map((product) => (
                      <Paper
                        key={product.productId}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 3, cursor: "pointer" }}
                        onClick={() => addProductToReceipt(product)}
                      >
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>
                              {product.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.sku}
                              {product.barcode ? ` | ${product.barcode}` : ""}
                              {` | stok ${product.onHandQty} ${product.unitName}`}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {formatCurrency(product.purchasePrice ?? product.costPrice ?? 0)}
                          </Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </SectionCard>

            <SectionCard
              title="Daftar Barang Diterima"
              description="Atur jumlah dan harga modal setiap item tanpa keluar dari halaman stok masuk."
              actions={
                <Button color="inherit" onClick={() => setReceiptForm((current) => ({ ...current, items: [] }))} disabled={!receiptForm.items.length}>
                  Kosongkan
                </Button>
              }
            >
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table size="small" sx={tableEdgePaddingSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produk</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Harga Modal</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receiptForm.items.length ? (
                      receiptForm.items.map((item) => (
                        <TableRow key={item.productId} hover>
                          <TableCell sx={{ minWidth: 280 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {item.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.sku}
                              {item.barcode ? ` | ${item.barcode}` : ""}
                              {` | stok ${item.onHandQty} ${item.unitName}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 110 }}>
                            <TextField size="small" type="number" value={item.quantity} onChange={(event) => updateReceiptItem(item.productId, "quantity", event.target.value)} />
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 150 }}>
                            <TextField size="small" type="number" value={item.unitCost} onChange={(event) => updateReceiptItem(item.productId, "unitCost", event.target.value)} />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(Number(item.quantity || 0) * Number(item.unitCost || 0))}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton color="error" onClick={() => removeReceiptItem(item.productId)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                          Belum ada item. Scan barcode atau cari barang untuk mulai menyusun dokumen stok masuk.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </SectionCard>
          </Stack>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Informasi Dokumen" description="Nomor dokumen, supplier, tanggal terima, dan catatan ada di sisi kanan agar operator tetap fokus ke item.">
              <Stack spacing={2}>
                <TextField fullWidth label="No. Dokumen" value={receiptForm.receiptNo} onChange={(event) => setReceiptForm((current) => ({ ...current, receiptNo: event.target.value }))} />
                <TextField fullWidth select label="Supplier" value={receiptForm.supplierId} onChange={(event) => setReceiptForm((current) => ({ ...current, supplierId: event.target.value }))}>
                  <MenuItem value="">Tanpa supplier</MenuItem>
                  {supplierItems.map((item) => (
                    <MenuItem key={item.supplierId} value={item.supplierId}>
                      {item.supplierCode} - {item.supplierName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth label="Tanggal Terima" type="date" InputLabelProps={{ shrink: true }} value={receiptForm.receiptDate} onChange={(event) => setReceiptForm((current) => ({ ...current, receiptDate: event.target.value }))} />
                <TextField fullWidth label="Catatan" multiline minRows={2} value={receiptForm.note} onChange={(event) => setReceiptForm((current) => ({ ...current, note: event.target.value }))} />
              </Stack>
            </SectionCard>

            <SectionCard title="Ringkasan Penerimaan" description="Nilai dokumen dihitung otomatis dari barang yang sedang disusun.">
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Baris barang</Typography>
                      <Typography variant="body2" fontWeight={700}>{receiptForm.items.length}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Qty diterima</Typography>
                      <Typography variant="body2" fontWeight={700}>{totalQuantity}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2" fontWeight={800}>Estimasi total</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{formatCurrency(receiptTotal)}</Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {lowStockCount ? (
                  <Alert severity="info">
                    Ada {lowStockCount} item dengan stok saat ini masih nol. Pastikan penerimaan ini memang untuk restock awal atau produk kosong.
                  </Alert>
                ) : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button color="inherit" onClick={resetReceiptForm}>
                    Reset Dokumen
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={createReceipt.isPending}
                    onClick={async () => {
                      if (!receiptForm.items.length) {
                        setInlineError("Tambahkan minimal satu barang ke dokumen stok masuk.");
                        return;
                      }

                      const request = {
                        receiptNo: receiptForm.receiptNo?.trim(),
                        supplierId: toNullableNumberValue(receiptForm.supplierId),
                        receiptDate: receiptForm.receiptDate,
                        note: receiptForm.note?.trim() || null,
                        items: receiptForm.items.filter((item) => item.productId).map((item) => ({
                          productId: toNumberValue(item.productId),
                          quantity: toNumberValue(item.quantity),
                          unitCost: toNumberValue(item.unitCost)
                        }))
                      };

                      await createReceipt.mutateAsync(request);
                      resetReceiptForm();
                    }}
                  >
                    {createReceipt.isPending ? "Menyimpan..." : "Simpan Dokumen"}
                  </Button>
                </Stack>
              </Stack>
            </SectionCard>
          </Stack>
        </Grid2>
      </Grid2>

      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Cari Barang</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              autoFocus
              label="Cari barcode, SKU, atau nama produk"
              value={productDialogQuery}
              onChange={(event) => setProductDialogQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Table size="small" sx={tableEdgePaddingSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell>Barcode / SKU</TableCell>
                    <TableCell align="right">Stok</TableCell>
                    <TableCell align="right">Harga Modal</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productDialogResults.length > 0 ? (
                    productDialogResults.map((product) => (
                      <TableRow key={product.productId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{product.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">{product.unitName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{product.barcode || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">{product.sku}</Typography>
                        </TableCell>
                        <TableCell align="right">{product.onHandQty}</TableCell>
                        <TableCell align="right">{formatCurrency(product.purchasePrice ?? product.costPrice ?? 0)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              addProductToReceipt(product);
                              setProductDialogOpen(false);
                            }}
                          >
                            Tambah
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        {productDialogQuery.trim().length < 1 ? "Masukkan kata kunci untuk mencari barang." : "Barang tidak ditemukan."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </PageFrame>
  );
}
