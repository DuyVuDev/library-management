"use client";

import type React from "react";

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { GenderType, type SignUpRequestDTO } from "../types/user";

const SignUp = () => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get today's date in YYYY-MM-DD format for max date attribute
  const today = new Date().toISOString().split("T")[0];

  // Form state
  const [formData, setFormData] = useState<SignUpRequestDTO>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: GenderType.Male,
    dateOfBirth: today,
    address: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      gender: "",
      dateOfBirth: "",
      address: "",
    };
    let isValid = true;

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
      isValid = false;
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must not exceed 50 characters.";
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
      isValid = false;
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must not exceed 50 characters.";
      isValid = false;
    }

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required.";
      isValid = false;
    } else if (formData.userName.length < 3 || formData.userName.length > 20) {
      newErrors.userName = "Username must be between 3 and 20 characters.";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Email is not valid.";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      isValid = false;
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.dateOfBirth).setHours(0, 0, 0, 0);
      const currentDate = new Date().setHours(0, 0, 0, 0);
      if (selectedDate >= currentDate) {
        newErrors.dateOfBirth = "Date of birth must be in the past.";
        isValid = false;
      }
    }

    // Address validation
    if (formData.address && formData.address.length > 200) {
      newErrors.address = "Address must not exceed 200 characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup(formData);
    } catch (err: any) {
      setError(err.response?.data || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: "100%",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Create an Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Box>

            <TextField
              fullWidth
              name="userName"
              label="Username"
              value={formData.userName}
              onChange={handleChange}
              error={!!errors.userName}
              helperText={errors.userName}
              sx={{ mb: 3 }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                name="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
              <TextField
                fullWidth
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                type={showPassword ? "text" : "password"}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{ mb: errors.confirmPassword ? 0 : 1 }}
              />
            </Box>
            <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 3 }}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel id="gender-label" shrink>
                  Gender
                </InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value={GenderType.Male}>Male</MenuItem>
                  <MenuItem value={GenderType.Female}>Female</MenuItem>
                  <MenuItem value={GenderType.Other}>Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                inputProps={{
                  max: today,
                }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Box>

            <TextField
              fullWidth
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              multiline
              rows={3}
              sx={{ mb: 3, width: "100%" }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <Button
              fullWidth
              size="large"
              type="submit"
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign up"}
            </Button>

            <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Log In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;
