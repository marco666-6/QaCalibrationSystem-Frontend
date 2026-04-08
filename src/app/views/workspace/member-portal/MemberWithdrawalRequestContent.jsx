import { useMemo, useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Alert, Button, Chip, TablePagination } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import useAuth from "app/hooks/useAuth";
import { useCreateMemberPortalWithdrawalRequest, useMemberPortalSavings, useMemberPortalSavingsProducts, useMemberPortalWithdrawalRequests } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDateTime, toNumberValue } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";

const tableEdgePaddingSx = { "& .MuiTableCell-root:first-of-type": { pl: 3 }, "& .MuiTableCell-root:last-of-type": { pr: 3 } };

export default function MemberWithdrawalRequestContent() {
  const { user } = useAuth();
  const isMember = user?.roles?.includes("member") || user?.role === "member";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const createWithdrawalRequest = useCreateMemberPortalWithdrawalRequest();
  const savings = useMemberPortalSavings({ enabled: isMember });
  const savingsProducts = useMemberPortalSavingsProducts({ enabled: isMember });
  const withdrawalRequests = useMemberPortalWithdrawalRequests({ Page: page + 1, PageSize: 8 }, { enabled: isMember });
  const savingsOptions = useMemo(() => {
    const items = savings.data?.length ? savings.data : savingsProducts.data ?? [];
    return items.map((item) => ({
      value: item.savingsProductId,
      label: item.balanceAmount != null ? `${item.productName} - ${formatCurrency(item.balanceAmount)}` : `${item.productCode} - ${item.productName}`
    }));
  }, [savings.data, savingsProducts.data]);

  return (
    <PageFrame
      section="Portal Anggota"
      title="Ajukan Penarikan Simpanan"
      description="Buat permintaan penarikan simpanan baru dan lihat status reviewnya di halaman yang sama."
      action={<Button variant="contained" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => setDialogOpen(true)}>Form Penarikan</Button>}
    >
      {!isMember ? (
        <Alert severity="info">Halaman ini hanya untuk role `member`.</Alert>
      ) : (
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12 }}>
            <SectionCard title="Panduan Penarikan" description="Menu ini dipakai untuk input permintaan baru sekaligus memantau status penarikan simpanan.">
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Pilih produk simpanan, isi nominal penarikan, lalu cek hasil review petugas pada tabel di bawah.
              </Alert>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <SectionCard title="Status Permintaan Penarikan" description="Riwayat permintaan penarikan simpanan anggota.">
              <SimpleTable
                tableSx={tableEdgePaddingSx}
                columns={[
                  { key: "requestNo", label: "No. Request", render: (row) => row.requestNo || `WD-${row.savingsWithdrawalRequestId || row.withdrawalRequestId || row.id}` },
                  { key: "savingsProductName", label: "Produk", render: (row) => row.savingsProductName || "-" },
                  { key: "requestedAt", label: "Diajukan", render: (row) => formatDateTime(row.requestedAt || row.createdAt) },
                  { key: "amount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.amount) },
                  { key: "status", label: "Status", render: (row) => <Chip size="small" label={row.status || "pending"} color={row.status === "approved" ? "success" : row.status === "rejected" ? "error" : "warning"} /> },
                  { key: "reviewerNote", label: "Catatan", render: (row) => row.reviewerNote || row.note || "-" }
                ]}
                rows={withdrawalRequests.data?.items ?? []}
                emptyText="Belum ada permintaan penarikan."
              />
              <TablePagination component="div" count={withdrawalRequests.data?.totalCount ?? 0} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
            </SectionCard>
          </Grid2>
        </Grid2>
      )}

      <WorkspaceFormDialog
        title="Permintaan Penarikan"
        open={dialogOpen && isMember}
        mode="create"
        initialData={{ savingsProductId: savingsOptions[0]?.value ?? "", requestedAmount: "", note: "" }}
        isPending={createWithdrawalRequest.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          await createWithdrawalRequest.mutateAsync({
            savingsProductId: toNumberValue(payload.savingsProductId),
            amount: toNumberValue(payload.requestedAmount),
            note: payload.note?.trim() || null
          });
          setDialogOpen(false);
        }}
        fields={[
          { name: "savingsProductId", label: "Produk Simpanan", type: "select", options: savingsOptions },
          { name: "requestedAmount", label: "Nominal Penarikan", type: "number" },
          { name: "note", label: "Catatan", multiline: true, size: 12 }
        ]}
      />
    </PageFrame>
  );
}
