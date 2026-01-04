import { useCallback } from "react";
import { useSupabaseMutation, useSupabaseQuery } from "./use-supabase-query";
import {
  getSpecializations,
  getTherapistSpecializations,
  setTherapistSpecializations,
} from "@/services/specializations.service";
import type { Specialization, TherapistSpecialization } from "@/lib/supabase";

export function useSpecializations() {
  const queryFn = useCallback(() => getSpecializations(), []);
  return useSupabaseQuery<Specialization[]>(queryFn, ["specializations"]);
}

export function useTherapistSpecializations(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) return Promise.resolve({ data: [], error: null });
    return getTherapistSpecializations(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<TherapistSpecialization[]>(
    queryFn,
    ["therapist-specializations", therapistId],
    { enabled: !!therapistId },
  );
}

export function useSetTherapistSpecializations() {
  const mutationFn = useCallback(
    ({ therapistId, specializationIds }: { therapistId: string; specializationIds: string[] }) =>
      setTherapistSpecializations(therapistId, specializationIds),
    [],
  );

  return useSupabaseMutation<
    { therapistId: string; specializationIds: string[] },
    { therapistId: string; specializationIds: string[] }
  >(mutationFn);
}


