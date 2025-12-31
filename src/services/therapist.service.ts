import { supabase } from "@/lib/supabase/client";
import type {
  Therapist,
  TherapistInsert,
  TherapistUpdate,
  TherapistSettings,
  TherapistSettingsInsert,
  TherapistSettingsUpdate,
} from "@/lib/supabase/types";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";

/**
 * Get therapist by ID
 */
export async function getTherapistById(
  therapistId: string
): Promise<ApiResponse<Therapist>> {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("id", therapistId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get therapist by email
 */
export async function getTherapistByEmail(
  email: string
): Promise<ApiResponse<Therapist>> {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Create a new therapist
 */
export async function createTherapist(
  therapist: TherapistInsert
): Promise<ApiResponse<Therapist>> {
  const { data, error } = await supabase
    .from("therapists")
    .insert(therapist)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update therapist profile
 */
export async function updateTherapist(
  therapistId: string,
  updates: TherapistUpdate
): Promise<ApiResponse<Therapist>> {
  const { data, error } = await supabase
    .from("therapists")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", therapistId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get therapist settings
 */
export async function getTherapistSettings(
  therapistId: string
): Promise<ApiResponse<TherapistSettings>> {
  const { data, error } = await supabase
    .from("therapist_settings")
    .select("*")
    .eq("therapist_id", therapistId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Create therapist settings (usually on first login)
 */
export async function createTherapistSettings(
  settings: TherapistSettingsInsert
): Promise<ApiResponse<TherapistSettings>> {
  const { data, error } = await supabase
    .from("therapist_settings")
    .insert(settings)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update therapist settings
 */
export async function updateTherapistSettings(
  therapistId: string,
  updates: TherapistSettingsUpdate
): Promise<ApiResponse<TherapistSettings>> {
  const { data, error } = await supabase
    .from("therapist_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("therapist_id", therapistId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get or create therapist settings
 */
export async function getOrCreateTherapistSettings(
  therapistId: string
): Promise<ApiResponse<TherapistSettings>> {
  const result = await getTherapistSettings(therapistId);

  if (result.error?.code === "PGRST116") {
    // No settings found, create default settings
    return createTherapistSettings({ therapist_id: therapistId });
  }

  return result;
}

