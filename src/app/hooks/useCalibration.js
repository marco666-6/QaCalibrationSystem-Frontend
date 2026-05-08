import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveActualStep,
  completeCalibActual,
  createCalibActual,
  generateActualPdf,
  getCalibActualFull,
  getCalibActuals,
  removeActualTechnician,
  replaceActualEquipments,
  revokeActualStep,
  setActualEquipmentResult,
  startCalibActual,
  updateActualSummaryRemarks,
  upsertActualTechnician
} from "@api/calibActuals";
import {
  approvePlanStep,
  createCalibPlan,
  deleteCalibPlan,
  generatePlanPdf,
  getCalibPlanFull,
  getCalibPlans,
  loadPlanDueEquipments,
  lockCalibPlan,
  removePlanTechnician,
  revokePlanStep,
  setPlanEquipmentSelected,
  submitCalibPlan,
  updateCalibPlan,
  updatePlanSummaryRemarks,
  upsertPlanTechnician
} from "@api/calibPlans";
import { assignCalibRole, getCalibRoleUsers, getCalibRolesByUser, revokeCalibRole } from "@api/calibRoles";
import { sendDueDateReminders } from "@api/calibrationReminders";
import {
  createDefaultLocation,
  deleteDefaultLocation,
  getDefaultLocations,
  updateDefaultLocation
} from "@api/defaultLocations";
import { createEquipment, getDueEquipments, getEquipmentById, getEquipments, updateEquipment, updateEquipmentStatus } from "@api/equipments";
import { createExternal, deleteExternal, getExternals, updateExternal } from "@api/externals";
import { createSectionPic, deleteSectionPic, getSectionPics, updateSectionPic } from "@api/sectionPics";
import { unwrapData } from "@api/response";
import { createUser, deleteUser, getUserById, getUserOptions, getUsers, resetUserPassword, updateUser } from "@api/users";
import { notifyError, notifySuccess } from "app/utils/notify";

const STALE_TIME = 30_000;

export const calibrationKeys = {
  root: ["calibration"],
  plans: (params) => ["calibration", "plans", params],
  plan: (id) => ["calibration", "plan", id],
  actuals: (params) => ["calibration", "actuals", params],
  actual: (id) => ["calibration", "actual", id],
  equipments: (params) => ["calibration", "equipments", params],
  equipment: (id) => ["calibration", "equipment", id],
  dueEquipments: (params) => ["calibration", "equipments", "due", params],
  externals: ["calibration", "externals"],
  defaultLocations: ["calibration", "default-locations"],
  sectionPics: (params) => ["calibration", "section-pics", params],
  calibRolesByUser: (userId) => ["calibration", "calib-roles", "user", userId],
  calibRoleUsers: (role) => ["calibration", "calib-roles", "role", role],
  users: (params) => ["calibration", "users", params],
  user: (id) => ["calibration", "user", id],
  userOptions: (params) => ["calibration", "user-options", params]
};

function toInvalidationEntries(invalidate) {
  if (!invalidate) return [];
  return Array.isArray(invalidate) ? invalidate : [invalidate];
}

function buildMutationFeedback(queryClient, invalidate, fallbackSuccess, fallbackError) {
  return {
    onSuccess: (response) => {
      toInvalidationEntries(invalidate).forEach((entry) => {
        queryClient.invalidateQueries({ queryKey: entry });
      });

      notifySuccess(response?.message || fallbackSuccess);
    },
    onError: (error) => {
      notifyError(error?.message || fallbackError);
    }
  };
}

export function useCalibPlans(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.plans(params),
    queryFn: () => getCalibPlans(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCalibPlanFull(id, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.plan(id),
    queryFn: () => getCalibPlanFull(id).then(unwrapData),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateCalibPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalibPlan,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Calibration plan created.", "Failed to create calibration plan.")
  });
}

export function useUpdateCalibPlan(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateCalibPlan(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Calibration plan updated.", "Failed to update calibration plan.")
  });
}

export function useDeleteCalibPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCalibPlan,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Calibration plan deleted.", "Failed to delete calibration plan.")
  });
}

export function useSubmitCalibPlan(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitCalibPlan(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Calibration plan submitted.", "Failed to submit calibration plan.")
  });
}

