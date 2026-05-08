import { useRoutes } from "react-router-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import { MatxTheme } from "./components";
import SettingsProvider from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/JWTAuthContext";
import routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const content = useRoutes(routes);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <MatxTheme>
            <CssBaseline />
            {content}
            <ToastContainer newestOnTop limit={3} />
          </MatxTheme>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
