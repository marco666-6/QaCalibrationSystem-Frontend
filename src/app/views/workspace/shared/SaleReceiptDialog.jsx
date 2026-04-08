import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { useSaleReceipt } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDateTime } from "./workspaceFormatters";

export default function SaleReceiptDialog({ saleId, open, onClose }) {
  const receipt = useSaleReceipt(saleId, { enabled: open && Boolean(saleId) });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ className: "sale-receipt-dialog" }}>
      <DialogTitle>Struk Penjualan</DialogTitle>
      <DialogContent dividers>
        {receipt.isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Memuat struk penjualan...
          </Typography>
        ) : receipt.data ? (
          <Stack spacing={2.5} id="sale-receipt-print">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {receipt.data.saleNo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Struk: {receipt.data.receiptNo || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kasir: {receipt.data.cashierDisplayName}
                  </Typography>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Waktu: {formatDateTime(receipt.data.saleTs)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipe: {receipt.data.saleType === "cash" ? "Tunai" : "Kredit Anggota"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pelanggan: {receipt.data.memberName || "Umum"}
                  </Typography>
                </Paper>
              </Grid2>
            </Grid2>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="right">Diskon</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(receipt.data.items ?? []).map((item, index) => (
                    <TableRow key={`${item.productId}-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.unitName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.lineDiscountAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.lineTotalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatCurrency(receipt.data.subtotalAmount)}
                  </Typography>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Diskon
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatCurrency(receipt.data.discountAmount)}
                  </Typography>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatCurrency(receipt.data.totalAmount)}
                  </Typography>
                </Paper>
              </Grid2>
            </Grid2>
          </Stack>
        ) : (
          <Alert severity="warning">Struk belum tersedia untuk transaksi ini.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => window.print()} disabled={!receipt.data}>
          Cetak
        </Button>
        <Button onClick={onClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
}
