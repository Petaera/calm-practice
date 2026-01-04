import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getTherapistSettings,
  createTherapistSettings,
  updateTherapistSettings,
  upsertTherapistSettings,
} from "@/services/therapist-settings.service";
import type {
  TherapistSettings,
  TherapistSettingsInsert,
  TherapistSettingsUpdate,
} from "@/lib/supabase";

/**
 * Hook to fetch therapist settings
 */
export function useTherapistSettings(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getTherapistSettings(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<TherapistSettings>(
    queryFn,
    ["therapist-settings", therapistId],
    { enabled: !!therapistId }
  );
}

/**
 * Hook for creating therapist settings
 */
export function useCreateTherapistSettings() {
  const mutationFn = useCallback((settings: TherapistSettingsInsert) => {
    return createTherapistSettings(settings);
  }, []);

  return useSupabaseMutation<TherapistSettings, TherapistSettingsInsert>(
    mutationFn
  );
}

/**
 * Hook for updating therapist settings
 */
export function useUpdateTherapistSettings() {
  const mutationFn = useCallback(
    ({
      therapistId,
      updates,
    }: {
      therapistId: string;
      updates: TherapistSettingsUpdate;
    }) => {
      return updateTherapistSettings(therapistId, updates);
    },
    []
  );

  return useSupabaseMutation<
    TherapistSettings,
    { therapistId: string; updates: TherapistSettingsUpdate }
  >(mutationFn);
}

/**
 * Hook for upserting therapist settings (create or update)
 */
export function useUpsertTherapistSettings() {
  const mutationFn = useCallback((settings: TherapistSettingsInsert) => {
    return upsertTherapistSettings(settings);
  }, []);

  return useSupabaseMutation<TherapistSettings, TherapistSettingsInsert>(
    mutationFn
  );
}

