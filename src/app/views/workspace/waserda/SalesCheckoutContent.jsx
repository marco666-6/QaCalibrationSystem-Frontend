import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha } from "@mui/material/styles";
import { useCreateSale, useProductLookup } from "app/hooks/useBusinessModules";
import { useMemberLookup } from "app/hooks/useKoperasi";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";
import SaleReceiptDialog from "../shared/SaleReceiptDialog";
import { formatCurrency, toDateTimeInputValue, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";

const tableEdgePaddingSx = {
  "& .MuiTableCell-root:first-of-type": { pl: 3 },
  "& .MuiTableCell-root:last-of-type": { pr: 3 }
};

function buildSaleNumber() {
  return `SALE-${Date.now()}`;
}

function buildReceiptNumber() {
  return `RCPT-${Date.now()}`;
}

function createInitialForm() {
  return {
    saleNo: buildSaleNumber(),
    receiptNo: buildReceiptNumber(),
    saleTs: toDateTimeInputValue(),
    saleType: "cash",
    memberId: "",
    discountAmount: 0,
    paidAmount: "",
    note: ""
  };
}

function calculateTotals(items, discountAmount, paidAmount, saleType) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.lineDiscountAmount || 0),
    0
  );
  const total = Math.max(subtotal - Number(discountAmount || 0), 0);
  const paid = Number(paidAmount || 0);
  const change = saleType === "cash" ? Math.max(paid - total, 0) : 0;

  return { subtotal, total, change };
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

const compactSectionSx = {
  p: 2.25,
  borderRadius: 3.5,
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  "& .MuiTypography-h6": {
    fontSize: "1rem"
  }
};

const cartSectionSx = {
  ...compactSectionSx,
  flex: { xs: "unset", lg: 1 },
  height: { xs: "auto", lg: "calc(100vh - 540px)" },
  minHeight: 320
};

