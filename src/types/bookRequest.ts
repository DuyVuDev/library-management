export enum RequestStatus {
  Waiting = 0,
  Approved = 1,
  Rejected = -1,
}

export enum BorrowingStatus {
  Waiting = 0,
  Rejected = 1,
  Borrowing = 2,
  WaitingForReturnApproval = 3,
  WaitingForRenewalApproval = 4,
  Overdue = 5,
  Returned = 6,
}

// 1. CreateBookBorrowingRequest_RequestDTO
export interface CreateBookBorrowingRequest_RequestDTO {
  borrowerId: string;
  requestedDate: string; // DateOnly from C# will be string in TypeScript
  requestStatus: RequestStatus;
  confirmerId?: string;
  bookIds?: string[];
}

// 2. UpdateBookBorrowingRequest_RequestDTO
export interface UpdateBookBorrowingRequest_RequestDTO {
  borrowerId: string;
  requestedDate: string;
  requestStatus: RequestStatus;
  confirmerId: string;
  bookIds?: string[];
}

// 3. CreateBookBorrowingRequestDetail_RequestDTO
export interface CreateBookBorrowingRequestDetail_RequestDTO {
  bookId: string;
  bookBorrowingRequestId: string;
}

// 4. UpdateBookBorrowingRequestDetail_RequestDTO
export interface UpdateBookBorrowingRequestDetail_RequestDTO {
  bookId: string;
  bookBorrowingRequestId: string;
  dueDate: string;
  approverId: string;
  borrowingStatus: BorrowingStatus;
  isDueDateRenewed: boolean;
}

// 5. BorrowBookRequestDTO
export interface BorrowBookRequestDTO {
  borrowerId: string;
  requestedDate: string;
  bookIds: string[];
}

// 6. ConfirmBookBorrowingRequestDTO
export interface ConfirmBookBorrowingRequestDTO {
  bookRequestId: string;
  confirmerId: string;
  requestStatus: RequestStatus; // Approve, Reject
}

// 7. BookActionRequestDTO
export interface BookActionRequestDTO {
  bookBorrowingRequestId: string;
  bookId: string;
  isReturningBook: boolean; // true: user return book, false: user renew due date
}

// 8. BookActionRequestApprovalDTO
export interface BookActionRequestApprovalDTO {
  bookBorrowingRequestId: string;
  bookId: string;
  approverId: string;
  approve: boolean; // Approve, Reject
}

// Response DTOs
export interface BookBorrowingRequestResponseDTO {
  id: string;
  borrowerId: string;
  borrower: string;
  requestedDate: string;
  requestStatus: RequestStatus;
  confirmerId?: string;
  confirmer?: string;
  bookCount: number;
}

export interface BookBorrowingRequestDetailResponseDTO {
  id: string;
  bookId: string;
  bookTitle: string;
  bookBorrowingRequestId: string;
  dueDate?: string;
  approverId?: string;
  approverName?: string;
  borrowingStatus: BorrowingStatus;
  isDueDateRenewed: boolean;
}
