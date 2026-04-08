import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  createInternalUser,
  deleteInternalUser,
  getInternalUsers,
  resetInternalUserPassword,
  updateInternalUser
} from "/src/api/internalUsers";
import {
  createProduct,
  createProductCategory,
  createPurchaseReceipt,
  createStockAdjustment,
  createSupplier,
  getProductCategories,
  getProducts,
  lookupProducts,
  getPurchaseReceipts,
  getStockAdjustments,
  getStockMovements,
  getSuppliers,
  updateProduct,
  updateProductCategory,
  updateSupplier
} from "/src/api/inventory";
import {
  approveLoanRequest,
  createLoan,
  createLoanPayment,
  deleteLoan,
  deleteLoanPayment,
  getLoanPayments,
  getLoanRequests,
  getLoans,
  rejectLoanRequest
} from "/src/api/loans";
import {
  createMemberPortalLoanRequest,
  createMemberPortalWithdrawalRequest,
  getMemberPortalDashboard,
  getMemberPortalLoanProducts,
  getMemberPortalLoanRequests,
  getMemberPortalLoanPayments,
  getMemberPortalLoans,
  getMemberPortalProfile,
  getMemberPortalPurchases,
  getMemberPortalSavings,
  getMemberPortalSavingsProducts,
  getMemberPortalTransactions,
  getMemberPortalWithdrawalRequests
} from "/src/api/memberPortal";
import { convertSaleToLoan, createSale, getSaleReceipt, getSales } from "/src/api/sales";
import {
  approveWithdrawalRequest,
  createSavingsTransaction,
  deleteSavingsTransaction,
  getSavingsAccounts,
  getSavingsTransactions,
  getWithdrawalRequests,
  rejectWithdrawalRequest
} from "/src/api/savingsTransactions";
import { unwrapData } from "/src/api/response";

const STALE_TIME = 30_000;

function useMutationFeedback(successMessage, errorMessage, onInvalidate) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return {
    onSuccess: (response) => {
      onInvalidate(queryClient);
      enqueueSnackbar(response?.message || successMessage, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || errorMessage, { variant: "error" });
    }
  };
}

export const useSavingsAccounts = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "savings-accounts", params],
    queryFn: () => getSavingsAccounts(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useSavingsTransactions = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "savings-transactions", params],
    queryFn: () => getSavingsTransactions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useLoans = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "loans", params],
    queryFn: () => getLoans(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useLoanRequests = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "loan-requests", params],
    queryFn: () => getLoanRequests(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useLoanPayments = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "loan-payments", params],
    queryFn: () => getLoanPayments(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useProductCategories = (options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "categories"],
    queryFn: () => getProductCategories().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useSuppliers = (options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "suppliers"],
    queryFn: () => getSuppliers().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useProducts = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "products", params],
    queryFn: () => getProducts(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useProductLookup = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "products", "lookup", params],
    queryFn: () => lookupProducts(params).then(unwrapData),
    staleTime: 5_000,
    ...options
  });

export const usePurchaseReceipts = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "purchase-receipts", params],
    queryFn: () => getPurchaseReceipts(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useStockAdjustments = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "stock-adjustments", params],
    queryFn: () => getStockAdjustments(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useStockMovements = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "inventory", "stock-movements", params],
    queryFn: () => getStockMovements(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useSales = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "sales", params],
    queryFn: () => getSales(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useSaleReceipt = (saleId, options = {}) =>
  useQuery({
    queryKey: ["business", "sales", "receipt", saleId],
    queryFn: () => getSaleReceipt(saleId).then(unwrapData),
    staleTime: STALE_TIME,
    enabled: Boolean(saleId) && (options.enabled ?? true),
    ...options
  });

export const useCreateSavingsTransaction = () =>
  useMutation({
    mutationFn: createSavingsTransaction,
    ...useMutationFeedback(
      "Transaksi simpanan berhasil dicatat.",
      "Gagal mencatat transaksi simpanan.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "savings-accounts"] });
        queryClient.invalidateQueries({ queryKey: ["business", "savings-transactions"] });
      }
    )
  });

export const useDeleteSavingsTransaction = () =>
  useMutation({
    mutationFn: deleteSavingsTransaction,
    ...useMutationFeedback(
      "Transaksi simpanan berhasil dihapus.",
      "Gagal menghapus transaksi simpanan.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "savings-accounts"] });
        queryClient.invalidateQueries({ queryKey: ["business", "savings-transactions"] });
      }
    )
  });

