import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useCreateLoanProduct, useLoanProducts, useUpdateLoanProduct } from "app/hooks/useKoperasi";
import { formatCurrency } from "../shared/workspaceFormatters";
import KspPageShell from "./shared/KspPageShell";
import KspSimpleDialog from "./shared/KspSimpleDialog";

export default function LoanProductMasterContent() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const { data, isLoading, isError, error } = useLoanProducts({ Page: 1, PageSize: 100, Search: search || undefined });
  const createLoan = useCreateLoanProduct();
  const updateLoan = useUpdateLoanProduct(dialog.data?.loanProductId);

  if (isError) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>;
  const items = data?.items ?? [];

  return (
    <KspPageShell
      eyebrow="Master Data"
      title="Produk Pinjaman"
      description="Parameter pinjaman utama untuk tenor, bunga, plafon, biaya admin, dan denda."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: "create", data: null })}>
          Tambah Produk
        </Button>
      }
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <TextField
          size="small"
          placeholder="Cari produk pinjaman"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <Grid2 container spacing={2}>
          {isLoading ? (
            <Grid2 size={12}><Alert severity="info">Memuat produk pinjaman...</Alert></Grid2>
          ) : items.map((item) => (
            <Grid2 key={item.loanProductId} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{item.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.productCode}</Typography>
                      </Box>
                      <Chip label={item.isActive ? "Aktif" : "Nonaktif"} size="small" color={item.isActive ? "success" : "default"} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Bunga {item.defaultFlatInterestRatePct}% • tenor {item.defaultTermMonths} bulan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plafon {formatCurrency(item.minPrincipalAmount)} - {formatCurrency(item.maxPrincipalAmount)}
                    </Typography>
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ open: true, mode: "edit", data: item })}>
                      Edit
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Paper>

      <KspSimpleDialog
        title="Produk Pinjaman"
        open={dialog.open}
        mode={dialog.mode}
        initialData={dialog.data || { isActive: true }}
        isPending={createLoan.isPending || updateLoan.isPending}
        onClose={() => setDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = {
            productCode: payload.productCode?.trim(),
            productName: payload.productName?.trim(),
            defaultFlatInterestRatePct: Number(payload.defaultFlatInterestRatePct || 0),
            defaultTermMonths: Number(payload.defaultTermMonths || 0),
            minPrincipalAmount: payload.minPrincipalAmount === "" ? null : Number(payload.minPrincipalAmount),
            maxPrincipalAmount: payload.maxPrincipalAmount === "" ? null : Number(payload.maxPrincipalAmount),
            defaultAdminFeeAmount: Number(payload.defaultAdminFeeAmount || 0),
            defaultPenaltyAmount: Number(payload.defaultPenaltyAmount || 0),
            isActive: Boolean(payload.isActive)
          };

          if (dialog.mode === "edit") await updateLoan.mutateAsync(request);
          else await createLoan.mutateAsync(request);

          setDialog({ open: false, mode: "create", data: null });
        }}
        fields={[
          { name: "productCode", label: "Kode Produk", disabledOnEdit: true },
          { name: "productName", label: "Nama Produk" },
          { name: "defaultFlatInterestRatePct", label: "Bunga Flat Default (%)", type: "number" },
          { name: "defaultTermMonths", label: "Tenor Default (bulan)", type: "number" },
          { name: "minPrincipalAmount", label: "Plafon Minimum", type: "number" },
          { name: "maxPrincipalAmount", label: "Plafon Maksimum", type: "number" },
          { name: "defaultAdminFeeAmount", label: "Biaya Admin Default", type: "number" },
          { name: "defaultPenaltyAmount", label: "Denda Default", type: "number" },
          { name: "isActive", label: "Aktif", type: "switch", defaultValue: true, size: 12 }
        ]}
      />
    </KspPageShell>
  );
}
