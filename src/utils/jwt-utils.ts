import { User } from "../types/user";

// Function to decode JWT token and extract payload
export const decodeToken = (token: string): any => {
  try {
    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Get the payload part (second part)
    const payload = parts[1];

    // Decode the base64 string
    const decodedPayload = atob(payload);

    // Parse the JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to extract user information from token
export const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.sub,
      userName: decoded.unique_name,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      email: decoded.email,
      phoneNumber:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"
        ],
      gender: decoded.gender,
      dateOfBirth:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/dateofbirth"
        ],
      address:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    };
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};
