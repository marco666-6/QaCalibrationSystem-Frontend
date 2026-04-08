const navigations = [
  {
    name: "Workspace",
    icon: "space_dashboard",
    children: [
      {
        name: "Ringkasan Aplikasi",
        iconText: "WS",
        path: "/operasional/workspace"
      },
      {
        name: "Dashboard Operasional",
        iconText: "DB",
        path: "/operasional/dashboard"
      }
    ]
  },
  {
    name: "KSP",
    icon: "savings",
    children: [
      {
        name: "Master Anggota",
        iconText: "AG",
        path: "/ksp/anggota"
      },
      {
        name: "Produk Simpanan",
        iconText: "SP",
        path: "/ksp/produk-simpanan"
      },
      {
        name: "Transaksi Simpanan",
        iconText: "TS",
        path: "/ksp/transaksi-simpanan"
      },
      {
        name: "Produk Pinjaman",
        iconText: "PP",
        path: "/ksp/produk-pinjaman"
      },
      {
        name: "Pinjaman dan Cicilan",
        iconText: "PJ",
        path: "/ksp/pinjaman"
      },
      {
        name: "Approval Pinjaman",
        iconText: "AP",
        path: "/ksp/approval-pinjaman"
      },
      {
        name: "Approval Penarikan",
        iconText: "AT",
        path: "/ksp/approval-penarikan"
      }
    ]
  },
  {
    name: "POS Waserda",
    icon: "storefront",
    children: [
      {
        name: "Dashboard Inventori",
        iconText: "IV",
        path: "/waserda/inventori/dashboard"
      },
      {
        name: "Master Produk",
        iconText: "MP",
        path: "/waserda/inventori/produk"
      },
      {
        name: "Kategori & Supplier",
        iconText: "KS",
        path: "/waserda/inventori/referensi"
      },
      {
        name: "Stok Masuk",
        iconText: "SM",
        path: "/waserda/inventori/stok-masuk"
      },
      {
        name: "Penyesuaian Stok",
        iconText: "PS",
        path: "/waserda/inventori/penyesuaian"
      },
      {
        name: "Penjualan",
        iconText: "SL",
        path: "/waserda/penjualan"
      }
    ]
  },
  {
    name: "Laporan",
    icon: "assessment",
    children: [
      {
        name: "Ringkasan Penjualan",
        iconText: "LP",
        path: "/laporan/ringkasan-penjualan"
      },
      {
        name: "Posisi Saldo Anggota",
        iconText: "SA",
        path: "/laporan/posisi-saldo-anggota"
      }
    ]
  },
  {
    name: "Portal Anggota",
    icon: "badge",
    children: [
      {
        name: "Ringkasan Anggota",
        iconText: "PA",
        path: "/portal-anggota/ringkasan"
      },
      {
        name: "Ajukan Pinjaman",
        iconText: "AP",
        path: "/portal-anggota/pengajuan-pinjaman"
      },
      {
        name: "Ajukan Penarikan",
        iconText: "AT",
        path: "/portal-anggota/pengajuan-penarikan"
      }
    ]
  },
  {
    name: "Administrasi",
    icon: "admin_panel_settings",
    children: [
      {
        name: "Pengguna Internal",
        iconText: "UI",
        path: "/administrasi/pengguna-internal"
      }
    ]
  }
];

export default navigations;