export const useApproveWithdrawalRequest = () =>
  useMutation({
    mutationFn: ({ requestId, payload }) => approveWithdrawalRequest(requestId, payload),
    ...useMutationFeedback(
      "Request penarikan berhasil disetujui.",
      "Gagal menyetujui request penarikan.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "savings-accounts"] });
        queryClient.invalidateQueries({ queryKey: ["business", "savings-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["business", "withdrawal-requests"] });
        queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "withdrawal-requests"] });
        queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "savings"] });
        queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "transactions"] });
      }
    )
  });

export const useRejectWithdrawalRequest = () =>
  useMutation({
    mutationFn: ({ requestId, payload }) => rejectWithdrawalRequest(requestId, payload),
    ...useMutationFeedback(
      "Request penarikan berhasil ditolak.",
      "Gagal menolak request penarikan.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "withdrawal-requests"] });
        queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "withdrawal-requests"] });
      }
    )
  });

export const useCreateLoan = () =>
  useMutation({
    mutationFn: createLoan,
    ...useMutationFeedback("Pinjaman berhasil dibuat.", "Gagal membuat pinjaman.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
    })
  });

export const useApproveLoanRequest = () =>
  useMutation({
    mutationFn: ({ requestId, payload }) => approveLoanRequest(requestId, payload),
    ...useMutationFeedback("Request pinjaman berhasil disetujui.", "Gagal menyetujui request pinjaman.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
      queryClient.invalidateQueries({ queryKey: ["business", "loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "loans"] });
    })
  });

export const useRejectLoanRequest = () =>
  useMutation({
    mutationFn: ({ requestId, payload }) => rejectLoanRequest(requestId, payload),
    ...useMutationFeedback("Request pinjaman berhasil ditolak.", "Gagal menolak request pinjaman.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "loan-requests"] });
    })
  });

export const useDeleteLoan = () =>
  useMutation({
    mutationFn: deleteLoan,
    ...useMutationFeedback("Pinjaman berhasil dihapus.", "Gagal menghapus pinjaman.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
    })
  });

export const useCreateLoanPayment = (loanId) =>
  useMutation({
    mutationFn: (payload) => createLoanPayment(loanId, payload),
    ...useMutationFeedback(
      "Pembayaran cicilan berhasil dicatat.",
      "Gagal mencatat pembayaran cicilan.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
        queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
      }
    )
  });

export const useDeleteLoanPayment = () =>
  useMutation({
    mutationFn: deleteLoanPayment,
    ...useMutationFeedback(
      "Pembayaran terakhir berhasil dibatalkan.",
      "Gagal membatalkan pembayaran terakhir.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
        queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
      }
    )
  });

export const useCreateProductCategory = () =>
  useMutation({
    mutationFn: createProductCategory,
    ...useMutationFeedback("Kategori berhasil dibuat.", "Gagal membuat kategori.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "categories"] });
    })
  });

export const useUpdateProductCategory = (categoryId) =>
  useMutation({
    mutationFn: (payload) => updateProductCategory(categoryId, payload),
    ...useMutationFeedback(
      "Kategori berhasil diperbarui.",
      "Gagal memperbarui kategori.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "categories"] });
      }
    )
  });

export const useCreateSupplier = () =>
  useMutation({
    mutationFn: createSupplier,
    ...useMutationFeedback("Supplier berhasil dibuat.", "Gagal membuat supplier.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "suppliers"] });
    })
  });

export const useUpdateSupplier = (supplierId) =>
  useMutation({
    mutationFn: (payload) => updateSupplier(supplierId, payload),
    ...useMutationFeedback(
      "Supplier berhasil diperbarui.",
      "Gagal memperbarui supplier.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "suppliers"] });
      }
    )
  });

export const useCreateProduct = () =>
  useMutation({
    mutationFn: createProduct,
    ...useMutationFeedback("Produk berhasil dibuat.", "Gagal membuat produk.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "products"] });
      queryClient.invalidateQueries({ queryKey: ["koperasi", "low-stock-products"] });
    })
  });

export const useUpdateProduct = (productId) =>
  useMutation({
    mutationFn: (payload) => updateProduct(productId, payload),
    ...useMutationFeedback("Produk berhasil diperbarui.", "Gagal memperbarui produk.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "products"] });
      queryClient.invalidateQueries({ queryKey: ["koperasi", "low-stock-products"] });
    })
  });

export const useCreatePurchaseReceipt = () =>
  useMutation({
    mutationFn: createPurchaseReceipt,
    ...useMutationFeedback(
      "Stok masuk berhasil dicatat.",
      "Gagal mencatat stok masuk.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "products"] });
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "purchase-receipts"] });
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "stock-movements"] });
      }
    )
  });

