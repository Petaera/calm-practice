import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getSessions,
  getUpcomingSessions,
  getSessionById,
  createSession,
  updateSession,
  cancelSession,
  completeSession,
  deleteSession,
  getSessionsByDate,
} from "@/services/sessions.service";
import type {
  SessionQueryOptions,
  SessionWithClient,
} from "@/services/sessions.service";
import type {
  Session,
  SessionInsert,
  SessionUpdate,
  PaginatedResponse,
} from "@/lib/supabase";

/**
 * Hook to fetch paginated sessions with filtering
 */
export function useSessions(
  therapistId: string | undefined,
  options?: SessionQueryOptions
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getSessions(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<SessionWithClient>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch upcoming sessions
 */
export function useUpcomingSessions(
  therapistId: string | undefined,
  limit = 5
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getUpcomingSessions(therapistId, limit);
  }, [therapistId, limit]);

  return useSupabaseQuery<SessionWithClient[]>(
    queryFn,
    [therapistId, limit],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch sessions for a specific date
 */
export function useSessionsByDate(
  therapistId: string | undefined,
  date: string | undefined
) {
  const queryFn = useCallback(() => {
    if (!therapistId || !date) {
      return Promise.resolve({ data: null, error: null });
    }
    return getSessionsByDate(therapistId, date);
  }, [therapistId, date]);

  return useSupabaseQuery<SessionWithClient[]>(
    queryFn,
    [therapistId, date],
    { enabled: !!therapistId && !!date }
  );
}

/**
 * Hook to fetch a single session by ID
 */
export function useSession(sessionId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!sessionId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getSessionById(sessionId);
  }, [sessionId]);

  return useSupabaseQuery<SessionWithClient>(queryFn, [sessionId], {
    enabled: !!sessionId,
  });
}

/**
 * Hook for creating a new session
 */
export function useCreateSession() {
  const mutationFn = useCallback((session: SessionInsert) => {
    return createSession(session);
  }, []);

  return useSupabaseMutation<Session, SessionInsert>(mutationFn);
}

/**
 * Hook for updating a session
 */
export function useUpdateSession() {
  const mutationFn = useCallback(
    ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) => {
      return updateSession(sessionId, updates);
    },
    []
  );

  return useSupabaseMutation<
    Session,
    { sessionId: string; updates: SessionUpdate }
  >(mutationFn);
}

/**
 * Hook for canceling a session
 */
export function useCancelSession() {
  const mutationFn = useCallback((sessionId: string) => {
    return cancelSession(sessionId);
  }, []);

  return useSupabaseMutation<Session, string>(mutationFn);
}

/**
 * Hook for completing a session
 */
export function useCompleteSession() {
  const mutationFn = useCallback(
    ({ sessionId, notes }: { sessionId: string; notes?: string }) => {
      return completeSession(sessionId, notes);
    },
    []
  );

  return useSupabaseMutation<Session, { sessionId: string; notes?: string }>(
    mutationFn
  );
}

/**
 * Hook for deleting a session
 */
export function useDeleteSession() {
  const mutationFn = useCallback((sessionId: string) => {
    return deleteSession(sessionId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

