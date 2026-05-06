import { lazy } from "react";
import { Navigate } from "react-router-dom";
import AuthGuard from "./auth/AuthGuard";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
const CalibrationDashboardPage = Loadable(lazy(() => import("app/views/workspace/calibration/CalibrationDashboardPage")));
const EquipmentManagementPage = Loadable(lazy(() => import("app/views/workspace/calibration/EquipmentManagementPage")));
const MasterDataPage = Loadable(lazy(() => import("app/views/workspace/calibration/MasterDataPage")));
const UsersPage = Loadable(lazy(() => import("app/views/workspace/calibration/UsersPage")));
const ProfilePage = Loadable(lazy(() => import("app/views/account/ProfilePage")));
const ForcePasswordChangePage = Loadable(lazy(() => import("app/views/account/ForcePasswordChangePage")));

const routes = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/dashboard", element: <CalibrationDashboardPage /> },
      { path: "/equipments", element: <EquipmentManagementPage /> },
      { path: "/master-data", element: <MasterDataPage /> },
      { path: "/users", element: <UsersPage /> },
      { path: "/account/profile", element: <ProfilePage /> },
      { path: "/account/change-password", element: <ForcePasswordChangePage /> }
    ]
  },
  ...sessionRoutes
];

export default routes;
