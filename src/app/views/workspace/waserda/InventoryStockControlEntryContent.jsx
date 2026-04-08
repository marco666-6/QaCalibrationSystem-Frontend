import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
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
import { useCreateStockAdjustment, useProductLookup } from "app/hooks/useBusinessModules";
import { MetricCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";
import { formatCurrency, toDateTimeInputValue, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";

const adjustmentTypeOptions = [
  { value: "stock_opname", label: "Stock Opname" },
  { value: "correction", label: "Koreksi" },
  { value: "damaged", label: "Barang Rusak" },
  { value: "expired", label: "Barang Kedaluwarsa" }
];
const tableEdgePaddingSx = {
  "& .MuiTableCell-root:first-of-type": { pl: 3 },
  "& .MuiTableCell-root:last-of-type": { pr: 3 }
};

function nextNo(prefix) {
  return `${prefix}-${Date.now()}`;
}

function createInitialAdjustmentForm() {
  return {
    adjustmentNo: nextNo("ADJ"),
    adjustmentTs: toDateTimeInputValue(),
    adjustmentType: "stock_opname",
    reason: "Stock opname rutin",
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

export default function InventoryStockControlEntryContent() {
  const scannerInputRef = useRef(null);
  const [adjustmentForm, setAdjustmentForm] = useState(createInitialAdjustmentForm);
  const [productQuery, setProductQuery] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogQuery, setProductDialogQuery] = useState("");
  const [inlineError, setInlineError] = useState("");

  const deferredProductQuery = useDeferredValue(productQuery.trim());
  const deferredProductDialogQuery = useDeferredValue(productDialogQuery.trim());
  const productLookup = useProductLookup(
    { query: deferredProductQuery, limit: 8 },
    { enabled: deferredProductQuery.length >= 1 }
  );
  const productDialogLookup = useProductLookup(
    { query: deferredProductDialogQuery, limit: 25 },
    { enabled: productDialogOpen && deferredProductDialogQuery.length >= 1 }
  );
  const createAdjustment = useCreateStockAdjustment();

  const productResults = productLookup.data ?? [];
  const productDialogResults = productDialogLookup.data ?? [];
  const lineCount = adjustmentForm.items.length;
  const varianceCount = adjustmentForm.items.filter((item) => Number(item.actualQty || 0) !== Number(item.onHandQty || 0)).length;
  const negativeVarianceCount = adjustmentForm.items.filter((item) => Number(item.actualQty || 0) < Number(item.onHandQty || 0)).length;

  useEffect(() => {
    scannerInputRef.current?.focus();
  }, []);

  const addProductToAdjustment = (product) => {
    setAdjustmentForm((current) => {
      if (current.items.some((item) => String(item.productId) === String(product.productId))) {
        return current;
      }

      return {
        ...current,
        items: [
          {
            productId: String(product.productId),
            sku: product.sku,
            barcode: product.barcode,
            productName: product.productName,
            onHandQty: Number(product.onHandQty || 0),
            actualQty: product.onHandQty ?? 0,
            unitCost: product.purchasePrice ?? product.costPrice ?? "",
            note: ""
          },
          ...current.items
        ]
      };
    });
    setProductQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const updateAdjustmentItem = (productId, field, value) => {
    setAdjustmentForm((current) => ({
      ...current,
      items: current.items.map((item) => (
        String(item.productId) === String(productId) ? { ...item, [field]: value } : item
      ))
    }));
  };

  const removeAdjustmentItem = (productId) => {
    setAdjustmentForm((current) => ({
      ...current,
      items: current.items.filter((item) => String(item.productId) !== String(productId))
    }));
  };

  const resetAdjustmentForm = () => {
    setAdjustmentForm(createInitialAdjustmentForm());
    setProductQuery("");
    setProductDialogQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const handleAddProductFromQuery = async () => {
    const match = findBestProductMatch(productResults, productQuery);
    if (match) {
      addProductToAdjustment(match);
      return;
    }

    const response = await productLookup.refetch();
    const refreshedItems = response.data ?? [];
    const fallbackMatch = findBestProductMatch(refreshedItems, productQuery);
    if (fallbackMatch) {
      addProductToAdjustment(fallbackMatch);
      return;
    }

    setInlineError("Barang belum ditemukan. Scan barcode lagi atau gunakan Cari di Tabel.");
  };

  return (
    <PageFrame
      section="POS Waserda"
      title="Penyesuaian Stok Entry"
      description="Halaman input stock opname dan koreksi stok yang fokus untuk scan, cari barang, lalu mencatat quantity aktual tanpa dialog panjang."
      action={<Button component={RouterLink} to="/waserda/inventori/penyesuaian" variant="outlined" startIcon={<ArrowBackOutlinedIcon />}>Riwayat Penyesuaian Stok</Button>}
    >
      {inlineError ? <Alert severity="warning">{inlineError}</Alert> : null}

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<Inventory2OutlinedIcon />} title="Baris Barang" value={lineCount} caption="produk aktif pada dokumen penyesuaian" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AutoFixHighOutlinedIcon />} title="Selisih Terdeteksi" value={varianceCount} caption="baris dengan stok aktual berbeda dari stok sistem" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<WarningAmberOutlinedIcon />} title="Selisih Minus" value={negativeVarianceCount} caption="produk dengan stok aktual lebih rendah dari sistem" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Scan atau Cari Barang" description="Gunakan barcode scanner, SKU, atau nama produk. Saat hasil cocok, barang langsung masuk ke dokumen penyesuaian.">
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
                  <Button size="small" onClick={() => void handleAddProductFromQuery()}>Tambah Cepat</Button>
                  <Button size="small" variant="outlined" onClick={() => { setProductDialogQuery(productQuery); setProductDialogOpen(true); setInlineError(""); }}>Cari di Tabel</Button>
                </Stack>

                {productQuery.trim() && productResults.length > 0 ? (
                  <Stack spacing={1}>
                    {productResults.map((product) => (
                      <Paper key={product.productId} variant="outlined" sx={{ p: 1.5, borderRadius: 3, cursor: "pointer" }} onClick={() => addProductToAdjustment(product)}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>{product.productName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.sku}
                              {product.barcode ? ` | ${product.barcode}` : ""}
                              {` | stok ${product.onHandQty} ${product.unitName}`}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle2" fontWeight={800}>{formatCurrency(product.purchasePrice ?? product.costPrice ?? 0)}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </SectionCard>

            <SectionCard title="Daftar Barang Disesuaikan" description="Bandingkan stok sistem dengan stok aktual, lalu catat biaya unit dan catatan per item bila diperlukan.">
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table size="small" sx={tableEdgePaddingSx}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produk</TableCell>
                      <TableCell align="right">Stok Sistem</TableCell>
                      <TableCell align="right">Qty Aktual</TableCell>
                      <TableCell align="right">Selisih</TableCell>
                      <TableCell align="right">Unit Cost</TableCell>
                      <TableCell>Catatan</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adjustmentForm.items.length ? (
                      adjustmentForm.items.map((item) => {
                        const variance = Number(item.actualQty || 0) - Number(item.onHandQty || 0);
                        return (
                          <TableRow key={item.productId} hover>
                            <TableCell sx={{ minWidth: 280 }}>
                              <Typography variant="body2" fontWeight={700}>{item.productName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.sku}
                                {item.barcode ? ` | ${item.barcode}` : ""}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.onHandQty}</TableCell>
                            <TableCell align="right" sx={{ minWidth: 120 }}>
                              <TextField size="small" type="number" value={item.actualQty} onChange={(event) => updateAdjustmentItem(item.productId, "actualQty", event.target.value)} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700} color={variance === 0 ? "text.primary" : variance > 0 ? "success.main" : "error.main"}>
                                {variance > 0 ? `+${variance}` : variance}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 140 }}>
                              <TextField size="small" type="number" value={item.unitCost} onChange={(event) => updateAdjustmentItem(item.productId, "unitCost", event.target.value)} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <TextField fullWidth size="small" value={item.note} onChange={(event) => updateAdjustmentItem(item.productId, "note", event.target.value)} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton color="error" onClick={() => removeAdjustmentItem(item.productId)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          Belum ada item. Scan barcode atau cari barang untuk mulai menyusun dokumen penyesuaian stok.
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
            <SectionCard title="Informasi Dokumen" description="Metadata penyesuaian diletakkan di sisi kanan agar operator tetap fokus pada daftar barang.">
              <Stack spacing={2}>
                <TextField fullWidth label="No. Penyesuaian" value={adjustmentForm.adjustmentNo} onChange={(event) => setAdjustmentForm((current) => ({ ...current, adjustmentNo: event.target.value }))} />
                <TextField fullWidth label="Waktu Penyesuaian" type="datetime-local" InputLabelProps={{ shrink: true }} value={adjustmentForm.adjustmentTs} onChange={(event) => setAdjustmentForm((current) => ({ ...current, adjustmentTs: event.target.value }))} />
                <TextField fullWidth select label="Jenis Penyesuaian" value={adjustmentForm.adjustmentType} onChange={(event) => setAdjustmentForm((current) => ({ ...current, adjustmentType: event.target.value }))}>
                  {adjustmentTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Alasan" value={adjustmentForm.reason} onChange={(event) => setAdjustmentForm((current) => ({ ...current, reason: event.target.value }))} />
                <TextField fullWidth label="Catatan Umum" multiline minRows={2} value={adjustmentForm.note} onChange={(event) => setAdjustmentForm((current) => ({ ...current, note: event.target.value }))} />
              </Stack>
            </SectionCard>

            <SectionCard title="Ringkasan Penyesuaian" description="Pantau cepat jumlah item dan banyaknya selisih sebelum dokumen disimpan.">
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Baris barang</Typography>
                      <Typography variant="body2" fontWeight={700}>{lineCount}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Selisih terdeteksi</Typography>
                      <Typography variant="body2" fontWeight={700}>{varianceCount}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Selisih minus</Typography>
                      <Typography variant="body2" fontWeight={700}>{negativeVarianceCount}</Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {varianceCount ? <Alert severity="info">Ada {varianceCount} baris dengan selisih stok. Pastikan qty aktual sudah sesuai hasil opname sebelum menyimpan dokumen.</Alert> : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button color="inherit" onClick={resetAdjustmentForm}>Reset Dokumen</Button>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={createAdjustment.isPending}
                    onClick={async () => {
                      if (!adjustmentForm.items.length) {
                        setInlineError("Tambahkan minimal satu barang ke dokumen penyesuaian stok.");
                        return;
                      }

                      const request = {
                        adjustmentNo: adjustmentForm.adjustmentNo?.trim(),
                        adjustmentTs: adjustmentForm.adjustmentTs,
                        adjustmentType: adjustmentForm.adjustmentType,
                        reason: adjustmentForm.reason?.trim(),
                        note: adjustmentForm.note?.trim() || null,
                        items: adjustmentForm.items.filter((item) => item.productId).map((item) => ({
                          productId: toNumberValue(item.productId),
                          actualQty: toNumberValue(item.actualQty),
                          unitCost: toNullableNumberValue(item.unitCost),
                          note: item.note?.trim() || null
                        }))
                      };

                      await createAdjustment.mutateAsync(request);
                      resetAdjustmentForm();
                    }}
                  >
                    {createAdjustment.isPending ? "Menyimpan..." : "Simpan Penyesuaian"}
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
                    <TableCell align="right">Stok Sistem</TableCell>
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
                          <Button size="small" onClick={() => { addProductToAdjustment(product); setProductDialogOpen(false); }}>Tambah</Button>
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
