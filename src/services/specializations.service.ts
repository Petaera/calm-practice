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
  // Use RPC for atomic transaction
  const { error } = await supabase
    .rpc('set_therapist_specializations', {
      p_therapist_id: therapistId,
      p_specialization_ids: specializationIds,
    });

  if (error) return { data: null, error: toApiError(error) };

  return { data: { therapistId, specializationIds }, error: null };
}


