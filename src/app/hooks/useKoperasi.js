import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  createLoanProduct,
  getLoanProducts,
  updateLoanProduct
} from "/src/api/loanProducts";
import {
  createMember,
  getMembers,
  lookupMembers,
  updateMember
} from "/src/api/members";
import {
  getDashboard,
  getLowStockProducts,
  getMemberBalances,
  getSalesSummary
} from "/src/api/reports";
import {
  createSavingsProduct,
  getSavingsProducts,
  updateSavingsProduct
} from "/src/api/savingsProducts";
import { unwrapData } from "/src/api/response";

export const KOPERASI_KEYS = {
  dashboard: ["koperasi", "dashboard"],
  salesSummary: (params) => ["koperasi", "sales-summary", params],
  memberBalances: (params) => ["koperasi", "member-balances", params],
  lowStockProducts: (params) => ["koperasi", "low-stock-products", params],
  members: (params) => ["koperasi", "members", params],
  savingsProducts: (params) => ["koperasi", "savings-products", params],
  loanProducts: (params) => ["koperasi", "loan-products", params]
};

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

export const useDashboard = () =>
  useQuery({
    queryKey: KOPERASI_KEYS.dashboard,
    queryFn: () => getDashboard().then(unwrapData),
    staleTime: 30_000
  });

export const useMemberBalances = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.memberBalances(params),
    queryFn: () => getMemberBalances(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useSalesSummary = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.salesSummary(params),
    queryFn: () => getSalesSummary(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useLowStockProducts = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.lowStockProducts(params),
    queryFn: () => getLowStockProducts(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useMembers = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.members(params),
    queryFn: () => getMembers(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useMemberLookup = (params, options = {}) =>
  useQuery({
    queryKey: ["koperasi", "members", "lookup", params],
    queryFn: () => lookupMembers(params).then(unwrapData),
    staleTime: 5_000,
    ...options
  });

export const useCreateMember = () =>
  useMutation({
    mutationFn: createMember,
    ...useMutationFeedback(
      "Anggota berhasil dibuat.",
      "Gagal membuat anggota.",
      (queryClient) => queryClient.invalidateQueries({ queryKey: ["koperasi", "members"] })
    )
  });

export const useUpdateMember = (id) =>
  useMutation({
    mutationFn: (payload) => updateMember(id, payload),
    ...useMutationFeedback(
      "Anggota berhasil diperbarui.",
      "Gagal memperbarui anggota.",
      (queryClient) => queryClient.invalidateQueries({ queryKey: ["koperasi", "members"] })
    )
  });

export const useSavingsProducts = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.savingsProducts(params),
    queryFn: () => getSavingsProducts(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useCreateSavingsProduct = () =>
  useMutation({
    mutationFn: createSavingsProduct,
    ...useMutationFeedback(
      "Produk simpanan berhasil dibuat.",
      "Gagal membuat produk simpanan.",
      (queryClient) =>
        queryClient.invalidateQueries({ queryKey: ["koperasi", "savings-products"] })
    )
  });

export const useUpdateSavingsProduct = (id) =>
  useMutation({
    mutationFn: (payload) => updateSavingsProduct(id, payload),
    ...useMutationFeedback(
      "Produk simpanan berhasil diperbarui.",
      "Gagal memperbarui produk simpanan.",
      (queryClient) =>
        queryClient.invalidateQueries({ queryKey: ["koperasi", "savings-products"] })
    )
  });

export const useLoanProducts = (params, options = {}) =>
  useQuery({
    queryKey: KOPERASI_KEYS.loanProducts(params),
    queryFn: () => getLoanProducts(params).then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useCreateLoanProduct = () =>
  useMutation({
    mutationFn: createLoanProduct,
    ...useMutationFeedback(
      "Produk pinjaman berhasil dibuat.",
      "Gagal membuat produk pinjaman.",
      (queryClient) =>
        queryClient.invalidateQueries({ queryKey: ["koperasi", "loan-products"] })
    )
  });

export const useUpdateLoanProduct = (id) =>
  useMutation({
    mutationFn: (payload) => updateLoanProduct(id, payload),
    ...useMutationFeedback(
      "Produk pinjaman berhasil diperbarui.",
      "Gagal memperbarui produk pinjaman.",
      (queryClient) =>
        queryClient.invalidateQueries({ queryKey: ["koperasi", "loan-products"] })
    )
  });
