import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, forgotPassword, resetPassword } from "/src/api/auth";
import { getMyProfile, updateMyProfile } from "/src/api/profile";
import { unwrapData } from "/src/api/response";
import { notifyError, notifySuccess } from "app/utils/notify";

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

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile });
      notifySuccess(response?.message || "Profil berhasil diperbarui.");
    },
    onError: (error) => {
      notifyError(error.message || "Gagal memperbarui profil.");
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      notifySuccess(response?.message || "Instruksi reset password berhasil dikirim.");
    },
    onError: (error) => {
      notifyError(error.message || "Gagal mengirim instruksi reset password.");
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      notifySuccess(response?.message || "Password berhasil direset.");
    },
    onError: (error) => {
      notifyError(error.message || "Gagal mereset password.");
    }
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile });
      notifySuccess(response?.message || "Password berhasil diubah.");
    },
    onError: (error) => {
      notifyError(error.message || "Gagal mengubah password.");
    }
  });
};
