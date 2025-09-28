
// ===== GENERAL RESPONSE MODELS =====

export interface GeneralResponse<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T | null;
  meta?: any; // contains pagination info if present
  errors?: string[] | null;
}

export interface PaginationMeta {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
