import { supabase } from "@/lib/supabase/client";
import type {
  ApiResponse,
  Specialization,
  TherapistSpecialization,
} from "@/lib/supabase";
import { toApiError } from "@/lib/supabase/api-types";

export async function getSpecializations(): Promise<ApiResponse<Specialization[]>> {
  const { data, error } = await supabase
    .from("specializations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return { data: null, error: toApiError(error) };
  return { data: data ?? [], error: null };
}

export async function getTherapistSpecializations(
  therapistId: string,
): Promise<ApiResponse<TherapistSpecialization[]>> {
  const { data, error } = await supabase
    .from("therapist_specializations")
    .select("*")
    .eq("therapist_id", therapistId);

  if (error) return { data: null, error: toApiError(error) };
  return { data: data ?? [], error: null };
}

export async function setTherapistSpecializations(
  therapistId: string,
  specializationIds: string[],
): Promise<ApiResponse<{ therapistId: string; specializationIds: string[] }>> {
  // Simple approach: clear then insert. (Non-atomic but fine for settings.)
  const { error: delError } = await supabase
    .from("therapist_specializations")
    .delete()
    .eq("therapist_id", therapistId);

  if (delError) return { data: null, error: toApiError(delError) };

  if (specializationIds.length === 0) {
    return { data: { therapistId, specializationIds: [] }, error: null };
  }

  const rows = specializationIds.map((specialization_id) => ({
    therapist_id: therapistId,
    specialization_id,
  }));

  const { error: insError } = await supabase
    .from("therapist_specializations")
    .insert(rows);

  if (insError) return { data: null, error: toApiError(insError) };

  return { data: { therapistId, specializationIds }, error: null };
}


