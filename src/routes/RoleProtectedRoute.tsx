"use client";

import { Navigate, Outlet } from "react-router-dom";

import type { UserRole } from "../types/user";
import { hasRole } from "../utils/auth-utils";
import { useAuth } from "../hooks/useAuth";

interface RoleProtectedRouteProps {
  requiredRole: UserRole;
  redirectTo?: string;
}

const RoleProtectedRoute = ({
  requiredRole,
  redirectTo = "/",
}: RoleProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user has the required role
  if (!hasRole(user?.role, requiredRole)) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
