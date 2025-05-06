"use client";

import type React from "react";

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import api from "../services/api";
import type { Category } from "../types/category";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";

// Separate form component to prevent re-renders of the entire Categories component
const CategoryForm = memo(
  ({
    formData,
    editingCategory,
    processing,
    onInputChange,
    onSubmit,
    onClose,
  }: {
    formData: { name: string; description: string };
    editingCategory: Category | null;
    processing: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClose: () => void;
  }) => {
    return (
      <>
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={onInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={onInputChange}
          />
          {editingCategory && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              Note: Changing the category name will update all books in this
              category.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {editingCategory
              ? processing
                ? "Updating..."
                : "Update"
              : processing
              ? "Adding..."
              : "Add"}
          </Button>
        </DialogActions>
      </>
    );
  }
);

// Add display name for debugging
CategoryForm.displayName = "CategoryForm";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [processing, setProcessing] = useState(false);

  // Add direct API calls instead of using context methods
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    try {
      const response = await api.post("/categories", category);
      setCategories((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error("Failed to add category:", err);
      throw err;
    }
  }, []);

  const updateCategory = useCallback(
    async (id: string, category: Omit<Category, "id">) => {
      try {
        await api.put(`/categories/${id}`, category);

        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...category } : cat))
        );
      } catch (err) {
        console.error("Failed to update category:", err);
        throw err;
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  }, []);

  const handleOpenDeleteDialog = (id: string) => {
    setDeleteCategoryId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteCategoryId(null);
  };

  // Call fetchCategories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

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

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  // Update the handleSubmit function to use the local methods
  const handleSubmit = useCallback(async () => {
    try {
      setProcessing(true);
      if (editingCategory) {
        // Check if the category name has changed
        const nameChanged = editingCategory.name !== formData.name;

        // Update existing category
        await updateCategory(editingCategory.id, formData);

        if (nameChanged) {
          setNotification({
            open: true,
            message:
              "Category updated and all associated books have been updated",
            severity: "success",
          });
        } else {
          setNotification({
            open: true,
            message: "Category updated successfully",
            severity: "success",
          });
        }
      } else {
        // Create new category
        await addCategory(formData);
        setNotification({
          open: true,
          message: "Category added successfully",
          severity: "success",
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving category:", err);
      setNotification({
        open: true,
        message: "Failed to save category",
        severity: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [
    editingCategory,
    formData,
    updateCategory,
    addCategory,
    handleCloseDialog,
  ]);

  // Update the handleDeleteCategory function to use the local method
  const handleConfirmDelete = async () => {
    if (!deleteCategoryId) return;

    try {
      setProcessing(true);
      await deleteCategory(deleteCategoryId);
      setNotification({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting category:", err);
      setNotification({
        open: true,
        message: "Failed to delete category. It may be in use by books.",
        severity: "error",
      });
    } finally {
      setProcessing(false);
      handleCloseDeleteDialog();
    }
  };
  // Update the handleRefresh function to use the local method
  const handleRefresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoriesTable = useMemo(() => {
    const handleOpenDialogMemoized = (category: Category | null = null) => {
      if (category) {
        setEditingCategory(category);
        setFormData({
          name: category.name,
          description: category.description,
        });
      } else {
        setEditingCategory(null);
        setFormData({
          name: "",
          description: "",
        });
      }
      setOpenDialog(true);
    };

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialogMemoized(category)}
                    disabled={processing}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenDeleteDialog(category.id)}
                    disabled={processing}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [categories, processing, setEditingCategory, setFormData, setOpenDialog]);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading && categories.length === 0) {
    return <Typography>Loading categories...</Typography>;
  }

  if (error && categories.length === 0) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Categories</Typography>
        <Box>
          <IconButton
            onClick={handleRefresh}
            sx={{ mr: 1 }}
            disabled={processing}
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={processing}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {categoriesTable}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <CategoryForm
          formData={formData}
          editingCategory={editingCategory}
          processing={processing}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={handleCloseDialog}
        />
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        processing={processing}
        message="Are you sure you want to delete this category? All books in this category will be uncategorized."
      />
    </>
  );
};

export default Categories;
