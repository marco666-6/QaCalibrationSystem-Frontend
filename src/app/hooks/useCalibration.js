import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  createDefaultLocation,
  deleteDefaultLocation,
  getDefaultLocationOptions,
  getDefaultLocations,
  updateDefaultLocation
} from "/src/api/defaultLocations";
import {
  createEquipment,
  deleteEquipment,
  getEquipments,
  updateEquipment,
  bulkChangeEquipmentPic,
  bulkChangeEquipmentSection,
  bulkChangeEquipmentStatus,
  deleteEquipmentsBulk,
  downloadEquipmentImportTemplate,
  exportEquipments,
  getEquipmentById,
  getEquipmentNameSummary,
  importEquipments
} from "/src/api/equipments";
import {
  createPosition,
  deletePosition,
  getPositionOptions,
  getPositions,
  updatePosition
} from "/src/api/positions";
import {
  createSection,
  deleteSection,
  getSectionOptions,
  getSections,
  updateSection
} from "/src/api/sections";
import { unwrapData } from "/src/api/response";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserOptions,
  getUsers,
  resetUserPassword,
  updateUser
} from "/src/api/users";

const STALE_TIME = 30_000;
const EQUIPMENT_SUMMARY_PAGE_SIZE = 100;

function buildEquipmentNameSummary(items) {
  const groups = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const followingMonthStart = new Date(today.getFullYear(), today.getMonth() + 2, 1);

  items.forEach((item) => {
    const equipmentName = item.equipmentName?.trim() || "Unassigned equipment";
    const current = groups.get(equipmentName) ?? {
      equipmentName,
      totalItems: 0,
      dueItems: 0,
      overdueItems: 0,
      dueNextMonthItems: 0
    };

    current.totalItems += 1;

    if (item.nextCalibDate) {
      const nextCalibDate = new Date(item.nextCalibDate);
      nextCalibDate.setHours(0, 0, 0, 0);

      if (nextCalibDate < today) {
        current.overdueItems += 1;
      } else if (nextCalibDate >= today && nextCalibDate < nextMonthStart) {
        current.dueItems += 1;
      } else if (nextCalibDate >= nextMonthStart && nextCalibDate < followingMonthStart) {
        current.dueNextMonthItems += 1;
      }
    }

    groups.set(equipmentName, current);
  });

  return [...groups.values()].sort((left, right) => {
    if (right.overdueItems !== left.overdueItems) return right.overdueItems - left.overdueItems;
    if (right.dueItems !== left.dueItems) return right.dueItems - left.dueItems;
    if (right.totalItems !== left.totalItems) return right.totalItems - left.totalItems;

    return left.equipmentName.localeCompare(right.equipmentName, undefined, {
      sensitivity: "base"
    });
  });
}

async function fetchEquipmentNameSummaryFallback() {
  const allItems = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getEquipments({ Page: page, PageSize: EQUIPMENT_SUMMARY_PAGE_SIZE });
    const payload = unwrapData(response);
    const pageItems = payload?.items ?? [];

    allItems.push(...pageItems);

    const totalCount = payload?.totalCount ?? allItems.length;
    const pageSize = payload?.pageSize ?? EQUIPMENT_SUMMARY_PAGE_SIZE;
    totalPages = payload?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
    page += 1;
  } while (page <= totalPages);

  return buildEquipmentNameSummary(allItems);
}

function useMutationFeedback(successMessage, errorMessage, onInvalidate) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return {
    onSuccess: (response) => {
      onInvalidate?.(queryClient);
      enqueueSnackbar(response?.message || successMessage, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || errorMessage, { variant: "error" });
    }
  };
}

export const useUsers = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "users", params],
    queryFn: () => getUsers(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useUser = (id, options = {}) =>
  useQuery({
    queryKey: ["calibration", "users", id],
    queryFn: () => getUserById(id).then(unwrapData),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });

export const useUserOptions = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "users", "options", params],
    queryFn: () => getUserOptions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: createUser,
    ...useMutationFeedback(
      "User created successfully.",
      "Failed to create user.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "users"] });
      }
    )
  });

export const useUpdateUser = (userId) =>
  useMutation({
    mutationFn: (payload) => updateUser(userId, payload),
    ...useMutationFeedback(
      "User updated successfully.",
      "Failed to update user.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "users"] });
      }
    )
  });

export const useResetUserPassword = (userId) =>
  useMutation({
    mutationFn: (payload) => resetUserPassword(userId, payload),
    ...useMutationFeedback(
      "Password reset successfully.",
      "Failed to reset password.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "users"] });
      }
    )
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: deleteUser,
    ...useMutationFeedback(
      "User deleted successfully.",
      "Failed to delete user.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "users"] });
      }
    )
  });

export const useSections = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "sections", params],
    queryFn: () => getSections(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useSectionOptions = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "sections", "options", params],
    queryFn: () => getSectionOptions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateSection = () =>
  useMutation({
    mutationFn: createSection,
    ...useMutationFeedback(
      "Section created successfully.",
      "Failed to create section.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "sections"] });
      }
    )
  });

export const useUpdateSection = (sectionId) =>
  useMutation({
    mutationFn: (payload) => updateSection(sectionId, payload),
    ...useMutationFeedback(
      "Section updated successfully.",
      "Failed to update section.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "sections"] });
      }
    )
  });

