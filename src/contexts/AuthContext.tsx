"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { extractUserFromToken } from "../utils/jwt-utils";
import type {
  SignUpRequestDTO,
  ChangePasswordRequestDTO,
  LogInRequestDTO,
  RefreshTokenRequestDTO,
  User,
  UpdateProfileRequestDTO,
} from "../types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userNameOrEmail: string, password: string) => Promise<void>;
  signup: (signupData: SignUpRequestDTO) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  changePassword: (data: ChangePasswordRequestDTO) => Promise<void>;
  updateProfile: (data: UpdateProfileRequestDTO) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to set user from token
  const setUserFromToken = (accessToken: string) => {
    const extractedUser = extractUserFromToken(accessToken);
    if (extractedUser) {
      setUser({
        id: extractedUser.id,
        userName: extractedUser.userName,
        firstName: extractedUser.firstName,
        lastName: extractedUser.lastName,
        email: extractedUser.email,
        phoneNumber: extractedUser.phoneNumber,
        gender: extractedUser.gender,
        dateOfBirth: extractedUser.dateOfBirth,
        address: extractedUser.address,
        role: extractedUser.role,
      });
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set user from token instead of making an API call
          setUserFromToken(token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (error) {
          console.error("Failed to load user from token:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (userNameOrEmail: string, password: string) => {
    try {
      const loginData: LogInRequestDTO = {
        userNameOrEmail,
        password,
      };

      const response = await api.post("/auth/login", loginData);
      const { token: accessToken, refreshToken: newRefreshToken } =
        response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setToken(accessToken);
      setRefreshToken(newRefreshToken);

      // Extract user info from token
      setUserFromToken(accessToken);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (signupData: SignUpRequestDTO) => {
    try {
      const response = await api.post("/auth/signup", signupData);
      const { token: accessToken, refreshToken: newRefreshToken } =
        response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setToken(accessToken);
      setRefreshToken(newRefreshToken);

      // Extract user info from token
      setUserFromToken(accessToken);

      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    // 1. First clear localStorage

    // 2. Send logout request to the API
    try {
      // Store the token temporarily for the logout request
      await api.post("/auth/logout", {});

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
      // Continue with logout even if the API request fails
    } finally {
      // 3. Set all auth-related state variables to null
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      if (!refreshToken) return null;

      // Temporarily remove the Authorization header to avoid using the expired toen
      delete api.defaults.headers.common["Authorization"];

      const refreshData: RefreshTokenRequestDTO = {
        refreshToken,
      };

      const response = await api.post("/auth/refresh-token", refreshData);
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      // Update user information from the new token
      setUserFromToken(newToken);

      return newToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh token is expired or invalid, log the user out
      logout();
      return null;
    }
  };

  const changePassword = async (
    data: ChangePasswordRequestDTO
  ): Promise<void> => {
    try {
      await api.post("/auth/password", data);
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  };

  const updateProfile = async (
    data: UpdateProfileRequestDTO
  ): Promise<void> => {
    try {
      await api.post("/auth/profile", data);

      // Update the user state with the new data
      if (user) {
        setUser({
          ...user,
          ...data,
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshAccessToken,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
