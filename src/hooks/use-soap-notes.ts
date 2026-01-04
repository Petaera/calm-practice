import { useCallback } from "react";
import { useSupabaseMutation, useSupabaseQuery } from "./use-supabase-query";
import {
  archiveSoapNote,
  createSoapNote,
  getSoapNotes,
  toggleSoapNoteImportant,
  unarchiveSoapNote,
  updateSoapNote,
} from "@/services/soap-notes.service";
import type { SoapNote, SoapNoteInsert, SoapNoteUpdate, PaginatedResponse } from "@/lib/supabase";
import type { SoapNoteQueryOptions, SoapNoteWithLinks } from "@/services/soap-notes.service";

export function useSoapNotes(therapistId: string | undefined, options?: SoapNoteQueryOptions) {
  const queryFn = useCallback(() => {
    if (!therapistId) return Promise.resolve({ data: null, error: null });
    return getSoapNotes(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<SoapNoteWithLinks>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

export function useCreateSoapNote() {
  const mutationFn = useCallback((payload: SoapNoteInsert) => {
    return createSoapNote(payload);
  }, []);
  return useSupabaseMutation<SoapNote, SoapNoteInsert>(mutationFn);
}

export function useUpdateSoapNote() {
  const mutationFn = useCallback(
    ({ id, updates }: { id: string; updates: SoapNoteUpdate }) => {
      return updateSoapNote(id, updates);
    },
    []
  );
  return useSupabaseMutation<SoapNote, { id: string; updates: SoapNoteUpdate }>(mutationFn);
}

export function useArchiveSoapNote() {
  const mutationFn = useCallback((id: string) => archiveSoapNote(id), []);
  return useSupabaseMutation<SoapNote, string>(mutationFn);
}

export function useUnarchiveSoapNote() {
  const mutationFn = useCallback((id: string) => unarchiveSoapNote(id), []);
  return useSupabaseMutation<SoapNote, string>(mutationFn);
}

export function useToggleSoapNoteImportant() {
  const mutationFn = useCallback(
    ({ id, isImportant }: { id: string; isImportant: boolean }) => {
      return toggleSoapNoteImportant(id, isImportant);
    },
    []
  );
  return useSupabaseMutation<SoapNote, { id: string; isImportant: boolean }>(mutationFn);
}


