import { supabase } from "@/lib/supabase/client";
import type { SoapNote, SoapNoteInsert, SoapNoteUpdate, Client } from "@/lib/supabase/types";
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

export interface SoapNoteFilters {
  clientId?: string;
  assessmentSubmissionId?: string;
  isArchived?: boolean;
  isImportant?: boolean;
  search?: string;
}

export interface SoapNoteQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: SoapNoteFilters;
}

export interface SoapNoteWithLinks extends SoapNote {
  clients: Pick<Client, "id" | "full_name"> | null;
  assessment_submissions: {
    id: string;
    submitted_at: string | null;
    assessments: { title: string } | null;
  } | null;
}

export async function getSoapNotes(
  therapistId: string,
  options?: SoapNoteQueryOptions
): Promise<ApiResponse<PaginatedResponse<SoapNoteWithLinks>>> {
  let query = supabase
    .from("soap_notes")
    .select(
      `
      *,
      clients(id, full_name),
      assessment_submissions(
        id,
        submitted_at,
        assessments(title)
      )
    `,
      { count: "exact" }
    )
    .eq("therapist_id", therapistId);

  if (options?.filters?.clientId) {
    query = query.eq("client_id", options.filters.clientId);
  }
  if (options?.filters?.assessmentSubmissionId) {
    query = query.eq("assessment_submission_id", options.filters.assessmentSubmissionId);
  }
  if (options?.filters?.isArchived !== undefined) {
    query = query.eq("is_archived", options.filters.isArchived);
  }
  if (options?.filters?.isImportant !== undefined) {
    query = query.eq("is_important", options.filters.isImportant);
  }
  if (options?.filters?.search) {
    // Keep it predictable & fast: search title only (jsonb sections aren't reliably searchable via Supabase filters)
    query = query.ilike("title", `%${options.filters.search}%`);
  }

  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (options?.pagination) {
    const { from, to } = getPaginationRange(options.pagination);
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) return { data: null, error: toApiError(error) };

  return {
    data: createPaginatedResponse(
      (data as SoapNoteWithLinks[]) ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

export async function createSoapNote(
  note: SoapNoteInsert
): Promise<ApiResponse<SoapNote>> {
  const { data, error } = await supabase
    .from("soap_notes")
    .insert(note)
    .select()
    .single();

  if (error) return { data: null, error: toApiError(error) };
  return { data, error: null };
}

export async function updateSoapNote(
  id: string,
  updates: SoapNoteUpdate
): Promise<ApiResponse<SoapNote>> {
  const { data, error } = await supabase
    .from("soap_notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: toApiError(error) };
  return { data, error: null };
}

export async function archiveSoapNote(id: string): Promise<ApiResponse<SoapNote>> {
  return updateSoapNote(id, { is_archived: true });
}

export async function unarchiveSoapNote(id: string): Promise<ApiResponse<SoapNote>> {
  return updateSoapNote(id, { is_archived: false });
}

export async function toggleSoapNoteImportant(
  id: string,
  isImportant: boolean
): Promise<ApiResponse<SoapNote>> {
  return updateSoapNote(id, { is_important: isImportant });
}


