import { useState } from "react";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import {
  useCreateProductCategory,
  useCreateSupplier,
  useProductCategories,
  useSuppliers,
  useUpdateProductCategory,
  useUpdateSupplier
} from "app/hooks/useBusinessModules";
import { PageFrame, SectionCard } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";

export default function InventoryReferencesContent() {
  const [categoryDialog, setCategoryDialog] = useState({ open: false, mode: "create", data: null });
  const [supplierDialog, setSupplierDialog] = useState({ open: false, mode: "create", data: null });

  const { data: categories, isError: categoriesError, error: categoriesQueryError } = useProductCategories();
  const { data: suppliers, isError: suppliersError, error: suppliersQueryError } = useSuppliers();
  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory(categoryDialog.data?.productCategoryId);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier(supplierDialog.data?.supplierId);

  const categoryItems = categories ?? [];
  const supplierItems = suppliers ?? [];

  if (categoriesError || suppliersError) {
    return (
      <PageFrame section="POS Waserda" title="Kategori & Supplier" description="Kelola referensi inventori.">
        <Alert severity="error">{categoriesQueryError?.message || suppliersQueryError?.message}</Alert>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      section="POS Waserda"
      title="Kategori & Supplier"
      description="Pisahkan data referensi dari transaksi harian supaya maintenance inventori lebih rapi dan cepat dicari."
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, xl: 5 }}>
          <SectionCard title="Kategori Produk" description="Klasifikasi produk untuk inventori dan POS." actions={<Button size="small" startIcon={<AddIcon />} onClick={() => setCategoryDialog({ open: true, mode: "create", data: null })}>Tambah</Button>}>
            <Stack spacing={1.25}>
              {categoryItems.map((item) => (
                <Paper key={item.productCategoryId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{item.categoryName}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.categoryCode}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={item.isActive ? "Aktif" : "Nonaktif"} color={item.isActive ? "success" : "default"} />
                      <IconButton size="small" onClick={() => setCategoryDialog({ open: true, mode: "edit", data: item })}><EditOutlinedIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid2>
        <Grid2 size={{ xs: 12, xl: 7 }}>
          <SectionCard title="Supplier" description="Partner pengadaan untuk dokumen stok masuk." actions={<Button size="small" startIcon={<AddBusinessOutlinedIcon />} onClick={() => setSupplierDialog({ open: true, mode: "create", data: null })}>Tambah</Button>}>
            <Stack spacing={1.25}>
              {supplierItems.map((item) => (
                <Paper key={item.supplierId} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{item.supplierName}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.supplierCode} - {item.contactName || "tanpa PIC"}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={item.isActive ? "Aktif" : "Nonaktif"} color={item.isActive ? "success" : "default"} />
                      <IconButton size="small" onClick={() => setSupplierDialog({ open: true, mode: "edit", data: item })}><EditOutlinedIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid2>
      </Grid2>

      <WorkspaceFormDialog
        title="Kategori Produk"
        open={categoryDialog.open}
        mode={categoryDialog.mode}
        initialData={categoryDialog.data || { isActive: true }}
        isPending={createCategory.isPending || updateCategory.isPending}
        onClose={() => setCategoryDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = { categoryCode: payload.categoryCode?.trim(), categoryName: payload.categoryName?.trim(), isActive: Boolean(payload.isActive) };
          if (categoryDialog.mode === "edit") await updateCategory.mutateAsync(request);
          else await createCategory.mutateAsync(request);
          setCategoryDialog({ open: false, mode: "create", data: null });
        }}
        fields={[{ name: "categoryCode", label: "Kode Kategori", disabledOnEdit: true }, { name: "categoryName", label: "Nama Kategori" }, { name: "isActive", label: "Aktif", type: "switch", defaultValue: true, size: 12 }]}
      />

      <WorkspaceFormDialog
        title="Supplier"
        open={supplierDialog.open}
        mode={supplierDialog.mode}
        initialData={supplierDialog.data || { isActive: true }}
        isPending={createSupplier.isPending || updateSupplier.isPending}
        onClose={() => setSupplierDialog({ open: false, mode: "create", data: null })}
        onSubmit={async (payload) => {
          const request = { supplierCode: payload.supplierCode?.trim(), supplierName: payload.supplierName?.trim(), contactName: payload.contactName?.trim() || null, phoneNumber: payload.phoneNumber?.trim() || null, email: payload.email?.trim() || null, addressLine: payload.addressLine?.trim() || null, isActive: Boolean(payload.isActive) };
          if (supplierDialog.mode === "edit") await updateSupplier.mutateAsync(request);
          else await createSupplier.mutateAsync(request);
          setSupplierDialog({ open: false, mode: "create", data: null });
        }}
        fields={[{ name: "supplierCode", label: "Kode Supplier", disabledOnEdit: true }, { name: "supplierName", label: "Nama Supplier" }, { name: "contactName", label: "PIC" }, { name: "phoneNumber", label: "Telepon" }, { name: "email", label: "Email" }, { name: "addressLine", label: "Alamat", multiline: true, size: 12 }, { name: "isActive", label: "Aktif", type: "switch", defaultValue: true, size: 12 }]}
      />
    </PageFrame>
  );
}
