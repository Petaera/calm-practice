import { supabase } from "@/lib/supabase/client";
import type {
  Note,
  NoteInsert,
  NoteUpdate,
  NoteType,
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

export interface NoteFilters {
  noteType?: NoteType;
  clientId?: string;
  sessionId?: string;
  isArchived?: boolean;
  isImportant?: boolean;
  search?: string;
  tags?: string[];
}

export interface NoteQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: NoteFilters;
}

export interface NoteWithClient extends Note {
  clients: Pick<Client, "id" | "full_name"> | null;
}

/**
 * Fetch all notes for a therapist with optional filtering and pagination
 */
export async function getNotes(
  therapistId: string,
  options?: NoteQueryOptions
): Promise<ApiResponse<PaginatedResponse<NoteWithClient>>> {
  let query = supabase
    .from("notes")
    .select("*, clients(id, full_name)", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.noteType) {
    query = query.eq("note_type", options.filters.noteType);
  }
  if (options?.filters?.clientId) {
    query = query.eq("client_id", options.filters.clientId);
  }
  if (options?.filters?.sessionId) {
    query = query.eq("session_id", options.filters.sessionId);
  }
  if (options?.filters?.isArchived !== undefined) {
    query = query.eq("is_archived", options.filters.isArchived);
  }
  if (options?.filters?.isImportant !== undefined) {
    query = query.eq("is_important", options.filters.isImportant);
  }
  if (options?.filters?.search) {
    query = query.or(
      `title.ilike.%${options.filters.search}%,content.ilike.%${options.filters.search}%`
    );
  }
  if (options?.filters?.tags && options.filters.tags.length > 0) {
    query = query.contains("tags", options.filters.tags);
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("created_at", { ascending: false });
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
      (data as NoteWithClient[]) ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch recent notes
 */
export async function getRecentNotes(
  therapistId: string,
  limit = 5
): Promise<ApiResponse<NoteWithClient[]>> {
  const { data, error } = await supabase
    .from("notes")
    .select("*, clients(id, full_name)")
    .eq("therapist_id", therapistId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as NoteWithClient[], error: null };
}

/**
 * Fetch notes for a specific client
 */
export async function getNotesByClient(
  clientId: string,
  options?: { pagination?: PaginationParams }
): Promise<ApiResponse<PaginatedResponse<Note>>> {
  let query = supabase
    .from("notes")
    .select("*", { count: "exact" })
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

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
      data ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch a single note by ID
 */
export async function getNoteById(
  noteId: string
): Promise<ApiResponse<NoteWithClient>> {
  const { data, error } = await supabase
    .from("notes")
    .select("*, clients(id, full_name)")
    .eq("id", noteId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as NoteWithClient, error: null };
}

/**
 * Create a new note
 */
export async function createNote(
  note: NoteInsert
): Promise<ApiResponse<Note>> {
  const { data, error } = await supabase
    .from("notes")
    .insert(note)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  updates: NoteUpdate
): Promise<ApiResponse<Note>> {
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Archive a note
 */
export async function archiveNote(noteId: string): Promise<ApiResponse<Note>> {
  return updateNote(noteId, { is_archived: true });
}

/**
 * Unarchive a note
 */
export async function unarchiveNote(
  noteId: string
): Promise<ApiResponse<Note>> {
  return updateNote(noteId, { is_archived: false });
}

/**
 * Toggle important flag
 */
export async function toggleNoteImportant(
  noteId: string,
  isImportant: boolean
): Promise<ApiResponse<Note>> {
  return updateNote(noteId, { is_important: isImportant });
}

/**
 * Delete a note permanently
 */
export async function deleteNote(noteId: string): Promise<ApiResponse<null>> {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

