// Function to check if a JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Get the expiration time from the token
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds

    // Check if the token is expired
    return Date.now() >= exp;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // If there's an error parsing the token, consider it expired
  }
};

// Function to get the remaining time of a token in seconds
export const getTokenRemainingTime = (token: string): number => {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds

    return Math.max(0, Math.floor((exp - Date.now()) / 1000));
  } catch (error) {
    console.error("Error getting token remaining time:", error);
    return 0;
  }
};
