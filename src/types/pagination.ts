export interface BookPagedRequestDTO {
  pageNumber: number; // Updated to camelCase
  pageSize: number; // Updated to camelCase

  searchKeyword?: string; // Made optional and updated to camelCase

  categoryId?: string; // Made optional and updated to camelCase
}

export interface BookRequestPagedRequestDTO {
  pageNumber: number; // Updated to camelCase
  pageSize: number; // Updated to camelCase

  RequestStatus?: string; // Made optional and updated to camelCase
}

export interface UserPagedRequestDTO {
  pageNumber: number; // Updated to camelCase
  pageSize: number; // Updated to camelCase

  UserRole?: string; // Made optional and updated to camelCase
}

export interface PagedResultResponseDTO<T> {
  totalCount: number; // Updated to camelCase
  pageSize: number; // Updated to camelCase
  pageNumber: number; // Updated to camelCase
  items: T[]; // Updated to camelCase
}
