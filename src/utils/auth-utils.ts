import { UserRole } from "../types/user";

// Check if user has required role
export const hasRole = (
  userRole: string | undefined,
  requiredRole: UserRole
): boolean => {
  if (!userRole) return false;

  // Convert string role to number if needed
  const userRoleValue: UserRole = UserRole[userRole as keyof typeof Gender];

  return userRoleValue >= requiredRole;
};

// Check if user is admin
export const isAdmin = (userRole: string | undefined): boolean => {
  return hasRole(userRole, UserRole.Admin);
};

// Check if user is super user or higher
export const isSuperUserOrHigher = (userRole: string | undefined): boolean => {
  return hasRole(userRole, UserRole.SuperUser);
};

// Check if user is a regular user or higher
export const isUser = (userRole: string | undefined): boolean => {
  return hasRole(userRole, UserRole.User);
};
