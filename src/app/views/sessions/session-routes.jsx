import Loadable from "app/components/Loadable";
import { lazy } from "react";

const NotFound = lazy(() => import("./NotFound"));

const JwtLogin = Loadable(lazy(() => import("./login/JwtLogin")));
const ResetPassword = Loadable(lazy(() => import("./ResetPassword")));
const ForgotPassword = Loadable(lazy(() => import("./ForgotPassword")));

const sessionRoutes = [
  { path: "/session/signin", element: <JwtLogin /> },
  { path: "/session/forgot-password", element: <ForgotPassword /> },
  { path: "/session/reset-password", element: <ResetPassword /> },
  { path: "*", element: <NotFound /> }
];

export default sessionRoutes;
