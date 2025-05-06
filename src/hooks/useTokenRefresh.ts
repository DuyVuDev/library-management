"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { getTokenRemainingTime } from "../utils/token-utils";

// This hook will automatically refresh the token before it expires
export const useTokenRefresh = () => {
  const { token, refreshAccessToken } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // If there's no token, don't set up a refresh
    if (!token) return;

    // Get the remaining time of the token in seconds
    const remainingTime = getTokenRemainingTime(token);

    // If the token is about to expire (less than 5 minutes remaining),
    // refresh it immediately
    if (remainingTime < 300) {
      refreshAccessToken();
      return;
    }

    // Otherwise, set up a timeout to refresh the token 5 minutes before it expires
    const timeToRefresh = (remainingTime - 300) * 1000; // Convert to milliseconds

    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, timeToRefresh);

    // Clean up the timeout when the component unmounts or the token changes
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token, refreshAccessToken]);
};