export function useLockCalibPlan(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lockCalibPlan(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Calibration plan locked.", "Failed to lock calibration plan.")
  });
}

export function useLoadPlanDueEquipments(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => loadPlanDueEquipments(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Due equipments refreshed.", "Failed to refresh due equipments.")
  });
}

export function useUpsertPlanTechnician(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => upsertPlanTechnician(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.plan(id)], "Plan technician saved.", "Failed to save plan technician.")
  });
}

export function useRemovePlanTechnician(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (technicianId) => removePlanTechnician(id, technicianId),
    ...buildMutationFeedback(queryClient, [calibrationKeys.plan(id)], "Plan technician removed.", "Failed to remove plan technician.")
  });
}

export function useSetPlanEquipmentSelected(planId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planEquipmentId, isSelected }) => setPlanEquipmentSelected(planEquipmentId, isSelected),
    ...buildMutationFeedback(queryClient, [calibrationKeys.plan(planId)], "Equipment selection updated.", "Failed to update equipment selection.")
  });
}

export function useUpdatePlanSummaryRemarks(planId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planEquipmentSummaryId, remarks }) => updatePlanSummaryRemarks(planEquipmentSummaryId, remarks),
    ...buildMutationFeedback(queryClient, [calibrationKeys.plan(planId)], "Summary remarks updated.", "Failed to update summary remarks.")
  });
}

export function useApprovePlanStep(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepNo) => approvePlanStep(id, stepNo),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Plan approval recorded.", "Failed to approve plan step.")
  });
}

export function useRevokePlanStep(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepNo) => revokePlanStep(id, stepNo),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.plan(id)], "Plan approval revoked.", "Failed to revoke plan approval.")
  });
}

export function useGeneratePlanPdf(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generatePlanPdf(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.plan(id)], "Plan PDF generated.", "Failed to generate plan PDF.")
  });
}

export function useCalibActuals(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.actuals(params),
    queryFn: () => getCalibActuals(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCalibActualFull(id, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.actual(id),
    queryFn: () => getCalibActualFull(id).then(unwrapData),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateCalibActual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalibActual,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Calibration actual created.", "Failed to create calibration actual.")
  });
}

export function useStartCalibActual(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startCalibActual(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.actual(id)], "Calibration actual started.", "Failed to start calibration actual.")
  });
}

export function useCompleteCalibActual(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeCalibActual(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.actual(id), calibrationKeys.equipments()], "Calibration actual completed.", "Failed to complete calibration actual.")
  });
}

export function useUpsertActualTechnician(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => upsertActualTechnician(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(id)], "Actual technician saved.", "Failed to save actual technician.")
  });
}

export function useRemoveActualTechnician(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (technicianId) => removeActualTechnician(id, technicianId),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(id)], "Actual technician removed.", "Failed to remove actual technician.")
  });
}

export function useReplaceActualEquipments(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => replaceActualEquipments(id, items),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(id)], "Actual equipment list updated.", "Failed to replace actual equipment list.")
  });
}

export function useSetActualEquipmentResult(actualId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actualEquipmentId, payload }) => setActualEquipmentResult(actualEquipmentId, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(actualId)], "Equipment result saved.", "Failed to save equipment result.")
  });
}

export function useUpdateActualSummaryRemarks(actualId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actualEquipmentSummaryId, remarks }) => updateActualSummaryRemarks(actualEquipmentSummaryId, remarks),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(actualId)], "Summary remarks updated.", "Failed to update summary remarks.")
  });
}

export function useApproveActualStep(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepNo) => approveActualStep(id, stepNo),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.actual(id)], "Actual approval recorded.", "Failed to approve actual step.")
  });
}

export function useRevokeActualStep(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepNo) => revokeActualStep(id, stepNo),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.actual(id)], "Actual approval revoked.", "Failed to revoke actual approval.")
  });
}

export function useGenerateActualPdf(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateActualPdf(id),
    ...buildMutationFeedback(queryClient, [calibrationKeys.actual(id)], "Actual PDF generated.", "Failed to generate actual PDF.")
  });
}

