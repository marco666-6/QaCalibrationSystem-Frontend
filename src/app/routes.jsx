import { lazy } from "react";
import { Navigate } from "react-router-dom";
import AuthGuard from "./auth/AuthGuard";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";

const OperationsOverviewPage = Loadable(lazy(() => import("app/views/workspace/overview/OperationsOverviewPage")));
const OperationalDashboardPage = Loadable(lazy(() => import("app/views/workspace/overview/OperationalDashboardPage")));
const MemberRegistryPage = Loadable(lazy(() => import("app/views/workspace/ksp/MemberRegistryPage")));
const SavingsProductsCatalogPage = Loadable(lazy(() => import("app/views/workspace/ksp/SavingsProductsCatalogPage")));
const SavingsTransactionsPage = Loadable(lazy(() => import("app/views/workspace/ksp/SavingsTransactionsPage")));
const LoanProductsCatalogPage = Loadable(lazy(() => import("app/views/workspace/ksp/LoanProductsCatalogPage")));
const LoansManagementPage = Loadable(lazy(() => import("app/views/workspace/ksp/LoansManagementPage")));
const LoanRequestsApprovalPage = Loadable(lazy(() => import("app/views/workspace/ksp/LoanRequestsApprovalPage")));
const WithdrawalRequestsApprovalPage = Loadable(lazy(() => import("app/views/workspace/ksp/WithdrawalRequestsApprovalPage")));
const InventoryOverviewPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryOverviewPage")));
const InventoryProductsPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryProductsPage")));
const InventoryReferencesPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryReferencesPage")));
const InventoryStockReceiptsPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryStockReceiptsPage")));
const InventoryStockReceiptsEntryPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryStockReceiptsEntryPage")));
const InventoryStockControlPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryStockControlPage")));
const InventoryStockControlEntryPage = Loadable(lazy(() => import("app/views/workspace/waserda/InventoryStockControlEntryPage")));
const SalesOverviewPage = Loadable(lazy(() => import("app/views/workspace/waserda/SalesOverviewPage")));
const SalesCheckoutPage = Loadable(lazy(() => import("app/views/workspace/waserda/SalesCheckoutPage")));
const SalesSummaryPage = Loadable(lazy(() => import("app/views/workspace/reports/SalesSummaryPage")));
const MemberBalancesPage = Loadable(lazy(() => import("app/views/workspace/reports/MemberBalancesPage")));
const MemberPortalPage = Loadable(lazy(() => import("app/views/workspace/member-portal/MemberPortalPage")));
const MemberLoanRequestPage = Loadable(lazy(() => import("app/views/workspace/member-portal/MemberLoanRequestPage")));
const MemberWithdrawalRequestPage = Loadable(lazy(() => import("app/views/workspace/member-portal/MemberWithdrawalRequestPage")));
const InternalUsersPage = Loadable(lazy(() => import("app/views/workspace/administration/InternalUsersPage")));

const routes = [
  { path: "/", element: <Navigate to="/operasional/workspace" replace /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,
      { path: "/operasional/workspace", element: <OperationsOverviewPage /> },
      { path: "/operasional/dashboard", element: <OperationalDashboardPage /> },
      { path: "/ksp/anggota", element: <MemberRegistryPage /> },
      { path: "/ksp/produk-simpanan", element: <SavingsProductsCatalogPage /> },
      { path: "/ksp/transaksi-simpanan", element: <SavingsTransactionsPage /> },
      { path: "/ksp/produk-pinjaman", element: <LoanProductsCatalogPage /> },
      { path: "/ksp/pinjaman", element: <LoansManagementPage /> },
      { path: "/ksp/approval-pinjaman", element: <LoanRequestsApprovalPage /> },
      { path: "/ksp/approval-penarikan", element: <WithdrawalRequestsApprovalPage /> },
      { path: "/waserda/inventori/dashboard", element: <InventoryOverviewPage /> },
      { path: "/waserda/inventori/produk", element: <InventoryProductsPage /> },
      { path: "/waserda/inventori/referensi", element: <InventoryReferencesPage /> },
      { path: "/waserda/inventori/stok-masuk", element: <InventoryStockReceiptsPage /> },
      { path: "/waserda/inventori/stok-masuk/entry", element: <InventoryStockReceiptsEntryPage /> },
      { path: "/waserda/inventori/penyesuaian", element: <InventoryStockControlPage /> },
      { path: "/waserda/inventori/penyesuaian/entry", element: <InventoryStockControlEntryPage /> },
      { path: "/waserda/penjualan", element: <SalesOverviewPage /> },
      { path: "/waserda/penjualan/kasir", element: <SalesCheckoutPage /> },
      { path: "/laporan/ringkasan-penjualan", element: <SalesSummaryPage /> },
      { path: "/laporan/posisi-saldo-anggota", element: <MemberBalancesPage /> },
      { path: "/portal-anggota/ringkasan", element: <MemberPortalPage /> },
      { path: "/portal-anggota/pengajuan-pinjaman", element: <MemberLoanRequestPage /> },
      { path: "/portal-anggota/pengajuan-penarikan", element: <MemberWithdrawalRequestPage /> },
      { path: "/administrasi/pengguna-internal", element: <InternalUsersPage /> }
    ]
  },
  ...sessionRoutes
];

export default routes;
