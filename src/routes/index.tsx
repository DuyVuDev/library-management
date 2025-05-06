"use client";

import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { UserRole } from "../types/user";

// Pages
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Users from "../pages/Users";
import Books from "../pages/Books";
import Categories from "../pages/Categories";
import Requests from "../pages/Requests";

import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import { useAuth } from "../hooks/useAuth";

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard - accessible to all authenticated users */}
          <Route path="/" element={<Dashboard />} />

          {/* Admin-only routes */}
          <Route
            element={
              <RoleProtectedRoute
                requiredRole={UserRole.Admin}
                redirectTo="/"
              />
            }
          >
            <Route path="/users" element={<Users />} />
          </Route>

          {/* SuperUser and Admin routes */}
          <Route
            element={
              <RoleProtectedRoute
                requiredRole={UserRole.SuperUser}
                redirectTo="/"
              />
            }
          >
            <Route path="/categories" element={<Categories />} />
          </Route>

          {/* Routes accessible to all authenticated users */}
          <Route path="/books" element={<Books />} />
          <Route path="/requests" element={<Requests />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