export function useEquipments(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.equipments(params),
    queryFn: () => getEquipments(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useEquipment(id, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.equipment(id),
    queryFn: () => getEquipmentById(id).then(unwrapData),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useDueEquipments(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.dueEquipments(params),
    queryFn: () => getDueEquipments(params).then(unwrapData),
    enabled: Boolean(params?.calibMonth && params?.calibYear) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEquipment,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Equipment created.", "Failed to create equipment.")
  });
}

export function useUpdateEquipment(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateEquipment(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.equipment(id)], "Equipment updated.", "Failed to update equipment.")
  });
}

export function useUpdateEquipmentStatus(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentStatus) => updateEquipmentStatus(id, equipmentStatus),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.equipment(id)], "Equipment status updated.", "Failed to update equipment status.")
  });
}

export function useExternals(options = {}) {
  return useQuery({
    queryKey: calibrationKeys.externals,
    queryFn: () => getExternals().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateExternal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExternal,
    ...buildMutationFeedback(queryClient, [calibrationKeys.externals], "External vendor created.", "Failed to create external vendor.")
  });
}

export function useUpdateExternal(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateExternal(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.externals], "External vendor updated.", "Failed to update external vendor.")
  });
}

export function useDeleteExternal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExternal,
    ...buildMutationFeedback(queryClient, [calibrationKeys.externals], "External vendor deleted.", "Failed to delete external vendor.")
  });
}

export function useDefaultLocations(options = {}) {
  return useQuery({
    queryKey: calibrationKeys.defaultLocations,
    queryFn: () => getDefaultLocations().then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateDefaultLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDefaultLocation,
    ...buildMutationFeedback(queryClient, [calibrationKeys.defaultLocations], "Default location created.", "Failed to create default location.")
  });
}

export function useUpdateDefaultLocation(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateDefaultLocation(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.defaultLocations], "Default location updated.", "Failed to update default location.")
  });
}

export function useDeleteDefaultLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDefaultLocation,
    ...buildMutationFeedback(queryClient, [calibrationKeys.defaultLocations], "Default location deleted.", "Failed to delete default location.")
  });
}

export function useSectionPics(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.sectionPics(params),
    queryFn: () => getSectionPics(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateSectionPic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSectionPic,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Section PIC created.", "Failed to create section PIC.")
  });
}

export function useUpdateSectionPic(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateSectionPic(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Section PIC updated.", "Failed to update section PIC.")
  });
}

export function useDeleteSectionPic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSectionPic,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Section PIC deleted.", "Failed to delete section PIC.")
  });
}

export function useCalibRolesByUser(userId, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.calibRolesByUser(userId),
    queryFn: () => getCalibRolesByUser(userId).then(unwrapData),
    enabled: Boolean(userId) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCalibRoleUsers(role, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.calibRoleUsers(role),
    queryFn: () => getCalibRoleUsers(role).then(unwrapData),
    enabled: Boolean(role) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useAssignCalibRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignCalibRole,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Calibration role assigned.", "Failed to assign calibration role.")
  });
}

export function useRevokeCalibRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeCalibRole,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "Calibration role revoked.", "Failed to revoke calibration role.")
  });
}

export function useUsers(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.users(params),
    queryFn: () => getUsers(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useUser(id, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.user(id),
    queryFn: () => getUserById(id).then(unwrapData),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useUserOptions(params, options = {}) {
  return useQuery({
    queryKey: calibrationKeys.userOptions(params),
    queryFn: () => getUserOptions(params).then(unwrapData),
    staleTime: STALE_TIME,
    ...options
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "User created.", "Failed to create user.")
  });
}

export function useUpdateUser(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.user(id)], "User updated.", "Failed to update user.")
  });
}

export function useResetUserPassword(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resetUserPassword(id, payload),
    ...buildMutationFeedback(queryClient, [calibrationKeys.root, calibrationKeys.user(id)], "Password reset completed.", "Failed to reset password.")
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    ...buildMutationFeedback(queryClient, [calibrationKeys.root], "User deleted.", "Failed to delete user.")
  });
}

export function useSendDueDateReminders() {
  return useMutation({
    mutationFn: sendDueDateReminders,
    onSuccess: (response) => {
      notifySuccess(response?.message || "Reminder dispatch completed.");
    },
    onError: (error) => {
      notifyError(error?.message || "Failed to send due date reminders.");
    }
  });
}
