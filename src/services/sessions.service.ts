import { supabase } from "@/lib/supabase/client";
import type {
  Session,
  SessionInsert,
  SessionUpdate,
  SessionStatus,
  Client,
} from "@/lib/supabase/types";
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SortParams,
} from "@/lib/supabase/api-types";
import {
  toApiError,
  getPaginationRange,
  createPaginatedResponse,
} from "@/lib/supabase/api-types";

export interface SessionFilters {
  status?: SessionStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SessionQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: SessionFilters;
}

export interface SessionWithClient extends Session {
  clients: Pick<Client, "id" | "full_name" | "email"> | null;
}

/**
 * Fetch all sessions for a therapist with optional filtering and pagination
 */
export async function getSessions(
  therapistId: string,
  options?: SessionQueryOptions
): Promise<ApiResponse<PaginatedResponse<SessionWithClient>>> {
  let query = supabase
    .from("sessions")
    .select("*, clients(id, full_name, email)", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.status) {
    query = query.eq("status", options.filters.status);
  }
  if (options?.filters?.clientId) {
    query = query.eq("client_id", options.filters.clientId);
  }
  if (options?.filters?.dateFrom) {
    query = query.gte("session_date", options.filters.dateFrom);
  }
  if (options?.filters?.dateTo) {
    query = query.lte("session_date", options.filters.dateTo);
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("session_date", { ascending: false });
  }

  // Apply pagination
  if (options?.pagination) {
    const { from, to } = getPaginationRange(options.pagination);
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return {
    data: createPaginatedResponse(
      (data as SessionWithClient[]) ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch upcoming sessions for a therapist
 */
export async function getUpcomingSessions(
  therapistId: string,
  limit = 5
): Promise<ApiResponse<SessionWithClient[]>> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("sessions")
    .select("*, clients(id, full_name, email)")
    .eq("therapist_id", therapistId)
    .gte("session_date", today)
    .in("status", ["Scheduled", "Upcoming"])
    .order("session_date", { ascending: true })
    .order("session_time", { ascending: true })
    .limit(limit);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as SessionWithClient[], error: null };
}

/**
 * Fetch a single session by ID
 */
export async function getSessionById(
  sessionId: string
): Promise<ApiResponse<SessionWithClient>> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, clients(id, full_name, email)")
    .eq("id", sessionId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as SessionWithClient, error: null };
}

/**
 * Create a new session
 */
export async function createSession(
  session: SessionInsert
): Promise<ApiResponse<Session>> {
  const { data, error } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing session
 */
export async function updateSession(
  sessionId: string,
  updates: SessionUpdate
): Promise<ApiResponse<Session>> {
  const { data, error } = await supabase
    .from("sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Cancel a session
 */
export async function cancelSession(
  sessionId: string
): Promise<ApiResponse<Session>> {
  return updateSession(sessionId, { status: "Cancelled" });
}

/**
 * Mark session as completed
 */
export async function completeSession(
  sessionId: string,
  notes?: string
): Promise<ApiResponse<Session>> {
  return updateSession(sessionId, {
    status: "Completed",
    session_notes: notes,
  });
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get sessions for a specific date
 */
export async function getSessionsByDate(
  therapistId: string,
  date: string
): Promise<ApiResponse<SessionWithClient[]>> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, clients(id, full_name, email)")
    .eq("therapist_id", therapistId)
    .eq("session_date", date)
    .order("session_time", { ascending: true });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as SessionWithClient[], error: null };
}

