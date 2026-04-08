import { useState } from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Alert, Button, Chip, TablePagination } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import useAuth from "app/hooks/useAuth";
import { useCreateMemberPortalLoanRequest, useMemberPortalLoanProducts, useMemberPortalLoanRequests } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDateTime, toNullableNumberValue, toNumberValue } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";
import WorkspaceFormDialog from "../shared/WorkspaceFormDialog";

const tableEdgePaddingSx = { "& .MuiTableCell-root:first-of-type": { pl: 3 }, "& .MuiTableCell-root:last-of-type": { pr: 3 } };

export default function MemberLoanRequestContent() {
  const { user } = useAuth();
  const isMember = user?.roles?.includes("member") || user?.role === "member";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const createLoanRequest = useCreateMemberPortalLoanRequest();
  const { data: loanProducts } = useMemberPortalLoanProducts({ enabled: isMember });
  const loanRequests = useMemberPortalLoanRequests({ Page: page + 1, PageSize: 8 }, { enabled: isMember });
  const loanProductOptions = loanProducts ?? [];

  return (
    <PageFrame
      section="Portal Anggota"
      title="Ajukan Pinjaman"
      description="Buat pengajuan pinjaman baru dan lihat status review pengajuan Anda di halaman yang sama."
      action={<Button variant="contained" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => setDialogOpen(true)}>Form Pengajuan</Button>}
    >
      {!isMember ? (
        <Alert severity="info">Halaman ini hanya untuk role `member`.</Alert>
      ) : (
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12 }}>
            <SectionCard title="Panduan Pengajuan" description="Menu ini dipakai untuk input pengajuan baru sekaligus memantau status pengajuan pinjaman.">
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Pilih produk pinjaman dari katalog anggota, isi nominal dan tenor, lalu cek hasil review petugas pada tabel di bawah.
              </Alert>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <SectionCard title="Status Pengajuan Pinjaman" description="Riwayat pengajuan pinjaman anggota.">
              <SimpleTable
                tableSx={tableEdgePaddingSx}
                columns={[
                  { key: "requestNo", label: "No. Request", render: (row) => row.requestNo || `LN-${row.memberLoanRequestId || row.loanRequestId || row.id}` },
                  { key: "loanProductName", label: "Produk", render: (row) => row.loanProductName || "-" },
                  { key: "requestedAt", label: "Diajukan", render: (row) => formatDateTime(row.requestedAt || row.createdAt) },
                  { key: "principalAmount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.principalAmount) },
                  { key: "proposedTermMonths", label: "Tenor", render: (row) => `${row.proposedTermMonths || 0} bulan` },
                  { key: "status", label: "Status", render: (row) => <Chip size="small" label={row.status || "pending"} color={row.status === "approved" ? "success" : row.status === "rejected" ? "error" : "warning"} /> },
                  { key: "reviewerNote", label: "Catatan", render: (row) => row.reviewerNote || row.note || "-" }
                ]}
                rows={loanRequests.data?.items ?? []}
                emptyText="Belum ada pengajuan pinjaman."
              />
              <TablePagination component="div" count={loanRequests.data?.totalCount ?? 0} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
            </SectionCard>
          </Grid2>
        </Grid2>
      )}

      <WorkspaceFormDialog
        title="Pengajuan Pinjaman"
        open={dialogOpen && isMember}
        mode="create"
        initialData={{ loanProductId: loanProductOptions[0]?.loanProductId ?? "", requestedAmount: "", requestedTermMonths: "", note: "" }}
        isPending={createLoanRequest.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          await createLoanRequest.mutateAsync({
            loanProductId: toNumberValue(payload.loanProductId),
            principalAmount: toNumberValue(payload.requestedAmount),
            proposedTermMonths: toNullableNumberValue(payload.requestedTermMonths),
            note: payload.note?.trim() || null
          });
          setDialogOpen(false);
        }}
        fields={[
          { name: "loanProductId", label: "Produk Pinjaman", type: "select", options: loanProductOptions.map((item) => ({ value: item.loanProductId, label: `${item.productCode} - ${item.productName}` })) },
          { name: "requestedAmount", label: "Nominal Pengajuan", type: "number" },
          { name: "requestedTermMonths", label: "Tenor (bulan)", type: "number" },
          { name: "note", label: "Catatan Tambahan", multiline: true, size: 12 }
        ]}
      />
    </PageFrame>
  );
}