export const useDeleteSection = () =>
  useMutation({
    mutationFn: deleteSection,
    ...useMutationFeedback(
      "Section deleted successfully.",
      "Failed to delete section.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "sections"] });
      }
    )
  });

export const usePositions = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "positions", params],
    queryFn: () => getPositions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const usePositionOptions = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "positions", "options", params],
    queryFn: () => getPositionOptions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreatePosition = () =>
  useMutation({
    mutationFn: createPosition,
    ...useMutationFeedback(
      "Position created successfully.",
      "Failed to create position.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "positions"] });
      }
    )
  });

export const useUpdatePosition = (positionId) =>
  useMutation({
    mutationFn: (payload) => updatePosition(positionId, payload),
    ...useMutationFeedback(
      "Position updated successfully.",
      "Failed to update position.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "positions"] });
      }
    )
  });

export const useDeletePosition = () =>
  useMutation({
    mutationFn: deletePosition,
    ...useMutationFeedback(
      "Position deleted successfully.",
      "Failed to delete position.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "positions"] });
      }
    )
  });

export const useDefaultLocations = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "default-locations", params],
    queryFn: () => getDefaultLocations(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useDefaultLocationOptions = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "default-locations", "options", params],
    queryFn: () => getDefaultLocationOptions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateDefaultLocation = () =>
  useMutation({
    mutationFn: createDefaultLocation,
    ...useMutationFeedback(
      "Default location created successfully.",
      "Failed to create default location.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "default-locations"] });
      }
    )
  });

export const useUpdateDefaultLocation = (locationId) =>
  useMutation({
    mutationFn: (payload) => updateDefaultLocation(locationId, payload),
    ...useMutationFeedback(
      "Default location updated successfully.",
      "Failed to update default location.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "default-locations"] });
      }
    )
  });

export const useDeleteDefaultLocation = () =>
  useMutation({
    mutationFn: deleteDefaultLocation,
    ...useMutationFeedback(
      "Default location deleted successfully.",
      "Failed to delete default location.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "default-locations"] });
      }
    )
  });

export const useEquipments = (params, options = {}) =>
  useQuery({
    queryKey: ["calibration", "equipments", params],
    queryFn: () => getEquipments(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });

export const useEquipmentNameSummary = (options = {}) =>
  useQuery({
    queryKey: ["calibration", "equipments", "summary-by-name"],
    queryFn: async () => {
      try {
        return await getEquipmentNameSummary().then(unwrapData);
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        return fetchEquipmentNameSummaryFallback();
      }
    },
    staleTime: STALE_TIME,
    ...options
  });

export const useCreateEquipment = () =>
  useMutation({
    mutationFn: createEquipment,
    ...useMutationFeedback(
      "Equipment created successfully.",
      "Failed to create equipment.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useUpdateEquipment = (equipmentId) =>
  useMutation({
    mutationFn: (payload) => updateEquipment(equipmentId, payload),
    ...useMutationFeedback(
      "Equipment updated successfully.",
      "Failed to update equipment.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useDeleteEquipment = () =>
  useMutation({
    mutationFn: deleteEquipment,
    ...useMutationFeedback(
      "Equipment deleted successfully.",
      "Failed to delete equipment.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useEquipmentById = (id, options = {}) =>
  useQuery({
    queryKey: ["calibration", "equipments", id],
    queryFn: () => getEquipmentById(id).then(unwrapData),
    enabled: !!id,
    staleTime: STALE_TIME,
    ...options
  });

export const useBulkDeleteEquipments = () =>
  useMutation({
    mutationFn: deleteEquipmentsBulk,
    ...useMutationFeedback(
      "Selected equipment deleted successfully.",
      "Failed to bulk delete equipment.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useBulkChangeSectionEquipments = () =>
  useMutation({
    mutationFn: bulkChangeEquipmentSection,
    ...useMutationFeedback(
      "Section updated for selected equipment.",
      "Failed to bulk update section.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useBulkChangePicEquipments = () =>
  useMutation({
    mutationFn: bulkChangeEquipmentPic,
    ...useMutationFeedback(
      "PIC updated for selected equipment.",
      "Failed to bulk update PIC.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useBulkChangeStatusEquipments = () =>
  useMutation({
    mutationFn: bulkChangeEquipmentStatus,
    ...useMutationFeedback(
      "Status updated for selected equipment.",
      "Failed to bulk update status.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useImportEquipments = () =>
  useMutation({
    mutationFn: importEquipments,
    ...useMutationFeedback(
      "Equipment imported successfully.",
      "Failed to import equipment.",
      (queryClient) => {
        queryClient.invalidateQueries({ queryKey: ["calibration", "equipments"] });
      }
    )
  });

export const useDownloadEquipmentTemplate = () =>
  useMutation({
    mutationFn: downloadEquipmentImportTemplate,
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "equipment_import_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Template download failed:", error);
    }
  });

export const useExportEquipments = () =>
  useMutation({
    mutationFn: exportEquipments,
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      const now = new Date().toISOString().slice(0, 10);
      a.download = `equipments_export_${now}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Export failed:", error);
    }
  });
