export const userRoles = ["employee", "cofounder", "owner"] as const;

export type UserRole = (typeof userRoles)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole);
}

export function normalizeUserRole(value: unknown): UserRole {
  return isUserRole(value) ? value : "employee";
}

export function canManageRecords(role: string) {
  return role === "owner" || role === "cofounder";
}

export function roleLabel(role: string) {
  if (role === "cofounder") return "Co-founder";
  if (role === "owner") return "Owner";
  return "Employee";
}