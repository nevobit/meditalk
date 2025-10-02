export type Role = string;
export type Permission = string;

export interface User {
  id: string;
  roles: Role[];
  permissions?: Permission[];
}

const rolePermissions: Record<Role, Permission[]> = {};

export function grantRolePermission(role: Role, permission: Permission) {
  rolePermissions[role] = [...(rolePermissions[role] ?? []), permission];
}

export function can(user: User, permission: Permission): boolean {
  const userPerms = new Set(user.permissions ?? []);
  for (const role of user.roles) {
    (rolePermissions[role] ?? []).forEach((p) => userPerms.add(p));
  }
  return userPerms.has(permission);
}
