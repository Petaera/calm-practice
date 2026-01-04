import { supabase } from "@/lib/supabase/client";
import type {
  TherapistSettings,
  TherapistSettingsInsert,
  TherapistSettingsUpdate,
} from "@/lib/supabase";
import type { ApiResponse } from "./types";

/**
 * Get therapist settings by therapist ID
 */
export async function getTherapistSettings(
  therapistId: string
): Promise<ApiResponse<TherapistSettings>> {
  try {
    const { data, error } = await supabase
      .from("therapist_settings")
      .select("*")
      .eq("therapist_id", therapistId)
      .single();

    if (error) throw error;

    return {
      data: data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching therapist settings:", error);
    return {
      data: null,
      error: error.message || "Failed to fetch therapist settings",
    };
  }
}

/**
 * Create therapist settings
 */
export async function createTherapistSettings(
  settings: TherapistSettingsInsert
): Promise<ApiResponse<TherapistSettings>> {
  try {
    const { data, error } = await supabase
      .from("therapist_settings")
      .insert(settings)
      .select()
      .single();

    if (error) throw error;

    return {
      data: data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error creating therapist settings:", error);
    return {
      data: null,
      error: error.message || "Failed to create therapist settings",
    };
  }
}

/**
 * Update therapist settings
 */
export async function updateTherapistSettings(
  therapistId: string,
  updates: TherapistSettingsUpdate
): Promise<ApiResponse<TherapistSettings>> {
  try {
    const { data, error } = await supabase
      .from("therapist_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("therapist_id", therapistId)
      .select()
      .single();

    if (error) throw error;

    return {
      data: data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error updating therapist settings:", error);
    return {
      data: null,
      error: error.message || "Failed to update therapist settings",
    };
  }
}

/**
 * Upsert therapist settings (create or update)
 */
export async function upsertTherapistSettings(
  settings: TherapistSettingsInsert
): Promise<ApiResponse<TherapistSettings>> {
  try {
    const { data, error } = await supabase
      .from("therapist_settings")
      .upsert(settings, { onConflict: "therapist_id" })
      .select()
      .single();

    if (error) throw error;

    return {
      data: data || null,
      error: null,
    };
  } catch (error: any) {
    console.error("Error upserting therapist settings:", error);
    return {
      data: null,
      error: error.message || "Failed to upsert therapist settings",
    };
  }
}

