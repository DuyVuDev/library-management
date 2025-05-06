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
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import api from "../services/api";
import type {
  BookResponseDTO,
  CreateBookRequestDTO,
  UpdateBookRequestDTO,
} from "../types/book";
import type { Category } from "../types/category";
import { DataTable, Column } from "../components/common/DataTable";
import { useAuth } from "../hooks/useAuth";
import requestService from "../services/requestService";

import {
  BookPagedRequestDTO,
  PagedResultResponseDTO,
} from "../types/pagination";

const BookForm = memo(
  ({
    formData,
    editingBook,
    categories,
    categoriesLoading,
    onInputChange,
    onSubmit,
    onClose,
  }: {
    formData: CreateBookRequestDTO | UpdateBookRequestDTO;
    editingBook: BookResponseDTO | null;
    categories: Category[];
    categoriesLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClose: () => void;
  }) => {
    return (
      <>
        <DialogTitle>{editingBook ? "Edit Book" : "Add Book"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={formData.title}
            onChange={onInputChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Author"
            type="text"
            fullWidth
            value={formData.author}
            onChange={onInputChange}
          />
          <TextField
            margin="dense"
            name="publishedDate"
            label="Published Date"
            type="date"
            fullWidth
            value={formData.publishedDate}
            onChange={onInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          {editingBook ? (
            // Show adjustment field when editing
            <TextField
              margin="dense"
              name="adjustment"
              label="Quantity Adjustment"
              type="number"
              fullWidth
              value={(formData as UpdateBookRequestDTO).adjustment}
              onChange={onInputChange}
              helperText="Enter a positive number to add books or a negative number to remove books"
            />
          ) : (
            // Show quantity field when creating
            <TextField
              margin="dense"
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={(formData as CreateBookRequestDTO).quantity}
              onChange={onInputChange}
              inputProps={{ min: 1 }}
              helperText="Initial quantity of books"
            />
          )}
          <TextField
            margin="dense"
            name="categoryId"
            label="Category"
            select
            fullWidth
            value={formData.categoryId}
            onChange={onInputChange}
            disabled={categoriesLoading}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} variant="contained">
            {editingBook ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </>
    );
  }
);

// Add display name for debugging
BookForm.displayName = "BookForm";

// Replace the useCategories hook with direct API calls
const Books = () => {
  const { user } = useAuth();
  const [borrowingBookIds, setBorrowingBookIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [booksData, setBooksData] = useState<
    PagedResultResponseDTO<BookResponseDTO>
  >({
    items: [],
    totalCount: 0,
    pageSize: 5,
    pageNumber: 1,
  });
  const [remainingRequests, setRemainingRequests] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<BookResponseDTO | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for selected category
  const [formData, setFormData] = useState<
    CreateBookRequestDTO | UpdateBookRequestDTO
  >({
    title: "",
    author: "",
    publishedDate: new Date().toISOString().split("T")[0],
    quantity: 1,
    categoryId: "",
  });

  // Add a function to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchBooks = useCallback(async (request: BookPagedRequestDTO) => {
    try {
      setLoading(true);
      const response = await api.get<PagedResultResponseDTO<BookResponseDTO>>(
        "/books/paged",
        { params: request }
      );
      setBooksData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRemainingRequests = useCallback(async () => {
    try {
      const response = await api.get(`/users/${user?.id}`);
      setRemainingRequests(response.data.remainingRequests);
    } catch (err) {
      setError("Failed to fetch user");
      setRemainingRequests(0);
      console.error(err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const request: BookPagedRequestDTO = {
      pageNumber: booksData.pageNumber,
      pageSize: booksData.pageSize,
      searchKeyword: search,
      categoryId: selectedCategory || undefined,
    };
    fetchBooks(request);
  }, [
    booksData.pageNumber,
    booksData.pageSize,
    search,
    selectedCategory,
    fetchBooks,
  ]);

  useEffect(() => {
    getRemainingRequests();
  }, [getRemainingRequests]);

  // Update formData when categories are loaded and formData.categoryId is empty
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId && !editingBook) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }));
    }
  }, [categories, formData.categoryId, editingBook]);

  const handleToggleBorrowing = useCallback((bookId: string) => {
    setBorrowingBookIds((prev) => {
      // debugger;
      if (prev.includes(bookId)) {
        return prev.filter((id) => id !== bookId);
      }
      return [...prev, bookId];
    });
  }, []);

  const handleBorrowBooks = useCallback(async () => {
    try {
      await requestService.borrowBook({
        borrowerId: user?.id || "",
        requestedDate: new Date().toISOString().split("T")[0],
        bookIds: borrowingBookIds,
      });
      setNotification({
        open: true,
        message: "Books borrowed successfully",
        severity: "success",
      });
      getRemainingRequests();
      setBorrowingBookIds([]); // Clear the borrowingBooks state after successful borrowing
    } catch (err: any) {
      console.error("Error borrowing books:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Error borrowing books",
        severity: "error",
      });
    }
  }, [borrowingBookIds]);

  const handleOpenDialog = useCallback(
    (book: BookResponseDTO | null = null) => {
      if (book) {
        setEditingBook(book);
        setFormData({
          title: book.title,
          author: book.author,
          publishedDate: book.publishedDate,
          adjustment: 0, // Default adjustment is 0 when editing
          isDeleted: book.isDeleted,
          categoryId: book.categoryId,
        });
      } else {
        setEditingBook(null);
        setFormData({
          title: "",
          author: "",
          publishedDate: new Date().toISOString().split("T")[0],
          quantity: 1,
          isDeleted: false,
          categoryId: categories.length > 0 ? categories[0].id : "",
        });
      }
      setOpenDialog(true);
    },
    [categories]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "number" ? Number.parseInt(value) : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    try {
      if (editingBook) {
        // Update existing book - use UpdateBookRequestDTO
        const updateData = formData as UpdateBookRequestDTO;
        await api.put(`/books/${editingBook.id}`, updateData);
        setNotification({
          open: true,
          message: "Book updated successfully",
          severity: "success",
        });
        const request: BookPagedRequestDTO = {
          pageNumber: booksData.pageNumber,
          pageSize: booksData.pageSize,
          searchKeyword: search,
          categoryId: selectedCategory || undefined,
        };
        fetchBooks(request);
      } else {
        // Create new book - use CreateBookRequestDTO
        const createData = formData as CreateBookRequestDTO;
        await api.post("/books", createData);
        setNotification({
          open: true,
          message: "Book added successfully",
          severity: "success",
        });
        const request: BookPagedRequestDTO = {
          pageNumber: booksData.pageNumber,
          pageSize: booksData.pageSize,
          searchKeyword: search,
          categoryId: selectedCategory || undefined,
        };
        fetchBooks(request);
      }

      handleCloseDialog();
    } catch (err: any) {
      console.error("Error saving book:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Error saving book",
        severity: "error",
      });
    }
  }, [
    editingBook,
    handleCloseDialog,
    formData,
    booksData.pageNumber,
    booksData.pageSize,
    search,
    selectedCategory,
    fetchBooks,
  ]);

  const handleDeleteBook = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this book?")) {
        try {
          await api.delete(`/books/${id}`);
          const request: BookPagedRequestDTO = {
            pageNumber: booksData.pageNumber,
            pageSize: booksData.pageSize,
            searchKeyword: search,
            categoryId: selectedCategory || undefined,
          };
          fetchBooks(request);
          setNotification({
            open: true,
            message: "Book deleted successfully",
            severity: "success",
          });
        } catch (err: any) {
          console.error("Error deleting book:", err);
          setNotification({
            open: true,
            message: err.response?.data?.message || "Error deleting book",
            severity: "error",
          });
        }
      }
    },
    [fetchBooks]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedCategory(e.target.value);
    },
    []
  );

  const handlePageChange = useCallback((newPage: number) => {
    setBooksData((prev) => ({ ...prev, pageNumber: newPage + 1 })); // Convert zero-based to one-based
  }, []);

  const handleRowsPerPageChange = useCallback((newPageSize: number) => {
    setBooksData((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 1 })); // Reset to first page
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const formatDateValue = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }, []);

  const columns: Column<BookResponseDTO>[] = useMemo(() => {
    const baseColumns: Column<BookResponseDTO>[] = [
      { id: "title", label: "Title" },
      { id: "author", label: "Author" },
      {
        id: "publishedDate",
        label: "Published Date",
        format: (value) => formatDateValue(value as string),
      },
      { id: "categoryName", label: "Category" },
      { id: "quantity", label: "Quantity" },
      {
        id: "availableQuantity",
        label: "Available",
        format: (value, row) => (
          <Chip
            label={`${value} / ${row.quantity}`}
            color={value > 0 ? "success" : "error"}
            size="small"
          />
        ),
      },
    ];

    if (user?.role === "Admin") {
      baseColumns.push({
        id: "actions",
        label: "Actions",
        align: "right",
        format: (_, row) => (
          <>
            <IconButton
              onClick={() => handleOpenDialog(row)}
              disabled={row.isDeleted}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteBook(row.id)}
              disabled={row.isDeleted}
            >
              <DeleteIcon />
            </IconButton>
          </>
        ),
      });
    } else if (user?.role === "User") {
      baseColumns.push({
        id: "actions",
        label: "Actions",
        align: "right",
        format: (_, row) => (
          <Checkbox
            checked={borrowingBookIds.includes(row.id)}
            onChange={() => handleToggleBorrowing(row.id)}
            disabled={
              row.availableQuantity === 0 ||
              (!borrowingBookIds.includes(row.id) &&
                borrowingBookIds.length >= 5) ||
              remainingRequests <= 0
            }
          />
        ),
      });
    }

    return baseColumns;
  }, [
    borrowingBookIds,
    formatDateValue,
    user?.role,
    remainingRequests,
    handleOpenDialog,
    handleDeleteBook,
    handleToggleBorrowing,
  ]);

  const memoizedTable = useMemo(() => {
    return (
      <DataTable
        columns={columns}
        data={booksData}
        loading={loading}
        error={error}
        emptyMessage="No books available"
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        getRowId={(row) => row.id}
      />
    );
  }, [
    columns,
    booksData,
    loading,
    error,
    handlePageChange,
    handleRowsPerPageChange,
  ]);

  if (loading && booksData.items.length === 0) {
    return <Typography>Loading books...</Typography>;
  }

  if (error && booksData.items.length === 0) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Typography variant="h4">Books</Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            placeholder="seach by author/title/category"
            onChange={handleSearchChange}
          />
          <TextField
            label="Category"
            variant="outlined"
            size="small"
            fullWidth
            select
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        {user?.role === "Admin" ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(null)}
          >
            Add Book
          </Button>
        ) : (
          <>
            <Typography variant="subtitle2">
              You have {remainingRequests} request(s) left this month
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleBorrowBooks}
              disabled={borrowingBookIds.length === 0}
            >
              Borrow Books ({borrowingBookIds.length}/5)
            </Button>
          </>
        )}
      </Box>

      {memoizedTable}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <BookForm
          formData={formData}
          editingBook={editingBook}
          categories={categories}
          categoriesLoading={categoriesLoading}
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
    </>
  );
};

export default Books;
