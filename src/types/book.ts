export interface BookResponseDTO {
  id: string;
  title: string;
  author: string;
  publishedDate: string; // DateOnly from C# will be string in TypeScript
  quantity: number;
  availableQuantity: number;
  isDeleted: boolean;
  categoryName: string;
  categoryId: string;
}

export interface CreateBookRequestDTO {
  title: string;
  author: string;
  publishedDate: string;
  quantity: number;
  isDeleted?: boolean;
  categoryId: string;
}

export interface UpdateBookRequestDTO {
  title: string;
  author: string;
  publishedDate: string;
  adjustment: number;
  isDeleted?: boolean;
  categoryId: string;
}
