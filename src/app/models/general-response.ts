
export interface GeneralResponse<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T | null;
  meta?: any; // contains pagination info if present
  errors?: string[] | null;
}
