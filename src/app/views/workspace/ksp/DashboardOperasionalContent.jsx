import { Alert, Box, Card, CardContent, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useDashboard, useLowStockProducts } from "app/hooks/useKoperasi";
import { formatCurrency } from "../shared/workspaceFormatters";
import KspPageShell from "./shared/KspPageShell";

function Stats({ dashboard }) {
  const cards = [
    { title: "Total Anggota", value: dashboard?.totalMembers ?? 0, caption: `${dashboard?.activeMembers ?? 0} aktif`, icon: <GroupOutlinedIcon />, color: "#0d6efd" },
    { title: "Saldo Simpanan", value: formatCurrency(dashboard?.totalSavingsBalance), caption: "akumulasi anggota", icon: <SavingsOutlinedIcon />, color: "#198754" },
    { title: "Outstanding Pinjaman", value: formatCurrency(dashboard?.outstandingLoanAmount), caption: `${dashboard?.activeLoanCount ?? 0} pinjaman aktif`, icon: <ReceiptLongOutlinedIcon />, color: "#fd7e14" },
    { title: "Low Stock", value: dashboard?.lowStockProductCount ?? 0, caption: "butuh tindak lanjut", icon: <Inventory2OutlinedIcon />, color: "#dc3545" }
  ];

  return (
    <Grid2 container spacing={2.5}>
      {cards.map((card) => (
        <Grid2 key={card.title} size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{card.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{card.caption}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: `${card.color}18`, color: card.color, display: "grid", placeItems: "center" }}>
                  {card.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
}

export default function DashboardOperasionalContent() {
  const { data: dashboard, isError, error } = useDashboard();
  const { data: lowStock } = useLowStockProducts({ Page: 1, PageSize: 5, OnlyBelowMinimum: true });

  if (isError) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>;

  return (
    <KspPageShell
      eyebrow="KSP + POS Waserda"
      title="Dashboard Operasional"
      description="Ringkasan KPI utama dari backend `Starter.WebApi` untuk membantu monitoring harian."
    >
      <Stack spacing={3}>
        <Stats dashboard={dashboard} />
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800}>Produk Low Stock</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2.5 }}>
            Endpoint laporan stok minimum sudah dikonsumsi dan ditampilkan dalam daftar prioritas.
          </Typography>
          <Stack spacing={1.5}>
            {(lowStock?.items ?? []).length > 0 ? (
              (lowStock?.items ?? []).map((item) => (
                <Paper key={item.productId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{item.productName}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.sku} • {item.unitName}</Typography>
                    </Box>
                    <Chip label={`${item.onHandQty} / min ${item.minStockQty}`} color={item.isBelowMinimum ? "error" : "default"} size="small" />
                  </Stack>
                </Paper>
              ))
            ) : (
              <Alert severity="success">Tidak ada produk low stock saat ini.</Alert>
            )}
          </Stack>
        </Paper>
      </Stack>
    </KspPageShell>
  );
}
