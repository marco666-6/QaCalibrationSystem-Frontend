import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { changePassword, forgotPassword, resetPassword } from "/src/api/auth";
import { getMyProfile, updateMyProfile } from "/src/api/profile";
import { unwrapData } from "/src/api/response";

export const PROFILE_KEYS = {
  profile: ["profile"]
};

export const useMyProfile = (options = {}) =>
  useQuery({
    queryKey: PROFILE_KEYS.profile,
    queryFn: () => getMyProfile().then(unwrapData),
    staleTime: 30_000,
    ...options
  });

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile });
      enqueueSnackbar(response?.message || "Profil berhasil diperbarui.", {
        variant: "success"
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Gagal memperbarui profil.", {
        variant: "error"
      });
    }
  });
};

export const useForgotPassword = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      enqueueSnackbar(response?.message || "Instruksi reset password berhasil dikirim.", {
        variant: "success"
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Gagal mengirim instruksi reset password.", {
        variant: "error"
      });
    }
  });
};

export const useResetPassword = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      enqueueSnackbar(response?.message || "Password berhasil direset.", {
        variant: "success"
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Gagal mereset password.", {
        variant: "error"
      });
    }
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile });
      enqueueSnackbar(response?.message || "Password berhasil diubah.", {
        variant: "success"
      });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Gagal mengubah password.", {
        variant: "error"
      });
    }
  });
};
