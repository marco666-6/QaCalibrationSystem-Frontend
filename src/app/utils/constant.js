export const topBarHeight = 64;
export const sideNavWidth = 260;
export const navbarHeight = 60;
export const sidenavCompactWidth = 80;
export const containedLayoutWidth = 1200;

export const CALIBRATION_TYPES = ["Internal", "External"];
export const PLAN_STATUSES = ["Draft", "Pending Approval", "Locked"];
export const ACTUAL_STATUSES = ["Wait", "Ongoing", "Completed"];
export const APPROVAL_STATUSES = ["Pending", "Approved"];
export const RESULT_STATUSES = ["Pending", "OK", "NG"];
export const NG_ACTIONS = ["Repair", "Replacement", "Out of Service", "Scrap"];
export const EQUIPMENT_STATUSES = ["Active", "Out of Service", "Scrap"];
export const CALIBRATION_ROLES = ["Preparer", "Checker", "Approver", "Technician"];
export const USER_ROLES = ["SuperAdmin", "Admin", "Manager", "Employee"];
export const SECTION_PIC_ROLES = ["PIC", "Admin"];

export const PLAN_STATUS_COLORS = {
  Draft: "default",
  "Pending Approval": "warning",
  Locked: "success"
};

export const ACTUAL_STATUS_COLORS = {
  Wait: "default",
  Ongoing: "info",
  Completed: "success"
};

export const APPROVAL_STATUS_COLORS = {
  Pending: "warning",
  Approved: "success"
};

export const RESULT_STATUS_COLORS = {
  Pending: "default",
  OK: "success",
  NG: "error"
};

export const EQUIPMENT_STATUS_COLORS = {
  Active: "success",
  "Out of Service": "warning",
  Scrap: "error"
};
