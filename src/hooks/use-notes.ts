import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getNotes,
  getRecentNotes,
  getNotesByClient,
  getNoteById,
  createNote,
  updateNote,
  archiveNote,
  unarchiveNote,
  toggleNoteImportant,
  deleteNote,
} from "@/services/notes.service";
import type { NoteQueryOptions, NoteWithClient } from "@/services/notes.service";
import type {
  Note,
  NoteInsert,
  NoteUpdate,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/supabase";

/**
 * Hook to fetch paginated notes with filtering
 */
export function useNotes(
  therapistId: string | undefined,
  options?: NoteQueryOptions
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getNotes(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<NoteWithClient>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch recent notes
 */
export function useRecentNotes(therapistId: string | undefined, limit = 5) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getRecentNotes(therapistId, limit);
  }, [therapistId, limit]);

  return useSupabaseQuery<NoteWithClient[]>(queryFn, [therapistId, limit], {
    enabled: !!therapistId,
  });
}

/**
 * Hook to fetch notes for a specific client
 */
export function useNotesByClient(
  clientId: string | undefined,
  pagination?: PaginationParams
) {
  const queryFn = useCallback(() => {
    if (!clientId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getNotesByClient(clientId, { pagination });
  }, [clientId, pagination]);

  return useSupabaseQuery<PaginatedResponse<Note>>(
    queryFn,
    [clientId, JSON.stringify(pagination)],
    { enabled: !!clientId }
  );
}

/**
 * Hook to fetch a single note by ID
 */
export function useNote(noteId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!noteId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getNoteById(noteId);
  }, [noteId]);

  return useSupabaseQuery<NoteWithClient>(queryFn, [noteId], {
    enabled: !!noteId,
  });
}

/**
 * Hook for creating a new note
 */
export function useCreateNote() {
  const mutationFn = useCallback((note: NoteInsert) => {
    return createNote(note);
  }, []);

  return useSupabaseMutation<Note, NoteInsert>(mutationFn);
}

/**
 * Hook for updating a note
 */
export function useUpdateNote() {
  const mutationFn = useCallback(
    ({ noteId, updates }: { noteId: string; updates: NoteUpdate }) => {
      return updateNote(noteId, updates);
    },
    []
  );

  return useSupabaseMutation<Note, { noteId: string; updates: NoteUpdate }>(
    mutationFn
  );
}

/**
 * Hook for archiving a note
 */
export function useArchiveNote() {
  const mutationFn = useCallback((noteId: string) => {
    return archiveNote(noteId);
  }, []);

  return useSupabaseMutation<Note, string>(mutationFn);
}

/**
 * Hook for unarchiving a note
 */
export function useUnarchiveNote() {
  const mutationFn = useCallback((noteId: string) => {
    return unarchiveNote(noteId);
  }, []);

  return useSupabaseMutation<Note, string>(mutationFn);
}

/**
 * Hook for toggling note importance
 */
export function useToggleNoteImportant() {
  const mutationFn = useCallback(
    ({ noteId, isImportant }: { noteId: string; isImportant: boolean }) => {
      return toggleNoteImportant(noteId, isImportant);
    },
    []
  );

  return useSupabaseMutation<
    Note,
    { noteId: string; isImportant: boolean }
  >(mutationFn);
}

/**
 * Hook for deleting a note
 */
export function useDeleteNote() {
  const mutationFn = useCallback((noteId: string) => {
    return deleteNote(noteId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

