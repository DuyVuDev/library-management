"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Book as BookIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LibraryBooks as LibraryBooksIcon,
} from "@mui/icons-material";

import { requestService } from "../services/requestService";
import { isSuperUserOrHigher } from "../utils/auth-utils";
import { StatusChip } from "../components/common/StatusChip";

import { useNavigate } from "react-router-dom";
import {
  type BookBorrowingRequestResponseDTO,
  type BookBorrowingRequestDetailResponseDTO,
  RequestStatus,
  BorrowingStatus,
} from "../types/bookRequest";
import {
  Notification,
  type NotificationState,
} from "../components/common/Notification";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/format-utils";
import { BookRequestDetails } from "../components/requests/BookRequestDetails";
import { BookDetailView } from "../components/requests/BookDetailView";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingRequests, setWaitingRequests] = useState<
    BookBorrowingRequestResponseDTO[]
  >([]);
  const [selectedRequest, setSelectedRequest] =
    useState<BookBorrowingRequestResponseDTO | null>(null);
  const [waitingActions, setWaitingActions] = useState<
    BookBorrowingRequestDetailResponseDTO[]
  >([]);
  const [details, setDetails] = useState<
    BookBorrowingRequestDetailResponseDTO[]
  >([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookDetailOpen, setBookDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<BookBorrowingRequestDetailResponseDTO | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For admin and super users, fetch waiting requests and actions
      if (isSuperUserOrHigher(user?.role)) {
        const [waitingRequestsData, waitingActionsData] = await Promise.all([
          requestService.getWaitingRequests(),
          requestService.getWaitingActionRequests(),
        ]);
        setWaitingRequests(waitingRequestsData);
        setWaitingActions(waitingActionsData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    setBookDetailOpen(false);
    setSelectedDetail(null);
  };

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
      await requestService.confirmRequest({
        bookRequestId: requestId,
        confirmerId: user.id,
        requestStatus: status,
      });

      fetchDashboardData();

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

  const handleApproveAction = async (
    requestId: string,
    bookId: string,
    approve: boolean
  ) => {
    if (!user?.id) return;

    try {
      setActionLoading(true);
      await requestService.approveBookAction({
        bookBorrowingRequestId: requestId,
        bookId: bookId,
        approverId: user.id,
        approve: approve,
      });

      fetchDashboardData();

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

  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName || user?.userName}!
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* User View - Book Borrowing Interface */}
        {user?.role == "User" && (
          <Box
            sx={{ p: 3, mb: 3, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BookIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Borrow Books</Typography>
            </Box>
            <Typography variant="h2" paragraph>
              Rules
            </Typography>
            <Typography variant="subtitle1" paragraph color="error">
              You can only borrow up to 5 books in a request
            </Typography>
            <Typography variant="subtitle1" paragraph color="error">
              You can make up to 3 requests a month
            </Typography>
            <Button
              variant="contained"
              startIcon={<LibraryBooksIcon />}
              onClick={() => navigate("/books")}
            >
              Browse Books
            </Button>
          </Box>
        )}

        {/* Admin/SuperUser - Waiting Requests */}
        {isSuperUserOrHigher(user?.role) && (
          <Box
            sx={{
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 1,
              flex: "0 0 48%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Waiting Approval Requests</Typography>
            </Box>

            {waitingRequests.length === 0 ? (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                No waiting requests to approve.
              </Typography>
            ) : (
              <List>
                {waitingRequests.map((request) => (
                  <Box key={request.id}>
                    <ListItem
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleViewDetails(request)}
                      secondaryAction={
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmRequest(
                                  request.id,
                                  RequestStatus.Approved
                                );
                              }}
                              disabled={confirmLoading}
                              sx={{ mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmRequest(
                                  request.id,
                                  RequestStatus.Rejected
                                );
                              }}
                              disabled={confirmLoading}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`Request from ${request.borrower}`}
                        secondary={`${formatDate(request.requestedDate)} • ${
                          request.bookCount
                        } book(s)`}
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Box>
        )}

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
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>

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
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Admin/SuperUser - Waiting Actions */}
        {isSuperUserOrHigher(user?.role) && (
          <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BookIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Waiting Book Actions</Typography>
            </Box>

            {waitingActions.length === 0 ? (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                No waiting book actions to approve.
              </Typography>
            ) : (
              <List>
                {waitingActions.map((detail) => (
                  <Box key={detail.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() =>
                                handleApproveAction(
                                  detail.bookBorrowingRequestId,
                                  detail.bookId,
                                  true
                                )
                              }
                              disabled={actionLoading}
                              sx={{ mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleApproveAction(
                                  detail.bookBorrowingRequestId,
                                  detail.bookId,
                                  false
                                )
                              }
                              disabled={actionLoading}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <StatusChip
                            status={detail.borrowingStatus}
                            type="borrowing"
                          />
                        }
                        secondary={
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <span>{detail.bookTitle}</span>
                            <br />
                            <span>
                              Request Id: {detail.bookBorrowingRequestId}
                            </span>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>

      <Notification
        notification={notification}
        onClose={handleCloseNotification}
      />
    </>
  );
};

export default Dashboard;
