import Grid2 from "@mui/material/Grid2";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SupervisedUserCircleOutlinedIcon from "@mui/icons-material/SupervisedUserCircleOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useMembers } from "app/hooks/useKoperasi";
import { useLoans, useProducts, useSales } from "app/hooks/useBusinessModules";
import {
  MetricCard,
  ModuleCard,
  PageFrame,
  SectionCard
} from "../shared/WorkspaceSection";

export default function OperationsOverviewContent() {
  const { data: members } = useMembers({ Page: 1, PageSize: 5 });
  const { data: products } = useProducts({ Page: 1, PageSize: 5 });
  const { data: sales } = useSales({ Page: 1, PageSize: 5 });
  const { data: loans } = useLoans({ Page: 1, PageSize: 5 });

  return (
    <PageFrame
      section="Operasional"
      title="Workspace Koperasi"
      description="Susunan aplikasi ini sekarang mengikuti domain bisnis pada dokumen spesifikasi: KSP, POS Waserda, Portal Anggota, Laporan, dan Administrasi."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<BadgeOutlinedIcon />} title="Anggota" value={members?.totalCount ?? 0} caption="basis identitas koperasi" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<Inventory2OutlinedIcon />} title="Produk Barang" value={products?.totalCount ?? 0} caption="inventori waserda" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<PointOfSaleOutlinedIcon />} title="Penjualan" value={sales?.totalCount ?? 0} caption="transaksi penjualan" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard icon={<AccountBalanceWalletOutlinedIcon />} title="Pinjaman" value={loans?.totalCount ?? 0} caption="kontrak pinjaman anggota" />
        </Grid2>
      </Grid2>

      <SectionCard title="Peta Modul" description="Menu sudah disusun berdasarkan domain bisnis agar lebih dekat ke bahasa operasional koperasi.">
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Dashboard Operasional" description="Ringkasan KPI koperasi, posisi simpanan, pinjaman, dan stok minimum." icon={<AssessmentOutlinedIcon />} to="/operasional/dashboard" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="KSP" description="Master anggota, produk simpanan, transaksi simpanan, produk pinjaman, dan pinjaman." icon={<SavingsOutlinedIcon />} to="/ksp/anggota" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="POS Waserda" description="Master inventory, stok masuk, stock adjustment, dan penjualan." icon={<StorefrontOutlinedIcon />} to="/waserda/inventori/dashboard" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Portal Anggota" description="Self-service anggota untuk melihat profil, simpanan, pinjaman, transaksi, dan belanja." icon={<SupervisedUserCircleOutlinedIcon />} to="/portal-anggota/ringkasan" chip="WAJIB" />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
            <ModuleCard title="Laporan" description="Ringkasan penjualan dan posisi saldo anggota untuk kebutuhan manager." icon={<DescriptionOutlinedIcon />} to="/laporan/ringkasan-penjualan" />
          </Grid2>
        </Grid2>
      </SectionCard>
    </PageFrame>
  );
}
