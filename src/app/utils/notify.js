import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

export function notifySuccess(message) {
  toast.success(message, baseOptions);
}

export function notifyError(message) {
  toast.error(message, baseOptions);
}

export function notifyInfo(message) {
  toast.info(message, baseOptions);
}

export function notifyWarning(message) {
  toast.warning(message, baseOptions);
}
