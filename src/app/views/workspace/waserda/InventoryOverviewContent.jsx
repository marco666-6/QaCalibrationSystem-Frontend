import Grid2 from "@mui/material/Grid2";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MoveDownOutlinedIcon from "@mui/icons-material/MoveDownOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import {
  useProductCategories,
  useProducts,
  usePurchaseReceipts,
  useStockAdjustments,
  useSuppliers
} from "app/hooks/useBusinessModules";
import { formatCurrency, formatDate, formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, ModuleCard, PageFrame, SectionCard } from "../shared/WorkspaceSection";

export default function InventoryOverviewContent() {
  const { data: categories, isError: categoriesError, error: categoriesQueryError } = useProductCategories();
  const { data: suppliers, isError: suppliersError, error: suppliersQueryError } = useSuppliers();
  const { data: products, isError: productsError, error: productsQueryError } = useProducts({ Page: 1, PageSize: 10 });
  const { data: receipts } = usePurchaseReceipts({ Page: 1, PageSize: 5 });
  const { data: adjustments } = useStockAdjustments({ Page: 1, PageSize: 5 });

  const categoryItems = categories ?? [];
  const supplierItems = suppliers ?? [];
  const productItems = products?.items ?? [];
  const lowStockCount = productItems.filter((item) => Number(item.onHandQty || 0) <= Number(item.minStockQty || 0)).length;

  if (categoriesError || suppliersError || productsError) {
    return (
      <PageFrame section="POS Waserda" title="Dashboard Inventori" description="Ringkasan inventori barang Waserda.">
        <Alert severity="error">{categoriesQueryError?.message || suppliersQueryError?.message || productsQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Dashboard Inventori"
      description="Ringkasan inventori Waserda. Kelola master data, stok masuk, dan kontrol stok lewat menu yang terpisah agar alurnya lebih fokus."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<CategoryOutlinedIcon />} title="Kategori" value={categoryItems.length} caption="kelompok produk" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<LocalShippingOutlinedIcon />} title="Supplier" value={supplierItems.length} caption="mitra pengadaan" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<StorefrontOutlinedIcon />} title="Produk" value={products?.totalCount ?? 0} caption="master barang aktif" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<Inventory2OutlinedIcon />} title="Low Stock" value={lowStockCount} caption="butuh restock atau opname" />
        </Grid2>
      </Grid2>

      <SectionCard title="Menu Inventori" description="Setiap area kerja dipisah sesuai tugas operasional supaya lebih mudah dipakai dan dirawat.">
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Master Produk" description="Kelola SKU, kategori produk, harga, dan minimum stok." icon={<StorefrontOutlinedIcon />} to="/waserda/inventori/produk" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Kategori & Supplier" description="Kelola data referensi inventori dan partner pengadaan." icon={<CategoryOutlinedIcon />} to="/waserda/inventori/referensi" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Riwayat Stok Masuk" description="Lihat dokumen penerimaan barang dan lanjutkan ke halaman entry saat perlu input baru." icon={<MoveDownOutlinedIcon />} to="/waserda/inventori/stok-masuk" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Riwayat Penyesuaian Stok" description="Lihat dokumen stock opname, koreksi, dan lanjutkan ke halaman entry saat perlu input baru." icon={<AutoFixHighOutlinedIcon />} to="/waserda/inventori/penyesuaian" />
          </Grid2>
        </Grid2>
      </SectionCard>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <SectionCard title="Stok Masuk Terbaru" description="5 dokumen penerimaan barang terakhir.">
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack spacing={1}>
                {(receipts?.items ?? []).length > 0 ? (
                  receipts.items.map((item) => (
                    <Stack key={item.purchaseReceiptId} direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="body2" fontWeight={700}>{item.receiptNo}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(item.receiptDate)} - {formatCurrency(item.totalAmount)}</Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Belum ada dokumen stok masuk.</Typography>
                )}
              </Stack>
            </Paper>
          </SectionCard>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <SectionCard title="Penyesuaian Terbaru" description="5 catatan kontrol stok terakhir.">
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack spacing={1}>
                {(adjustments?.items ?? []).length > 0 ? (
                  adjustments.items.map((item) => (
                    <Stack key={item.stockAdjustmentId} direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="body2" fontWeight={700}>{item.adjustmentNo}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.adjustmentType} - {formatDateTime(item.adjustmentTs)}</Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Belum ada penyesuaian stok.</Typography>
                )}
              </Stack>
            </Paper>
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageFrame>
  );
}