export const useCreateStockAdjustment = () =>
  useMutation({
    mutationFn: createStockAdjustment,
    ...useMutationFeedback(
      "Penyesuaian stok berhasil dicatat.",
      "Gagal mencatat penyesuaian stok.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "products"] });
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "stock-adjustments"] });
        queryClient.invalidateQueries({ queryKey: ["business", "inventory", "stock-movements"] });
      }
    )
  });

export const useCreateSale = () =>
  useMutation({
    mutationFn: createSale,
    ...useMutationFeedback("Penjualan berhasil dibuat.", "Gagal membuat penjualan.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "sales"] });
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "products"] });
      queryClient.invalidateQueries({ queryKey: ["business", "inventory", "stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "purchases"] });
    })
  });

export const useConvertSaleToLoan = (saleId) =>
  useMutation({
    mutationFn: (payload) => convertSaleToLoan(saleId, payload),
    ...useMutationFeedback(
      "Penjualan kredit berhasil dikonversi menjadi pinjaman.",
      "Gagal mengonversi penjualan kredit.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "sales"] });
        queryClient.invalidateQueries({ queryKey: ["business", "loans"] });
        queryClient.invalidateQueries({ queryKey: ["business", "loan-payments"] });
      }
    )
  });

export const useInternalUsers = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "internal-users", params],
    queryFn: () => getInternalUsers(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateInternalUser = () =>
  useMutation({
    mutationFn: createInternalUser,
    ...useMutationFeedback(
      "Pengguna internal berhasil dibuat.",
      "Gagal membuat pengguna internal.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "internal-users"] });
      }
    )
  });

export const useUpdateInternalUser = (userId) =>
  useMutation({
    mutationFn: (payload) => updateInternalUser(userId, payload),
    ...useMutationFeedback(
      "Pengguna internal berhasil diperbarui.",
      "Gagal memperbarui pengguna internal.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "internal-users"] });
      }
    )
  });

export const useResetInternalUserPassword = (userId) =>
  useMutation({
    mutationFn: (payload) => resetInternalUserPassword(userId, payload),
    ...useMutationFeedback(
      "Password pengguna berhasil direset.",
      "Gagal mereset password pengguna.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "internal-users"] });
      }
    )
  });

export const useDeleteInternalUser = () =>
  useMutation({
    mutationFn: deleteInternalUser,
    ...useMutationFeedback(
      "Pengguna internal berhasil dihapus.",
      "Gagal menghapus pengguna internal.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["business", "internal-users"] });
      }
    )
  });

export const useMemberPortalProfile = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "profile"],
    queryFn: () => getMemberPortalProfile().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalDashboard = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "dashboard"],
    queryFn: () => getMemberPortalDashboard().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalSavings = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "savings"],
    queryFn: () => getMemberPortalSavings().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalLoans = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "loans"],
    queryFn: () => getMemberPortalLoans().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalLoanProducts = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "loan-products"],
    queryFn: () => getMemberPortalLoanProducts().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalLoanRequests = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "loan-requests", params],
    queryFn: () => getMemberPortalLoanRequests(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalLoanPayments = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "loan-payments", params],
    queryFn: () => getMemberPortalLoanPayments(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalWithdrawalRequests = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "withdrawal-requests", params],
    queryFn: () => getMemberPortalWithdrawalRequests(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalSavingsProducts = (options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "savings-products"],
    queryFn: () => getMemberPortalSavingsProducts().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalPurchases = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "purchases", params],
    queryFn: () => getMemberPortalPurchases(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useMemberPortalTransactions = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "member-portal", "transactions", params],
    queryFn: () => getMemberPortalTransactions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateMemberPortalLoanRequest = () =>
  useMutation({
    mutationFn: createMemberPortalLoanRequest,
    ...useMutationFeedback("Pengajuan pinjaman berhasil dikirim.", "Gagal mengirim pengajuan pinjaman.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["business", "loan-requests"] });
    })
  });

export const useCreateMemberPortalWithdrawalRequest = () =>
  useMutation({
    mutationFn: createMemberPortalWithdrawalRequest,
    ...useMutationFeedback("Permintaan penarikan berhasil dikirim.", "Gagal mengirim permintaan penarikan.", (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ["business", "member-portal", "withdrawal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["business", "withdrawal-requests"] });
    })
  });

export const useWithdrawalRequests = (params, options = {}) =>
  useQuery({
    queryKey: ["business", "withdrawal-requests", params],
    queryFn: () => getWithdrawalRequests(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
