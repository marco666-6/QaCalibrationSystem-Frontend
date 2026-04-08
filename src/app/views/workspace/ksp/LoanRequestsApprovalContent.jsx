import { useMemo, useState } from "react";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { useApproveLoanRequest, useLoanRequests, useRejectLoanRequest } from "app/hooks/useBusinessModules";
import { useMembers } from "app/hooks/useKoperasi";
import { formatCurrency, formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, SectionCard } from "../shared/WorkspaceSection";
import KspPageShell from "./shared/KspPageShell";

const REVIEWABLE_STATUSES = ["pending", "submitted", "review"];
const tableCellSx = { px: 2.5, py: 1.75 };

function buildLoanNumber(requestId) {
  return `LOAN-${requestId}-${Date.now()}`;
}

export default function LoanRequestsApprovalContent() {
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const filters = {
    Page: page + 1,
    PageSize: 10,
    MemberId: memberId || undefined,
    Status: status || undefined
  };

  const { data: loanRequests, isLoading, isError, error } = useLoanRequests(filters);
  const { data: members } = useMembers({ Page: 1, PageSize: 100 });
  const approveLoanRequest = useApproveLoanRequest();
  const rejectLoanRequest = useRejectLoanRequest();

  const memberOptions = useMemo(() => members?.items ?? [], [members?.items]);
  const requestItems = loanRequests?.items ?? [];
  const reviewableCount = requestItems.filter((item) => REVIEWABLE_STATUSES.includes(item.status)).length;
  const approvedCount = requestItems.filter((item) => item.status === "approved").length;
  const totalRequestedAmount = requestItems.reduce((sum, item) => sum + Number(item.requestedAmount || item.principalAmount || 0), 0);

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error?.message}</Alert>
      </Box>
    );
  }

  return (
    <KspPageShell
      eyebrow="Persetujuan KSP"
      title="Request Pinjaman Anggota"
      description="Halaman khusus untuk memantau, menyetujui, dan menolak pengajuan pinjaman dari portal anggota."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PendingActionsOutlinedIcon />} title="Menunggu Review" value={reviewableCount} caption="status pending, submitted, atau review" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AssignmentTurnedInOutlinedIcon />} title="Sudah Disetujui" value={approvedCount} caption="dari halaman yang sedang tampil" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PriceCheckOutlinedIcon />} title="Nominal Terlihat" value={formatCurrency(totalRequestedAmount)} caption="akumulasi nilai pengajuan pada filter aktif" />
        </Grid2>
      </Grid2>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            select
            label="Anggota"
            value={memberId}
            onChange={(event) => {
              setMemberId(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="">Semua anggota</MenuItem>
            {memberOptions.map((item) => (
              <MenuItem key={item.memberId} value={item.memberId}>
                {item.memberNo} - {item.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Semua status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <SectionCard
        title="Daftar Pengajuan Pinjaman"
        description="Review permintaan pinjaman anggota tanpa bercampur dengan pengelolaan kontrak pinjaman aktif."
      >
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellSx}>Request</TableCell>
                <TableCell sx={tableCellSx}>Anggota</TableCell>
                <TableCell sx={tableCellSx}>Produk</TableCell>
                <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>Nominal</TableCell>
                <TableCell sx={tableCellSx}>Status</TableCell>
                <TableCell sx={tableCellSx}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Memuat request pinjaman...
                  </TableCell>
                </TableRow>
              ) : requestItems.length > 0 ? (
                requestItems.map((item) => {
                  const requestId = item.memberLoanRequestId;
                  const canReview = REVIEWABLE_STATUSES.includes(item.status);
                  const reviewerNote = item.reviewerNote || item.note || null;
                  const rejectReason = reviewerNote || `Permintaan pinjaman ${item.requestNo || requestId} ditolak.`;

                  return (
                    <TableRow key={requestId} hover>
                      <TableCell sx={tableCellSx}>
                        <Typography variant="body2" fontWeight={700}>
                          {item.requestNo || `LN-${requestId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(item.requestedAt || item.requestDate || item.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <Typography variant="body2">{item.fullName || item.memberName || `Member #${item.memberId}`}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.memberNo || "-"}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>{item.productName || item.loanProductName || "-"}</TableCell>
                      <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>
                        <Typography variant="body2">{formatCurrency(item.requestedAmount || item.principalAmount)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.requestedTermMonths || item.termMonths || 0} bulan
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <Chip size="small" label={item.status || "pending"} color={item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "warning"} />
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        {canReview ? (
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              disabled={approveLoanRequest.isPending || !requestId}
                              onClick={() =>
                                approveLoanRequest.mutate({
                                  requestId,
                                  payload: {
                                    loanNo: buildLoanNumber(requestId),
                                    reviewerNote
                                  }
                                })
                              }
                            >
                              Setujui
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              disabled={rejectLoanRequest.isPending || !requestId}
                              onClick={() =>
                                rejectLoanRequest.mutate({
                                  requestId,
                                  payload: { reviewerNote: rejectReason }
                                })
                              }
                            >
                              Tolak
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">{item.reviewNote || item.note || "-"}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tableCellSx, py: 5 }}>
                    Belum ada request pinjaman anggota.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={loanRequests?.totalCount ?? 0} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={10} rowsPerPageOptions={[10]} />
      </SectionCard>
    </KspPageShell>
  );
}
