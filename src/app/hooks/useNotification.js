import { notifyError, notifyInfo, notifySuccess, notifyWarning } from "app/utils/notify";

export default function useNotification() {
  return {
    success: notifySuccess,
    error: notifyError,
    info: notifyInfo,
    warning: notifyWarning
  };
}
