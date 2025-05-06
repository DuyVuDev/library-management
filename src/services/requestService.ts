import api from "./api";
import type {
  BookBorrowingRequestResponseDTO,
  BookBorrowingRequestDetailResponseDTO,
  BorrowBookRequestDTO,
  ConfirmBookBorrowingRequestDTO,
  BookActionRequestDTO,
  BookActionRequestApprovalDTO,
  UpdateBookBorrowingRequestDetail_RequestDTO,
} from "../types/bookRequest";
import {
  BookRequestPagedRequestDTO,
  PagedResultResponseDTO,
} from "../types/pagination";

export const requestService = {
  // Get paged requests
  getPagedRequests: async (
    pagedRequest: BookRequestPagedRequestDTO
  ): Promise<PagedResultResponseDTO<BookBorrowingRequestResponseDTO>> => {
    const response = await api.get("/borrowing-requests/paged", {
      params: pagedRequest,
    });
    return response.data;
  },

  getMyPagedRequests: async (
    pagedRequest: BookRequestPagedRequestDTO
  ): Promise<PagedResultResponseDTO<BookBorrowingRequestResponseDTO>> => {
    const response = await api.get("/borrowing-requests/me", {
      params: pagedRequest,
    });
    return response.data;
  },

  // Get request by ID
  getRequestById: async (
    id: string
  ): Promise<BookBorrowingRequestResponseDTO> => {
    const response = await api.get(`/borrowing-requests/${id}`);
    return response.data;
  },

  // Get requests by borrower ID
  getRequestsByBorrowerId: async (
    borrowerId: string
  ): Promise<BookBorrowingRequestResponseDTO[]> => {
    const response = await api.get(
      `/borrowing-requests/borrower/${borrowerId}`
    );
    return response.data;
  },

  getRequestDetailsByRequestId: async (
    requestId: string
  ): Promise<BookBorrowingRequestDetailResponseDTO[]> => {
    const response = await api.get(`/request-details/${requestId}`);
    return response.data;
  },

  getWaitingRequests: async (): Promise<BookBorrowingRequestResponseDTO[]> => {
    const response = await api.get("/borrowing-requests/waiting");
    return response.data;
  },

  getWaitingActionRequests: async (): Promise<
    BookBorrowingRequestDetailResponseDTO[]
  > => {
    const response = await api.get("/request-details/waiting-actions");
    return response.data;
  },

  borrowBook: async (request: BorrowBookRequestDTO) => {
    const response = await api.post(
      "/borrowing-requests/book-borrowing",
      request
    );
    return response;
  },

  // Create a new book borrowing request
  createRequest: async (
    request: BorrowBookRequestDTO
  ): Promise<BookBorrowingRequestResponseDTO> => {
    const response = await api.post("/borrowing-requests", request);
    return response.data;
  },

  // Confirm a book borrowing request (approve or reject)
  confirmRequest: async (
    confirmRequest: ConfirmBookBorrowingRequestDTO
  ): Promise<BookBorrowingRequestResponseDTO> => {
    const response = await api.post(
      "/borrowing-requests/request-confirmation",
      confirmRequest
    );
    return response.data;
  },

  // Request book action (return or renew)
  requestBookAction: async (
    actionRequest: BookActionRequestDTO
  ): Promise<BookBorrowingRequestDetailResponseDTO> => {
    const response = await api.post("/request-details/action", actionRequest);
    return response.data;
  },

  // Approve or reject book action request
  approveBookAction: async (
    approvalRequest: BookActionRequestApprovalDTO
  ): Promise<BookBorrowingRequestDetailResponseDTO> => {
    const response = await api.post(
      "/request-details/approval",
      approvalRequest
    );
    return response.data;
  },

  // Update request detail
  updateRequestDetail: async (
    bookId: string,
    requestId: string,
    updateData: UpdateBookBorrowingRequestDetail_RequestDTO
  ): Promise<BookBorrowingRequestDetailResponseDTO> => {
    const response = await api.put(
      `/borrowing-requests/${requestId}/${bookId}`,
      updateData
    );
    return response.data;
  },

  // Delete a request
  deleteRequest: async (id: string): Promise<void> => {
    await api.delete(`/borrowing-requests/${id}`);
  },
};

export default requestService;
