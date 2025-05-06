"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import api from "../services/api";
import {
  type UserResponseDTO,
  type CreateUserRequestDTO,
  type UpdateUserRequestDTO,
  GenderType,
  UserRole,
} from "../types/user";
import { PagedResultResponseDTO } from "../types/pagination";
import { Column, DataTable } from "../components/common/DataTable";

const Users = () => {
  const [usersData, setUsersData] = useState<
    PagedResultResponseDTO<UserResponseDTO>
  >({
    items: [],
    totalCount: 0,
    pageSize: 5,
    pageNumber: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [formData, setFormData] = useState<
    CreateUserRequestDTO | UpdateUserRequestDTO
  >({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: GenderType.Male,
    dateOfBirth: new Date().toISOString().split("T")[0],
    address: "",
    role: UserRole.User,
  });

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

  const validateForm = useCallback(() => {
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
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<PagedResultResponseDTO<UserResponseDTO>>(
        "/users/paged",
        {
          params: {
            pageNumber: usersData.pageNumber,
            pageSize: usersData.pageSize,
            UserRole: selectedRole || undefined,
          },
        }
      );
      setUsersData(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [usersData.pageNumber, usersData.pageSize, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = useCallback((newPage: number) => {
    setUsersData((prev) => ({ ...prev, pageNumber: newPage + 1 })); // Convert zero-based to one-based
  }, []);

  const handleRowsPerPageChange = useCallback((newPageSize: number) => {
    setUsersData((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 1 })); // Reset to first page
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name as string]: value,
      }));
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      if (!validateForm()) {
        return; // Stop submission if validation fails
      }

      setLoading(true);
      setError("");

      if (editingUser) {
        // Update existing user - use UpdateUserRequestDTO
        const updateData = formData as UpdateUserRequestDTO;

        await api.put(`/users/${editingUser.id}`, updateData);
        setNotification({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        // Create new user - use CreateUserRequestDTO
        const createData = formData as CreateUserRequestDTO;

        await api.post("/users", createData);
        setNotification({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      console.error("Error saving user:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Error saving user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, editingUser, fetchUsers, handleCloseDialog, formData]);

  const handleOpenDialog = useCallback(
    (user: UserResponseDTO | null = null) => {
      if (user) {
        setEditingUser(user);
        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          remainingRequests: user.remainingRequests,
          address: user.address || "",
          role: user.role,
        });
      } else {
        setEditingUser(null);
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          password: "",
          phoneNumber: "",
          gender: GenderType.Male,
          dateOfBirth: new Date().toISOString().split("T")[0],
          address: "",
          role: UserRole.User,
        });
      }
      setOpenDialog(true);
    },
    []
  );

  const handleDeleteUser = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        try {
          await api.delete(`/users/${id}`);
          fetchUsers();
          setNotification({
            open: true,
            message: "User deleted successfully",
            severity: "success",
          });
        } catch (err: any) {
          console.error("Error deleting user:", err);
          setNotification({
            open: true,
            message: err.response?.data?.message || "Error deleting user",
            severity: "error",
          });
        }
      }
    },
    [fetchUsers]
  );

  const columns: Column<UserResponseDTO>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Name",
        format: (_, row) => `${row.firstName} ${row.lastName}`,
      },
      { id: "userName", label: "Username" },
      { id: "email", label: "Email" },
      { id: "phoneNumber", label: "Phone Number" },
      {
        id: "gender",
        label: "Gender",
        format: (value) =>
          value === GenderType.Male
            ? "Male"
            : value === GenderType.Female
            ? "Female"
            : "Other",
      },
      {
        id: "dateOfBirth",
        label: "Date of Birth",
        format: (value) => new Date(value).toLocaleDateString(),
      },
      { id: "remainingRequests", label: "Remaining Requests" },
      {
        id: "role",
        label: "Role",
        format: (value) => (
          <Chip
            label={
              value === UserRole.Admin
                ? "Admin"
                : value === UserRole.SuperUser
                ? "Super User"
                : "User"
            }
            color={
              value === UserRole.Admin
                ? "primary"
                : value === UserRole.SuperUser
                ? "secondary"
                : "default"
            }
            size="small"
          />
        ),
      },
      {
        id: "actions",
        label: "Actions",
        align: "right",
        format: (_, row) => (
          <>
            <IconButton onClick={() => handleOpenDialog(row)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteUser(row.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [handleOpenDialog, handleDeleteUser]
  );

  const memoizedTable = useMemo(() => {
    return (
      <DataTable
        columns={columns}
        data={usersData}
        loading={loading}
        error={error}
        emptyMessage="No users found."
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        getRowId={(row) => row.id}
      />
    );
  }, [
    columns,
    usersData,
    loading,
    error,
    handlePageChange,
    handleRowsPerPageChange,
  ]);

  return (
    <>
      <Typography variant="h4">Users</Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3,
        }}
      >
        <TextField
          label="Role"
          variant="outlined"
          size="small"
          sx={{ width: "15%" }}
          select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <MenuItem value="">Select role</MenuItem>
          <MenuItem value={UserRole.User}>User</MenuItem>
          <MenuItem value={UserRole.SuperUser}>Super User</MenuItem>
          <MenuItem value={UserRole.Admin}>Admin</MenuItem>
        </TextField>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {memoizedTable}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors?.firstName}
            helperText={errors?.firstName}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors?.lastName}
            helperText={errors?.lastName}
          />
          <TextField
            margin="dense"
            name="userName"
            label="Username"
            type="text"
            fullWidth
            value={formData.userName}
            onChange={handleInputChange}
            error={!!errors?.userName}
            helperText={errors?.userName}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors?.email}
            helperText={errors?.email}
          />
          {!editingUser && (
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={(formData as CreateUserRequestDTO).password}
              onChange={handleInputChange}
              required
              error={!!errors?.password}
              helperText={errors?.password}
            />
          )}
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={!!errors?.phoneNumber}
            helperText={errors?.phoneNumber}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              name="gender"
              value={formData.gender}
              onChange={handleSelectChange}
              label="Gender"
            >
              <MenuItem value={GenderType.Male}>Male</MenuItem>
              <MenuItem value={GenderType.Female}>Female</MenuItem>
              <MenuItem value={GenderType.Other}>Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            fullWidth
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!errors?.dateOfBirth}
            helperText={errors?.dateOfBirth}
          />
          {editingUser && (
            <TextField
              margin="dense"
              name="remainingRequests"
              label="Remaining Requests"
              type="number"
              fullWidth
              value={(formData as UpdateUserRequestDTO).remainingRequests}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          )}
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={handleInputChange}
            error={!!errors?.address}
            helperText={errors?.address}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              label="Role"
            >
              <MenuItem value={UserRole.User}>User</MenuItem>
              <MenuItem value={UserRole.SuperUser}>Super User</MenuItem>
              <MenuItem value={UserRole.Admin}>Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Users;
