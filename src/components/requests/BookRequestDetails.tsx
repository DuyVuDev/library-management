"use client";

import type React from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  type BookBorrowingRequestResponseDTO,
  type BookBorrowingRequestDetailResponseDTO,
} from "../../types/bookRequest";
import { DetailCard, DetailItem } from "../common/DetailCard";
import { StatusChip } from "../common/StatusChip";
import { formatDate } from "../../utils/format-utils";
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

interface BookRequestDetailsProps {
  request: BookBorrowingRequestResponseDTO;
  details: BookBorrowingRequestDetailResponseDTO[];
  onViewBookDetail: (detail: BookBorrowingRequestDetailResponseDTO) => void;
}

export const BookRequestDetails: React.FC<BookRequestDetailsProps> = ({
  request,
  details,
  onViewBookDetail,
}) => {
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <DetailCard
              title="Borrower Information"
              icon={<PersonIcon color="primary" />}
            >
              <DetailItem
                label="Name"
                value={request.borrower}
                gutterBottom={false}
              />
            </DetailCard>
          </Box>
          <Box sx={{ flex: 1 }}>
            <DetailCard
              title="Request Information"
              icon={<CalendarIcon color="primary" />}
            >
              <DetailItem label="Request ID" value={request.id} />
              <DetailItem
                label="Requested Date"
                value={formatDate(request.requestedDate)}
                gutterBottom={false}
              />
            </DetailCard>
          </Box>
        </Box>
        <Box sx={{ width: "100%" }}>
          <DetailCard
            title="Confirmation Information"
            icon={<PersonIcon color="secondary" />}
          >
            <DetailItem
              label="Confirmed By"
              value={request.confirmer || "Not confirmed yet"}
            />
          </DetailCard>
        </Box>
      </Box>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <BookIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Requested Books</Typography>
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Book Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Renewed</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details &&
                details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>{detail.bookTitle}</TableCell>
                    <TableCell>
                      <StatusChip
                        status={detail.borrowingStatus}
                        type="borrowing"
                      />
                    </TableCell>
                    <TableCell>{formatDate(detail.dueDate)}</TableCell>
                    <TableCell>
                      {detail.isDueDateRenewed ? "Yes" : "No"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Book Details">
                        <IconButton
                          size="small"
                          onClick={() => onViewBookDetail(detail)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
