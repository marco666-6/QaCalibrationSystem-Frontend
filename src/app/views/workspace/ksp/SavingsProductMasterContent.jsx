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
import {
  useCreateSavingsProduct,
  useSavingsProducts,
  useUpdateSavingsProduct
} from "app/hooks/useKoperasi";
import { formatCurrency } from "../shared/workspaceFormatters";
import KspPageShell from "./shared/KspPageShell";
import KspSimpleDialog from "./shared/KspSimpleDialog";
import { PERIODICITY_OPTIONS, SAVINGS_KIND_OPTIONS } from "./shared/kspConstants";

export default function SavingsProductMasterContent() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({ open: false, mode: "create", data: null });
  const { data, isLoading, isError, error } = useSavingsProducts({ Page: 1, PageSize: 100, Search: search || undefined });
  const createSavings = useCreateSavingsProduct();
  const updateSavings = useUpdateSavingsProduct(dialog.data?.savingsProductId);

  if (isError) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>;
  const items = data?.items ?? [];

  return (
    <KspPageShell
      eyebrow="Master Data"
      title="Produk Simpanan"
      description="Konfigurasi produk simpanan sesuai kontrak endpoint backend."
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, mode: "create", data: null })}>
          Tambah Produk
        </Button>
      }
    >
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <TextField
          size="small"
          placeholder="Cari produk simpanan"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <Grid2 container spacing={2}>
          {isLoading ? (
            <Grid2 size={12}><Alert severity="info">Memuat produk simpanan...</Alert></Grid2>
          ) : items.map((item) => (
            <Grid2 key={item.savingsProductId} size={{ xs: 12, md: 6, xl: 4 }}>
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
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={item.savingsKind} variant="outlined" />
                      <Chip size="small" label={item.periodicity} variant="outlined" />
                    </Stack>
                    <Typography variant="h6" fontWeight={700}>
                      {item.defaultAmount ? formatCurrency(item.defaultAmount) : "Fleksibel"}
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
        title="Produk Simpanan"
        open={dialog.open}
        mode={dialog.mode}
        initialData={dialog.data || { savingsKind: "pokok", periodicity: "once", isActive: true }}
        isPending={createSavings.isPending || updateSavings.isPending}
        onClose={() => setDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = {
            productCode: payload.productCode?.trim(),
            productName: payload.productName?.trim(),
            savingsKind: payload.savingsKind,
            periodicity: payload.periodicity,
            defaultAmount: payload.defaultAmount === "" ? null : Number(payload.defaultAmount),
            isActive: Boolean(payload.isActive)
          };

          if (dialog.mode === "edit") await updateSavings.mutateAsync(request);
          else await createSavings.mutateAsync(request);

          setDialog({ open: false, mode: "create", data: null });
        }}
        fields={[
          { name: "productCode", label: "Kode Produk", disabledOnEdit: true },
          { name: "productName", label: "Nama Produk" },
          { name: "savingsKind", label: "Jenis Simpanan", type: "select", options: SAVINGS_KIND_OPTIONS },
          { name: "periodicity", label: "Periodisitas", type: "select", options: PERIODICITY_OPTIONS },
          { name: "defaultAmount", label: "Default Amount", type: "number" },
          { name: "isActive", label: "Aktif", type: "switch", defaultValue: true, size: 12 }
        ]}
      />
    </KspPageShell>
  );
}
