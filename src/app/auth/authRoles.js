export const authRoles = {
  sa: ["SuperAdmin"],
  admin: ["SuperAdmin", "Admin"],
  editor: ["SuperAdmin", "Admin", "Manager"],
  guest: ["SuperAdmin", "Admin", "Manager", "Employee"]
};
