import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Generic API response wrapper for consistent error handling
 */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

/**
 * Standardized API error type
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Convert Supabase client errors (PostgREST, Storage, etc.) to ApiError.
 */
export function toApiError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null && "message" in error) {
    const e = error as Partial<PostgrestError> & { message: string };
    return {
      message: e.message,
      code: e.code,
      details: e.details,
      hint: e.hint,
    };
  }

  return {
    message: "An unknown error occurred",
  };
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Sort parameters for list queries
 */
export interface SortParams {
  column: string;
  ascending?: boolean;
}

/**
 * Common query options
 */
export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
}

/**
 * Helper to calculate pagination range
 */
export function getPaginationRange(params: PaginationParams): {
  from: number;
  to: number;
} {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  count: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  return {
    data,
    count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}