export default function SalesCheckoutContent() {
  const scannerInputRef = useRef(null);
  const [form, setForm] = useState(createInitialForm);
  const [cartItems, setCartItems] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [receiptSaleId, setReceiptSaleId] = useState(null);
  const [inlineError, setInlineError] = useState("");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDialogQuery, setMemberDialogQuery] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogQuery, setProductDialogQuery] = useState("");

  const deferredMemberQuery = useDeferredValue(memberQuery.trim());
  const deferredProductQuery = useDeferredValue(productQuery.trim());
  const deferredMemberDialogQuery = useDeferredValue(memberDialogQuery.trim());
  const deferredProductDialogQuery = useDeferredValue(productDialogQuery.trim());
  const createSale = useCreateSale();
  const memberLookup = useMemberLookup(
    { query: deferredMemberQuery, limit: 8 },
    { enabled: deferredMemberQuery.length >= 2 }
  );
  const productLookup = useProductLookup(
    { query: deferredProductQuery, limit: 8 },
    { enabled: deferredProductQuery.length >= 1 }
  );
  const memberDialogLookup = useMemberLookup(
    { query: deferredMemberDialogQuery, limit: 25 },
    { enabled: memberDialogOpen && deferredMemberDialogQuery.length >= 2 }
  );
  const productDialogLookup = useProductLookup(
    { query: deferredProductDialogQuery, limit: 25 },
    { enabled: productDialogOpen && deferredProductDialogQuery.length >= 1 }
  );

  const memberResults = memberLookup.data ?? [];
  const productResults = productLookup.data ?? [];
  const memberDialogResults = memberDialogLookup.data ?? [];
  const productDialogResults = productDialogLookup.data ?? [];
  const { subtotal, total, change } = useMemo(
    () => calculateTotals(cartItems, form.discountAmount, form.paidAmount === "" ? 0 : form.paidAmount, form.saleType),
    [cartItems, form.discountAmount, form.paidAmount, form.saleType]
  );
  const amountDue = Math.max(total - Number(form.saleType === "member_credit" ? form.paidAmount || 0 : 0), 0);
  const lowStockCount = cartItems.filter((item) => Number(item.onHandQty || 0) <= Number(item.quantity || 0)).length;

  useEffect(() => {
    scannerInputRef.current?.focus();
  }, []);

  const addProductToCart = (product) => {
    setCartItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === product.productId);
      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item
        );
      }

      return [
        {
          productId: product.productId,
          sku: product.sku,
          barcode: product.barcode,
          productName: product.productName,
          unitName: product.unitName,
          unitPrice: product.salePrice,
          quantity: 1,
          lineDiscountAmount: 0,
          onHandQty: product.onHandQty,
          minStockQty: product.minStockQty
        },
        ...current
      ];
    });
    setProductQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const updateCartItem = (productId, field, value) => {
    setCartItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, [field]: value } : item))
    );
  };

  const removeCartItem = (productId) => {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
  };

  const chooseMember = (member) => {
    setSelectedMember(member);
    setMemberQuery(member.memberNo);
    setForm((current) => ({ ...current, memberId: String(member.memberId) }));
    setInlineError("");
  };

  const clearMember = () => {
    setSelectedMember(null);
    setMemberQuery("");
    setForm((current) => ({ ...current, memberId: "" }));
    setInlineError("");
  };

  const openMemberDialog = () => {
    setMemberDialogQuery(memberQuery);
    setMemberDialogOpen(true);
    setInlineError("");
  };

  const openProductDialog = () => {
    setProductDialogQuery(productQuery);
    setProductDialogOpen(true);
    setInlineError("");
  };

  const handleChooseMember = async () => {
    const normalized = memberQuery.trim().toLowerCase();
    const initialMatch =
      memberResults.find((item) => item.memberNo?.toLowerCase() === normalized) ||
      memberResults.find((item) => item.employeeCode?.toLowerCase() === normalized) ||
      (memberResults.length === 1 ? memberResults[0] : null);
    if (initialMatch) {
      chooseMember(initialMatch);
      return;
    }

    const response = await memberLookup.refetch();
    const refreshedItems = response.data ?? [];
    const fallbackMatch =
      refreshedItems.find((item) => item.memberNo?.toLowerCase() === normalized) ||
      refreshedItems.find((item) => item.employeeCode?.toLowerCase() === normalized) ||
      (refreshedItems.length === 1 ? refreshedItems[0] : null);

    if (fallbackMatch) {
      chooseMember(fallbackMatch);
      return;
    }

    setInlineError("Anggota belum ditemukan. Masukkan no anggota atau gunakan Cari di Tabel.");
  };

  const handleAddProductFromQuery = async () => {
    const match = findBestProductMatch(productResults, productQuery);
    if (match) {
      addProductToCart(match);
      return;
    }

    const response = await productLookup.refetch();
    const refreshedItems = response.data ?? [];
    const fallbackMatch = findBestProductMatch(refreshedItems, productQuery);
    if (fallbackMatch) {
      addProductToCart(fallbackMatch);
      return;
    }

    setInlineError("Produk belum ditemukan. Scan barcode lagi atau gunakan Cari di Tabel.");
  };

  const resetPos = () => {
    setForm(createInitialForm());
    setCartItems([]);
    setMemberQuery("");
    setSelectedMember(null);
    setProductQuery("");
    setInlineError("");
    setTimeout(() => scannerInputRef.current?.focus(), 0);
  };

  const handleSubmit = async () => {
    if (!cartItems.length) {
      setInlineError("Tambahkan minimal satu barang ke keranjang.");
      return;
    }

    if (form.saleType === "member_credit" && !form.memberId) {
      setInlineError("Penjualan kredit anggota wajib memilih anggota.");
      return;
    }

    const request = {
      saleNo: form.saleNo.trim(),
      receiptNo: form.receiptNo.trim() || null,
      saleTs: form.saleTs,
      memberId: toNullableNumberValue(form.memberId),
      saleType: form.saleType,
      discountAmount: toNumberValue(form.discountAmount),
      paidAmount:
        form.saleType === "member_credit"
          ? toNumberValue(form.paidAmount, 0)
          : form.paidAmount === ""
            ? total
            : toNumberValue(form.paidAmount),
      note: form.note.trim() || null,
      items: cartItems.map((item) => ({
        productId: toNumberValue(item.productId),
        quantity: toNumberValue(item.quantity),
        unitPrice: toNumberValue(item.unitPrice),
        lineDiscountAmount: toNumberValue(item.lineDiscountAmount)
      }))
    };

    const result = await createSale.mutateAsync(request);
    setReceiptSaleId(result?.data?.saleId ?? result?.saleId ?? null);
    resetPos();
  };

  return (
    <PageFrame
      section="POS Waserda"
      title="Kasir POS"
      description="Checkout ringkas untuk kasir dengan fokus ke scan barang, keranjang, dan pembayaran."
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" component={RouterLink} to="/waserda/penjualan" startIcon={<ReceiptLongOutlinedIcon />}>
            Riwayat Penjualan
          </Button>
          <Button size="small" component={RouterLink} to="/waserda/penjualan" variant="outlined" startIcon={<ArrowBackOutlinedIcon />}>
            Kembali
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2} sx={{ minHeight: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3.5,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.96)})`
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip icon={<PointOfSaleOutlinedIcon />} label={form.saleType === "member_credit" ? "Mode Kredit Anggota" : "Mode Tunai"} color="primary" size="small" />
              <Chip label={`${cartItems.length} item`} size="small" variant="outlined" />
              <Chip label={`Total ${formatCurrency(total)}`} size="small" variant="outlined" />
              <Chip label={`Cek stok ${lowStockCount}`} size="small" variant={lowStockCount ? "filled" : "outlined"} color={lowStockCount ? "warning" : "default"} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {form.saleNo} {form.receiptNo ? `| ${form.receiptNo}` : ""}
              </Typography>
              {selectedMember ? <Chip size="small" color="success" label={`Anggota: ${selectedMember.fullName}`} onDelete={clearMember} /> : <Chip size="small" variant="outlined" label="Tanpa anggota" />}
            </Stack>
          </Stack>
        </Paper>

        {inlineError ? <Alert severity="warning">{inlineError}</Alert> : null}

        <Grid2
          container
          spacing={2}
          sx={{
            minHeight: 0,
            height: { xs: "auto", lg: "calc(100vh - 270px)" },
            maxHeight: { xs: "none", lg: "calc(100vh - 270px)" },
            overflow: "hidden"
          }}
        >
          <Grid2 size={{ xs: 12, lg: 8 }} sx={{ minHeight: 0 }}>
            <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
              <SectionCard title="Akses Cepat Kasir" description="Pilih tipe transaksi, cari anggota bila perlu, lalu scan barang." sx={compactSectionSx}>
                <Grid2 container spacing={1.5}>
                  <Grid2 size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.25}>
                      <ToggleButtonGroup
                        size="small"
                        color="primary"
                        exclusive
                        value={form.saleType}
                        onChange={(_, nextValue) => nextValue && setForm((current) => ({ ...current, saleType: nextValue }))}
                      >
                        <ToggleButton value="cash">Tunai</ToggleButton>
                        <ToggleButton value="member_credit">Kredit</ToggleButton>
                      </ToggleButtonGroup>

                      <TextField
                        fullWidth
                        size="small"
                        label="Cari anggota"
                        placeholder="No anggota / nama"
                        value={memberQuery}
                        onChange={(event) => setMemberQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleChooseMember();
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonSearchOutlinedIcon fontSize="small" />
                            </InputAdornment>
                          )
                        }}
                      />

                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => void handleChooseMember()}>
                          Pilih
                        </Button>
                        <Button size="small" variant="outlined" onClick={openMemberDialog}>
                          Tabel
                        </Button>
                      </Stack>

                      {memberQuery.trim().length >= 2 && memberResults.length > 0 ? (
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                          {memberResults.slice(0, 3).map((member) => (
                            <Chip
                              key={member.memberId}
                              size="small"
                              label={member.fullName}
                              onClick={() => chooseMember(member)}
                              color={selectedMember?.memberId === member.memberId ? "primary" : "default"}
                              variant={selectedMember?.memberId === member.memberId ? "filled" : "outlined"}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Grid2>

                  <Grid2 size={{ xs: 12, md: 7 }}>
                    <Stack spacing={1.25}>
                      <TextField
                        fullWidth
                        autoFocus
                        size="small"
                        inputRef={scannerInputRef}
                        label="Scan barcode / SKU / nama produk"
                        placeholder="Scan lalu Enter"
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
                      />

                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => void handleAddProductFromQuery()} startIcon={<AddShoppingCartOutlinedIcon />}>
                          Tambah
                        </Button>
                        <Button size="small" variant="outlined" onClick={openProductDialog}>
                          Cari Produk
                        </Button>
                      </Stack>

                      {productQuery.trim() && productResults.length > 0 ? (
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {productResults.slice(0, 4).map((product) => (
                            <Chip key={product.productId} label={`${product.productName} - ${formatCurrency(product.salePrice)}`} onClick={() => addProductToCart(product)} variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Paper variant="outlined" sx={{ px: 1.5, py: 1.25, borderRadius: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                          <Typography variant="caption" color="text.secondary">
                            Fokus utama ada di kolom scan. Jika barcode atau SKU cocok persis, item langsung masuk ke keranjang.
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </Grid2>
                </Grid2>
              </SectionCard>

              <SectionCard
                title="Keranjang"
                description="Edit qty, harga, dan diskon langsung dari meja kasir."
                actions={
                  <Button size="small" color="inherit" onClick={() => setCartItems([])} disabled={!cartItems.length}>
                    Kosongkan
                  </Button>
                }
                sx={cartSectionSx}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <Box sx={{ flex: 1, minHeight: 240, overflow: "auto" }}>
                    <Table size="small" stickyHeader sx={tableEdgePaddingSx}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Produk</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Harga</TableCell>
                          <TableCell align="right">Diskon</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.length ? (
                          cartItems.map((item) => {
                            const lineTotal =
                              Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.lineDiscountAmount || 0);

                            return (
                              <TableRow key={item.productId} hover>
                                <TableCell sx={{ minWidth: 260 }}>
                                  <Typography variant="body2" fontWeight={700}>
                                    {item.productName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.sku}
                                    {item.barcode ? ` | ${item.barcode}` : ""}
                                    {` | stok ${item.onHandQty} ${item.unitName}`}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ minWidth: 92 }}>
                                  <TextField size="small" type="number" value={item.quantity} onChange={(event) => updateCartItem(item.productId, "quantity", event.target.value)} />
                                </TableCell>
                                <TableCell align="right" sx={{ minWidth: 120 }}>
                                  <TextField size="small" type="number" value={item.unitPrice} onChange={(event) => updateCartItem(item.productId, "unitPrice", event.target.value)} />
                                </TableCell>
                                <TableCell align="right" sx={{ minWidth: 110 }}>
                                  <TextField size="small" type="number" value={item.lineDiscountAmount} onChange={(event) => updateCartItem(item.productId, "lineDiscountAmount", event.target.value)} />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{formatCurrency(lineTotal)}</TableCell>
                                <TableCell align="right">
                                  <IconButton color="error" onClick={() => removeCartItem(item.productId)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                              Belum ada item. Scan barcode atau cari produk untuk mulai transaksi.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </SectionCard>
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 4 }} sx={{ minHeight: 0 }}>
            <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
              <SectionCard title="Ringkasan Pembayaran" description="Semua nilai utama kasir ada di panel kanan." sx={compactSectionSx}>
                <Stack spacing={1.5}>
                  <Grid2 container spacing={1.25}>
                    <Grid2 size={6}>
                      <TextField fullWidth size="small" label="No. Penjualan" value={form.saleNo} onChange={(event) => setForm((current) => ({ ...current, saleNo: event.target.value }))} />
                    </Grid2>
                    <Grid2 size={6}>
                      <TextField fullWidth size="small" label="No. Struk" value={form.receiptNo} onChange={(event) => setForm((current) => ({ ...current, receiptNo: event.target.value }))} />
                    </Grid2>
                  </Grid2>

                  <TextField fullWidth size="small" type="datetime-local" label="Waktu Penjualan" InputLabelProps={{ shrink: true }} value={form.saleTs} onChange={(event) => setForm((current) => ({ ...current, saleTs: event.target.value }))} />
                  <TextField fullWidth size="small" label="Diskon Transaksi" type="number" value={form.discountAmount} onChange={(event) => setForm((current) => ({ ...current, discountAmount: event.target.value }))} />
                  <TextField fullWidth size="small" label={form.saleType === "member_credit" ? "Pembayaran Awal" : "Dibayar"} type="number" value={form.paidAmount} onChange={(event) => setForm((current) => ({ ...current, paidAmount: event.target.value }))} helperText={form.saleType === "member_credit" ? "Boleh 0 jika jadi piutang." : "Kosongkan untuk bayar pas."} />
                  <TextField fullWidth size="small" label="Catatan" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: (theme) => alpha(theme.palette.success.main, 0.05) }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatCurrency(subtotal)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Diskon</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatCurrency(form.discountAmount)}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={800}>Total</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>{formatCurrency(total)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{form.saleType === "member_credit" ? "Sisa piutang" : "Kembalian"}</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatCurrency(form.saleType === "member_credit" ? amountDue : change)}</Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  {lowStockCount ? <Alert severity="info">Ada {lowStockCount} item yang perlu cek stok fisik sebelum final.</Alert> : null}

                  <Button variant="contained" size="large" disabled={createSale.isPending} onClick={handleSubmit}>
                    {createSale.isPending ? "Menyimpan..." : "Selesaikan Penjualan"}
                  </Button>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid2>
        </Grid2>
      </Stack>

      <SaleReceiptDialog saleId={receiptSaleId} open={Boolean(receiptSaleId)} onClose={() => setReceiptSaleId(null)} />

      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Cari Anggota</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              autoFocus
              label="Cari no anggota, nama, NIK karyawan, atau telepon"
              value={memberDialogQuery}
              onChange={(event) => setMemberDialogQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonSearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Table size="small" sx={tableEdgePaddingSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>No. Anggota</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberDialogResults.length > 0 ? (
                    memberDialogResults.map((member) => (
                      <TableRow key={member.memberId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {member.memberNo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.employeeCode || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {member.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.phoneNumber || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>{member.memberStatus}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              chooseMember(member);
                              setMemberDialogOpen(false);
                            }}
                          >
                            Pilih
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        {memberDialogQuery.trim().length < 2 ? "Masukkan minimal 2 karakter untuk mencari anggota." : "Anggota tidak ditemukan."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

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
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productDialogResults.length > 0 ? (
                    productDialogResults.map((product) => (
                      <TableRow key={product.productId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.unitName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{product.barcode || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{product.onHandQty}</TableCell>
                        <TableCell align="right">{formatCurrency(product.salePrice)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              addProductToCart(product);
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
