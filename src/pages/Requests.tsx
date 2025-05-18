"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { requestService } from "../services/requestService";
import {
  type BookBorrowingRequestResponseDTO,
  type BookBorrowingRequestDetailResponseDTO,
  RequestStatus,
  ConfirmBookBorrowingRequestDTO,
  BookActionRequestApprovalDTO,
  BookActionRequestDTO,
  BorrowingStatus,
} from "../types/bookRequest";
import { useAuth } from "../hooks/useAuth";
import { DataTable, type Column } from "../components/common/DataTable";
import { StatusChip } from "../components/common/StatusChip";
import {
  Notification,
  type NotificationState,
} from "../components/common/Notification";
import { BookRequestDetails } from "../components/requests/BookRequestDetails";
import { BookDetailView } from "../components/requests/BookDetailView";
import { formatDate } from "../utils/format-utils";

import { isSuperUserOrHigher } from "../utils/auth-utils";
import { PagedResultResponseDTO } from "../types/pagination";

const Requests = () => {
  const { user } = useAuth();
  const [requestsData, setRequestsData] = useState<
    PagedResultResponseDTO<BookBorrowingRequestResponseDTO>
  >({
    items: [],
    totalCount: 0,
    pageSize: 5,
    pageNumber: 1,
  });
  const [details, setDetails] = useState<
    BookBorrowingRequestDetailResponseDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<BookBorrowingRequestResponseDTO | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<BookBorrowingRequestDetailResponseDTO | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookDetailOpen, setBookDetailOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequestStatus, setSelectedRequestStatus] =
    useState<string>("");
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = isSuperUserOrHigher(user?.role)
        ? await requestService.getPagedRequests({
            pageNumber: requestsData.pageNumber,
            pageSize: requestsData.pageSize,
            RequestStatus: selectedRequestStatus,
          })
        : await requestService.getMyPagedRequests({
            pageNumber: requestsData.pageNumber,
            pageSize: requestsData.pageSize,
            RequestStatus: selectedRequestStatus,
          });
      setRequestsData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch book requests:", err);
      setError("Failed to load book requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [
    requestsData.pageNumber,
    requestsData.pageSize,
    user?.role,
    selectedRequestStatus,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchRequestDetails = useCallback(async (requestId: string) => {
    try {
      const data = await requestService.getRequestDetailsByRequestId(requestId);
      setDetails(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch book request details:", err);
      setError("Failed to load book request details. Please try again later.");
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setRequestsData((prev) => ({ ...prev, pageNumber: newPage + 1 })); // Convert zero-based to one-based
  }, []);

  const handleRowsPerPageChange = useCallback((newPageSize: number) => {
    setRequestsData((prev) => ({
      ...prev,
      pageSize: newPageSize,
      pageNumber: 1,
    })); // Reset to first page
  }, []);

  const handleConfirmRequest = async (
    requestId: string,
    status: RequestStatus
  ) => {
    if (!user?.id) {
      setError("You must be logged in to confirm requests");
      return;
    }

    try {
      setConfirmLoading(true);
      const confirmRequest: ConfirmBookBorrowingRequestDTO = {
        bookRequestId: requestId,
        confirmerId: user.id,
        requestStatus: status,
      };

      await requestService.confirmRequest(confirmRequest);
      fetchRequests();
      if (selectedRequest?.id === requestId) {
        handleCloseDetails();
      }
      setNotification({
        open: true,
        message:
          status === RequestStatus.Approved
            ? "Request approved successfully"
            : "Request rejected",
        severity: status === RequestStatus.Approved ? "success" : "info",
      });
    } catch (err) {
      console.error("Failed to confirm request:", err);
      setNotification({
        open: true,
        message: "Failed to confirm request. Please try again.",
        severity: "error",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewDetails = (request: BookBorrowingRequestResponseDTO) => {
    fetchRequestDetails(request.id);
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRequest(null);
  };

  const handleViewBookDetail = (
    details: BookBorrowingRequestDetailResponseDTO
  ) => {
    setSelectedDetail(details);
    setBookDetailOpen(true);
  };

  const handleCloseBookDetail = () => {
    fetchRequestDetails(selectedRequest?.id);
    setBookDetailOpen(false);
    setSelectedDetail(null);
  };

  const handleBookAction = async (isReturn: boolean) => {
    if (!selectedDetail || !user?.id) return;

    try {
      setActionLoading(true);
      const actionRequest: BookActionRequestDTO = {
        bookBorrowingRequestId: selectedDetail.bookBorrowingRequestId,
        bookId: selectedDetail.bookId,
        isReturningBook: isReturn,
      };

      await requestService.requestBookAction(actionRequest);

      // Refresh the data
      if (selectedRequest) {
        const updatedRequest = await requestService.getRequestById(
          selectedRequest.id
        );
        setSelectedRequest(updatedRequest);

        // Update the selected detail with the new data
        const updatedDetail = details.find((d) => d.id === selectedDetail.id);
        if (updatedDetail) {
          setSelectedDetail(updatedDetail);
        }
      }

      setNotification({
        open: true,
        message: isReturn
          ? "Return request submitted"
          : "Renewal request submitted",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to process book action:", err);
      setNotification({
        open: true,
        message: "Failed to process request",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAction = async (approve: boolean) => {
    if (!selectedDetail || !user?.id) return;

    try {
      setActionLoading(true);
      const approvalRequest: BookActionRequestApprovalDTO = {
        bookBorrowingRequestId: selectedDetail.bookBorrowingRequestId,
        bookId: selectedDetail.bookId,
        approverId: user.id,
        approve: approve,
      };

      await requestService.approveBookAction(approvalRequest);

      // Refresh the data
      if (selectedRequest) {
        const updatedRequest = await requestService.getRequestById(
          selectedRequest.id
        );
        setSelectedRequest(updatedRequest);

        // Update the selected detail with the new data
        const updatedDetail = details.find((d) => d.id === selectedDetail.id);
        if (updatedDetail) {
          setSelectedDetail(updatedDetail);
        }
      }

      setNotification({
        open: true,
        message: approve ? "Action approved" : "Action rejected",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to approve/reject action:", err);
      setNotification({
        open: true,
        message: "Failed to process approval",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<BookBorrowingRequestResponseDTO>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Request ID",
        format: (value) => value.substring(0, 8) + "...",
      },
      { id: "borrower", label: "Borrower" },
      {
        id: "requestedDate",
        label: "Requested Date",
        format: (value) => formatDate(value),
      },
      {
        id: "requestStatus",
        label: "Status",
        format: (value) => <StatusChip status={value} type="request" />,
      },
      {
        id: "confirmer",
        label: "Confirmed By",
        format: (value) => value || "N/A",
      },
      {
        id: "bookCount",
        label: "Book Count",
        format: (value) => (value ? value : 0),
      },
      {
        id: "actions",
        label: "Actions",
        align: "right",
        format: (_, row) => (
          <>
            <Tooltip title="View Details">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(row);
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            {row.requestStatus === RequestStatus.Waiting &&
              isSuperUserOrHigher(user?.role) && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmRequest(row.id, RequestStatus.Approved);
                      }}
                      disabled={confirmLoading}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmRequest(row.id, RequestStatus.Rejected);
                      }}
                      disabled={confirmLoading}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
          </>
        ),
      },
    ],
    [confirmLoading]
  );

  const memoizedTable = useMemo(() => {
    return (
      <DataTable
        columns={columns}
        data={requestsData}
        loading={loading}
        error={error}
        emptyMessage="No book requests found."
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        getRowId={(row) => row.id}
      />
    );
  }, [
    columns,
    requestsData,
    loading,
    error,
    handlePageChange,
    handleRowsPerPageChange,
  ]);

  return (
    <>
      <Typography variant="h4">Book Borrowing Requests</Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          label="Request Status"
          variant="outlined"
          size="small"
          sx={{ width: "15%" }}
          select
          value={selectedRequestStatus}
          onChange={(e) => setSelectedRequestStatus(e.target.value)}
        >
          <MenuItem value="">Select status</MenuItem>
          <MenuItem value={RequestStatus.Waiting}>Waiting</MenuItem>
          <MenuItem value={RequestStatus.Approved}>Approved</MenuItem>
          <MenuItem value={RequestStatus.Rejected}>Rejected</MenuItem>
        </TextField>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchRequests} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {memoizedTable}

      {/* Request Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Book Borrowing Request Details</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <BookRequestDetails
              request={selectedRequest}
              details={details || []}
              onViewBookDetail={handleViewBookDetail}
            />
          )}
        </DialogContent>
        <DialogActions>
          {selectedRequest?.requestStatus === RequestStatus.Waiting &&
            isSuperUserOrHigher(user?.role) && (
              <>
                <Button
                  onClick={() =>
                    handleConfirmRequest(
                      selectedRequest.id,
                      RequestStatus.Approved
                    )
                  }
                  color="success"
                  variant="contained"
                  disabled={confirmLoading}
                >
                  Approve Request
                </Button>
                <Button
                  onClick={() =>
                    handleConfirmRequest(
                      selectedRequest.id,
                      RequestStatus.Rejected
                    )
                  }
                  color="error"
                  variant="contained"
                  disabled={confirmLoading}
                >
                  Reject Request
                </Button>
              </>
            )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Book Detail Dialog */}
      <Dialog
        open={bookDetailOpen}
        onClose={handleCloseBookDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Book Borrowing Detail</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDetail && <BookDetailView detail={selectedDetail} />}
        </DialogContent>
        <DialogActions>
          {selectedDetail &&
            !isSuperUserOrHigher(user?.role) &&
            selectedDetail.borrowingStatus === BorrowingStatus.Borrowing && (
              <>
                <Button
                  onClick={() => handleBookAction(true)}
                  color="primary"
                  variant="contained"
                  disabled={actionLoading}
                >
                  Request Return
                </Button>
                <Button
                  onClick={() => handleBookAction(false)}
                  color="secondary"
                  variant="contained"
                  disabled={actionLoading || selectedDetail.isDueDateRenewed}
                >
                  Request Renewal
                </Button>
              </>
            )}
          {selectedDetail &&
            (selectedDetail.borrowingStatus ===
              BorrowingStatus.WaitingForReturnApproval ||
              selectedDetail.borrowingStatus ===
                BorrowingStatus.WaitingForRenewalApproval) &&
            isSuperUserOrHigher(user?.role) && (
              <>
                <Button
                  onClick={() => handleApproveAction(true)}
                  color="success"
                  variant="contained"
                  disabled={actionLoading}
                >
                  Approve Action
                </Button>
                <Button
                  onClick={() => handleApproveAction(false)}
                  color="error"
                  variant="contained"
                  disabled={actionLoading}
                >
                  Reject Action
                </Button>
              </>
            )}
          <Button onClick={() => handleCloseBookDetail()}>Close</Button>
        </DialogActions>
      </Dialog>

      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </>
  );
};

export default Requests;
