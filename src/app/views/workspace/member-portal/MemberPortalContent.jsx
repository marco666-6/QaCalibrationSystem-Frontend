import { useEffect, useMemo, useRef, useState } from "react";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import { Alert, Button, Chip, MenuItem, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import useAuth from "app/hooks/useAuth";
import { useMemberPortalDashboard, useMemberPortalLoanPayments, useMemberPortalLoans, useMemberPortalProfile, useMemberPortalPurchases, useMemberPortalSavings, useMemberPortalTransactions } from "app/hooks/useBusinessModules";
import { formatCurrency, formatDate, formatDateTime } from "../shared/workspaceFormatters";
import { MetricCard, ModuleCard, PageFrame, SectionCard, SimpleTable } from "../shared/WorkspaceSection";

const tableEdgePaddingSx = { "& .MuiTableCell-root:first-of-type": { pl: 3 }, "& .MuiTableCell-root:last-of-type": { pr: 3 } };

export default function MemberPortalContent() {
  const { user } = useAuth();
  const isMember = user?.roles?.includes("member") || user?.role === "member";
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [transactionPage, setTransactionPage] = useState(0);
  const [purchasePage, setPurchasePage] = useState(0);
  const [paymentPage, setPaymentPage] = useState(0);
  const [transactionSource, setTransactionSource] = useState("");
  const [transactionEntryType, setTransactionEntryType] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const loanScheduleRef = useRef(null);

  const profile = useMemberPortalProfile({ enabled: isMember });
  const dashboard = useMemberPortalDashboard({ enabled: isMember });
  const savings = useMemberPortalSavings({ enabled: isMember });
  const loans = useMemberPortalLoans({ enabled: isMember });
  const transactions = useMemberPortalTransactions(
    { Page: transactionPage + 1, PageSize: 8, SourceModule: transactionSource || undefined, EntryType: transactionEntryType || undefined },
    { enabled: isMember }
  );
  const purchases = useMemberPortalPurchases(
    { Page: purchasePage + 1, PageSize: 8, SaleType: purchaseType || undefined },
    { enabled: isMember }
  );
  const loanPayments = useMemberPortalLoanPayments({ Page: paymentPage + 1, PageSize: 8 }, { enabled: isMember });

  const loanItems = loans.data ?? [];
  const selectedLoan = useMemo(() => loanItems.find((item) => item.loanId === selectedLoanId) || null, [loanItems, selectedLoanId]);

  useEffect(() => {
    if (selectedLoanId != null && !loanItems.some((item) => item.loanId === selectedLoanId)) setSelectedLoanId(null);
  }, [loanItems, selectedLoanId]);

  const selectLoan = (loanId) => {
    setSelectedLoanId(loanId);
    setActiveTab("loans");
    window.requestAnimationFrame(() => loanScheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <PageFrame
      section="Portal Anggota"
      title="Ringkasan Anggota"
      description="Halaman utama anggota dengan tampilan bertab agar profil, simpanan, pinjaman, dan belanja tetap lengkap tetapi lebih rapi."
    >
      {!isMember ? (
        <Alert severity="info">Endpoint portal anggota hanya relevan untuk role `member`.</Alert>
      ) : (
        <>
          <Grid2 container spacing={2.5}>
            <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard icon={<SavingsOutlinedIcon />} title="Total Simpanan" value={formatCurrency(dashboard.data?.totalSavingsBalance)} caption="saldo anggota" />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard icon={<AccountBalanceWalletOutlinedIcon />} title="Outstanding Pinjaman" value={formatCurrency(dashboard.data?.outstandingLoanAmount)} caption="sisa kewajiban" />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard icon={<ReceiptLongOutlinedIcon />} title="Pinjaman Aktif" value={dashboard.data?.activeLoanCount ?? 0} caption={`${dashboard.data?.pendingInstallmentCount ?? 0} cicilan belum lunas`} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard icon={<StorefrontOutlinedIcon />} title="Total Belanja" value={formatCurrency(dashboard.data?.totalPurchaseAmount)} caption="riwayat POS anggota" />
            </Grid2>
          </Grid2>

          <SectionCard title="Menu Layanan" description="Pengajuan dan pemantauan status dipisah ke menu khusus agar alurnya lebih rapi.">
            <Grid2 container spacing={2.5}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ModuleCard title="Ajukan Pinjaman" description="Isi form pengajuan pinjaman anggota beserta nominal dan tenor yang diinginkan." icon={<EditNoteOutlinedIcon />} to="/portal-anggota/pengajuan-pinjaman" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <ModuleCard title="Ajukan Penarikan" description="Kirim permintaan penarikan simpanan dari produk yang Anda miliki." icon={<PriceCheckOutlinedIcon />} to="/portal-anggota/pengajuan-penarikan" />
              </Grid2>
            </Grid2>
          </SectionCard>

          <SectionCard title="Data Anggota" description="Gunakan tab untuk berpindah cepat antar ringkasan informasi.">
            <Tabs value={activeTab} onChange={(_, nextValue) => setActiveTab(nextValue)} variant="scrollable" allowScrollButtonsMobile sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tab value="overview" label="Profil" />
              <Tab value="savings" label={`Simpanan (${(savings.data ?? []).length})`} />
              <Tab value="loans" label={`Pinjaman (${loanItems.length})`} />
              <Tab value="purchases" label={`Belanja (${purchases.data?.totalCount ?? 0})`} />
            </Tabs>

            {activeTab === "overview" ? (
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <SectionCard title="Profil Anggota" description="Ringkasan identitas dan status keanggotaan.">
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{profile.data?.fullName}</Typography>
                          <Typography variant="body2" color="text.secondary">Member No: {profile.data?.memberNo}</Typography>
                          <Typography variant="body2" color="text.secondary">Username: {profile.data?.username}</Typography>
                          <Typography variant="body2" color="text.secondary">Tenant: {profile.data?.tenantName}</Typography>
                        </Paper>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="body2" color="text.secondary">Email: {profile.data?.email || "-"}</Typography>
                          <Typography variant="body2" color="text.secondary">Telepon: {profile.data?.phoneNumber || "-"}</Typography>
                          <Typography variant="body2" color="text.secondary">Status: {profile.data?.memberStatus || "-"}</Typography>
                          <Typography variant="body2" color="text.secondary">Bergabung: {profile.data?.joinDate ? formatDate(profile.data.joinDate) : "-"}</Typography>
                        </Paper>
                      </Grid2>
                    </Grid2>
                  </SectionCard>
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <SectionCard title="Cicilan Berikutnya" description="Ringkasan jatuh tempo terdekat.">
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                      <Typography variant="body2" color="text.secondary">Jatuh tempo berikutnya</Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ mt: 0.75 }}>
                        {dashboard.data?.nextInstallmentDueDate ? formatDate(dashboard.data.nextInstallmentDueDate) : "Belum ada"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        Nominal berikutnya: {formatCurrency(dashboard.data?.nextInstallmentAmount)}
                      </Typography>
                    </Paper>
                  </SectionCard>
                </Grid2>
              </Grid2>
            ) : null}

            {activeTab === "savings" ? (
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, xl: 5 }}>
                  <SectionCard title="Simpanan Saya" description="Akun simpanan anggota yang dapat dipantau secara mandiri.">
                    <SimpleTable
                      tableSx={tableEdgePaddingSx}
                      columns={[
                        { key: "productName", label: "Produk" },
                        { key: "periodicity", label: "Periodisitas" },
                        { key: "lastTransactionAt", label: "Mutasi Terakhir", render: (row) => formatDateTime(row.lastTransactionAt) },
                        { key: "balanceAmount", label: "Saldo", align: "right", render: (row) => formatCurrency(row.balanceAmount) }
                      ]}
                      rows={savings.data ?? []}
                    />
                  </SectionCard>
                </Grid2>
                <Grid2 size={{ xs: 12, xl: 7 }}>
                  <SectionCard title="Riwayat Transaksi" description="Ledger transaksi anggota dari seluruh modul.">
                    <Grid2 container spacing={1.5}>
                      <Grid2 size={{ xs: 12, md: 4 }}>
                        <TextField size="small" select fullWidth label="Modul" value={transactionSource} onChange={(event) => { setTransactionSource(event.target.value); setTransactionPage(0); }}>
                          <MenuItem value="">Semua modul</MenuItem>
                          <MenuItem value="saving">Simpanan</MenuItem>
                          <MenuItem value="loan">Pinjaman</MenuItem>
                          <MenuItem value="pos">POS</MenuItem>
                        </TextField>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 4 }}>
                        <TextField size="small" select fullWidth label="Entry" value={transactionEntryType} onChange={(event) => { setTransactionEntryType(event.target.value); setTransactionPage(0); }}>
                          <MenuItem value="">Semua entry</MenuItem>
                          <MenuItem value="debit">Debit</MenuItem>
                          <MenuItem value="credit">Credit</MenuItem>
                        </TextField>
                      </Grid2>
                    </Grid2>
                    <SimpleTable
                      tableSx={tableEdgePaddingSx}
                      columns={[
                        { key: "transactionNo", label: "No." },
                        { key: "sourceModule", label: "Modul" },
                        { key: "entryType", label: "Entry" },
                        { key: "amount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.amount) }
                      ]}
                      rows={transactions.data?.items ?? []}
                    />
                    <TablePagination component="div" count={transactions.data?.totalCount ?? 0} page={transactionPage} onPageChange={(_, nextPage) => setTransactionPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
                  </SectionCard>
                </Grid2>
              </Grid2>
            ) : null}

            {activeTab === "loans" ? (
              <>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, lg: 6 }}>
                    <SectionCard title="Pinjaman Saya" description="Pilih pinjaman untuk melihat jadwal cicilan yang lebih rinci.">
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, ...tableEdgePaddingSx }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>No. Pinjaman</TableCell>
                              <TableCell>Produk</TableCell>
                              <TableCell align="right">Sisa</TableCell>
                              <TableCell align="right">Aksi</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {loanItems.length > 0 ? (
                              loanItems.map((row) => (
                                <TableRow key={row.loanId} hover selected={selectedLoan?.loanId === row.loanId}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={700}>{row.loanNo}</Typography>
                                    <Typography variant="caption" color="text.secondary">{row.status} - tenor {row.termMonths} bulan</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">{row.loanProductName}</Typography>
                                    <Typography variant="caption" color="text.secondary">akad {formatDate(row.loanDate)}</Typography>
                                  </TableCell>
                                  <TableCell align="right">{formatCurrency(row.outstandingTotalAmount)}</TableCell>
                                  <TableCell align="right">
                                    <Button size="small" endIcon={<KeyboardArrowRightOutlinedIcon />} onClick={() => selectLoan(row.loanId)}>
                                      {selectedLoan?.loanId === row.loanId ? "Jadwal dipilih" : "Lihat jadwal"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>Belum ada pinjaman aktif.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </SectionCard>
                  </Grid2>
                  <Grid2 size={{ xs: 12, lg: 6 }} ref={loanScheduleRef}>
                    <SectionCard title={selectedLoan ? `Jadwal Cicilan ${selectedLoan.loanNo}` : "Jadwal Cicilan"} description={selectedLoan ? "Jadwal cicilan berikut status pelunasannya." : "Pilih salah satu pinjaman untuk melihat jadwal cicilan."}>
                      {selectedLoan ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, ...tableEdgePaddingSx }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Angsuran</TableCell>
                                <TableCell>Jatuh Tempo</TableCell>
                                <TableCell align="right">Tagihan</TableCell>
                                <TableCell align="right">Terbayar</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(selectedLoan.installments ?? []).length > 0 ? (
                                selectedLoan.installments.map((item) => (
                                  <TableRow key={`${selectedLoan.loanId}-${item.installmentNo}`} hover>
                                    <TableCell>#{item.installmentNo}</TableCell>
                                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                                    <TableCell align="right">{formatCurrency(item.installmentAmount)}</TableCell>
                                    <TableCell align="right">{formatCurrency(item.paidAmount)}</TableCell>
                                    <TableCell><Chip size="small" label={item.installmentStatus} color={item.installmentStatus === "paid" ? "success" : "default"} /></TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>Jadwal cicilan belum tersedia.</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>Pilih pinjaman agar jadwal cicilan muncul di sini.</Alert>
                      )}
                    </SectionCard>
                  </Grid2>
                </Grid2>

                <SectionCard title="Riwayat Pembayaran Cicilan" description="Pembayaran yang sudah tercatat untuk akun anggota ini.">
                  <SimpleTable
                    tableSx={tableEdgePaddingSx}
                    columns={[
                      { key: "paymentNo", label: "No. Bayar" },
                      { key: "loanNo", label: "Pinjaman" },
                      { key: "paymentTs", label: "Waktu", render: (row) => formatDateTime(row.paymentTs) },
                      { key: "paymentAmount", label: "Nominal", align: "right", render: (row) => formatCurrency(row.paymentAmount) }
                    ]}
                    rows={loanPayments.data?.items ?? []}
                  />
                  <TablePagination component="div" count={loanPayments.data?.totalCount ?? 0} page={paymentPage} onPageChange={(_, nextPage) => setPaymentPage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
                </SectionCard>
              </>
            ) : null}

            {activeTab === "purchases" ? (
              <SectionCard title="Riwayat Belanja" description="Riwayat POS yang boleh dilihat sendiri oleh anggota.">
                <Grid2 container spacing={1.5}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField size="small" select fullWidth label="Tipe Belanja" value={purchaseType} onChange={(event) => { setPurchaseType(event.target.value); setPurchasePage(0); }}>
                      <MenuItem value="">Semua tipe</MenuItem>
                      <MenuItem value="cash">Tunai</MenuItem>
                      <MenuItem value="member_credit">Kredit Anggota</MenuItem>
                    </TextField>
                  </Grid2>
                </Grid2>
                <SimpleTable
                  tableSx={tableEdgePaddingSx}
                  columns={[
                    { key: "saleNo", label: "No. Jual" },
                    { key: "saleType", label: "Tipe" },
                    { key: "totalAmount", label: "Total", align: "right", render: (row) => formatCurrency(row.totalAmount) },
                    { key: "saleTs", label: "Waktu", render: (row) => formatDateTime(row.saleTs) }
                  ]}
                  rows={purchases.data?.items ?? []}
                />
                <TablePagination component="div" count={purchases.data?.totalCount ?? 0} page={purchasePage} onPageChange={(_, nextPage) => setPurchasePage(nextPage)} rowsPerPage={8} rowsPerPageOptions={[8]} />
              </SectionCard>
            ) : null}
          </SectionCard>
        </>
      )}
    </PageFrame>
  );
}
