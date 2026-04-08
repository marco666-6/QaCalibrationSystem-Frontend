import { Chip, TablePagination } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import useAuth from "app/hooks/useAuth";
import { useMemberPortalLoanRequests, useMemberPortalWithdrawalRequests } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDateTime } from "../shared/workspaceFormatters";
import { PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";
import { useState } from "react";

const requestColor = (status) => (status === "approved" ? "success" : status === "rejected" ? "error" : "warning");
const requestDate = (row) => formatDateTime(row.requestedAt || row.requestDate || row.createdAt);

export default function MemberRequestStatusContent() {
  const { user } = useAuth();
  const isMember = user?.roles?.includes("member") || user?.role === "member";
  const [loanPage, setLoanPage] = useState(0);
  const [withdrawalPage, setWithdrawalPage] = useState(0);
  const loanRequests = useMemberPortalLoanRequests({ Page: loanPage + 1, PageSize: 8 }, { enabled: isMember });
  const withdrawalRequests = useMemberPortalWithdrawalRequests({ Page: withdrawalPage + 1, PageSize: 8 }, { enabled: isMember });

  return (
    <PageFrame
      section="Portal Anggota"
      title="Status Pengajuan"
      description="Pantau semua pengajuan pinjaman dan penarikan simpanan beserta hasil review petugas."
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12 }}>
          <SectionCard title="Status Pengajuan Pinjaman" description="Riwayat pengajuan pinjaman anggota.">
            <SimpleTable
              columns={[
                { key: "requestNo", label: "No. Request", render: (row) => row.requestNo || `LN-${row.loanRequestId || row.id}` },
                { key: "productName", label: "Produk" },
                { key: "requestedAt", label: "Diajukan", render: requestDate },
                { key: "requestedAmount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.requestedAmount || row.principalAmount) },
                { key: "requestedTermMonths", label: "Tenor", render: (row) => `${row.requestedTermMonths || row.termMonths || 0} bulan` },
                { key: "status", label: "Status", render: (row) => <Chip size="small" label={row.status || "pending"} color={requestColor(row.status)} /> },
                { key: "reviewNote", label: "Catatan", render: (row) => row.reviewNote || row.note || "-" }
              ]}
              rows={loanRequests.data?.items ?? []}
              emptyText="Belum ada pengajuan pinjaman."
            />
            <TablePagination component="div" count={loanRequests.data?.totalCount ?? 0} page={loanPage} onPageChange={(_, nextPage) => setLoanPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
          </SectionCard>
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <SectionCard title="Status Permintaan Penarikan" description="Riwayat permintaan penarikan simpanan anggota.">
            <SimpleTable
              columns={[
                { key: "requestNo", label: "No. Request", render: (row) => row.requestNo || `WD-${row.withdrawalRequestId || row.id}` },
                { key: "productName", label: "Produk" },
                { key: "requestedAt", label: "Diajukan", render: requestDate },
                { key: "requestedAmount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.requestedAmount || row.amount) },
                { key: "status", label: "Status", render: (row) => <Chip size="small" label={row.status || "pending"} color={requestColor(row.status)} /> },
                { key: "reviewNote", label: "Catatan", render: (row) => row.reviewNote || row.note || "-" }
              ]}
              rows={withdrawalRequests.data?.items ?? []}
              emptyText="Belum ada permintaan penarikan."
            />
            <TablePagination component="div" count={withdrawalRequests.data?.totalCount ?? 0} page={withdrawalPage} onPageChange={(_, nextPage) => setWithdrawalPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageFrame>
  );
}
