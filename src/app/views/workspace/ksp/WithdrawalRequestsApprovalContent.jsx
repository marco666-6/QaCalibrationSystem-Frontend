import { useMemo, useState } from "react";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
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
import { useApproveWithdrawalRequest, useRejectWithdrawalRequest, useWithdrawalRequests } from "app/hooks/useBusinessModules";
import { useMembers, useSavingsProducts } from "app/hooks/useKoperasi";
import { formatCurrency, formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, SectionCard } from "../shared/WorkspaceSection";
import KspPageShell from "./shared/KspPageShell";

const REVIEWABLE_STATUSES = ["pending", "submitted", "review"];
const tableCellSx = { px: 2.5, py: 1.75 };

function buildTransactionNumber(requestId) {
  return `SV-${requestId}-${Date.now()}`;
}

export default function WithdrawalRequestsApprovalContent() {
  const [memberId, setMemberId] = useState("");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const filters = {
    Page: page + 1,
    PageSize: 10,
    MemberId: memberId || undefined,
    SavingsProductId: productId || undefined,
    Status: status || undefined
  };

  const { data: withdrawalRequests, isLoading, isError, error } = useWithdrawalRequests(filters);
  const { data: members } = useMembers({ Page: 1, PageSize: 100 });
  const { data: savingsProducts } = useSavingsProducts({ Page: 1, PageSize: 100, IsActive: true });
  const approveWithdrawalRequest = useApproveWithdrawalRequest();
  const rejectWithdrawalRequest = useRejectWithdrawalRequest();

  const memberOptions = useMemo(() => members?.items ?? [], [members?.items]);
  const productOptions = useMemo(() => savingsProducts?.items ?? [], [savingsProducts?.items]);
  const requestItems = withdrawalRequests?.items ?? [];
  const reviewableCount = requestItems.filter((item) => REVIEWABLE_STATUSES.includes(item.status)).length;
  const approvedCount = requestItems.filter((item) => item.status === "approved").length;
  const totalRequestedAmount = requestItems.reduce((sum, item) => sum + Number(item.requestedAmount || item.amount || 0), 0);

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
      title="Request Penarikan Simpanan"
      description="Halaman khusus untuk review permintaan penarikan simpanan dari portal anggota."
    >
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<PendingActionsOutlinedIcon />} title="Menunggu Review" value={reviewableCount} caption="status pending, submitted, atau review" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<AssignmentTurnedInOutlinedIcon />} title="Sudah Disetujui" value={approvedCount} caption="dari halaman yang sedang tampil" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <MetricCard icon={<SavingsOutlinedIcon />} title="Nominal Terlihat" value={formatCurrency(totalRequestedAmount)} caption="akumulasi nilai permintaan pada filter aktif" />
        </Grid2>
      </Grid2>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
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
            label="Produk"
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="">Semua produk</MenuItem>
            {productOptions.map((item) => (
              <MenuItem key={item.savingsProductId} value={item.savingsProductId}>
                {item.productCode} - {item.productName}
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
        title="Daftar Request Penarikan"
        description="Review permintaan penarikan dipisah dari ledger transaksi agar operasional simpanan tetap fokus."
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
                    Memuat request penarikan...
                  </TableCell>
                </TableRow>
              ) : requestItems.length > 0 ? (
                requestItems.map((item) => {
                  const requestId = item.savingsWithdrawalRequestId;
                  const canReview = REVIEWABLE_STATUSES.includes(item.status);
                  const reviewerNote = item.reviewerNote || item.note || null;
                  const rejectReason = reviewerNote || `Permintaan penarikan ${item.requestNo || requestId} ditolak.`;

                  return (
                    <TableRow key={requestId} hover>
                      <TableCell sx={tableCellSx}>
                        <Typography variant="body2" fontWeight={700}>
                          {item.requestNo || `WD-${requestId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(item.requestedAt || item.requestDate || item.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <Typography variant="body2">{item.fullName || item.memberName || `Member #${item.memberId}`}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.memberNo || "-"}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>{item.savingsProductName || item.productName || "-"}</TableCell>
                      <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>{formatCurrency(item.requestedAmount || item.amount)}</TableCell>
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
                              disabled={approveWithdrawalRequest.isPending || !requestId}
                              onClick={() =>
                                approveWithdrawalRequest.mutate({
                                  requestId,
                                  payload: {
                                    transactionNo: buildTransactionNumber(requestId),
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
                              disabled={rejectWithdrawalRequest.isPending || !requestId}
                              onClick={() =>
                                rejectWithdrawalRequest.mutate({
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
                    Belum ada request penarikan simpanan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={withdrawalRequests?.totalCount ?? 0} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={10} rowsPerPageOptions={[10]} />
      </SectionCard>
    </KspPageShell>
  );
}
