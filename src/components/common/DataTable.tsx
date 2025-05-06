"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
} from "@mui/material";

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: PagedResultResponseDTO<T>; // Updated to use PagedResultResponseDTO
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string | number;
  error?: string | null;
  onPageChange: (page: number) => void; // Callback for page change
  onRowsPerPageChange: (rowsPerPage: number) => void; // Callback for rows per page change
}

export interface PagedResultResponseDTO<T> {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  items: T[];
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  getRowId,
  error = null,
  onPageChange,
  onRowsPerPageChange,
}: DataTableProps<T>) {
  const { items, totalCount, pageSize, pageNumber } = data;

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  if (loading && (!items || items.length === 0)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow
                hover
                tabIndex={-1}
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={
                  onRowClick
                    ? {
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                      }
                    : {}
                }
              >
                {columns.map((column) => {
                  const value = (row as any)[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value, row) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={pageNumber - 1} // Convert 1-based pageNumber to 0-based for TablePagination
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}
