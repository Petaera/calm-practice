import { supabase } from "@/lib/supabase/client";
import type {
  ModuleClientAssignment,
  ModuleClientAssignmentInsert,
  ModuleClientAssignmentUpdate,
  ModuleClientAssignmentWithClient,
} from "@/lib/supabase/types";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";

/**
 * Assign clients to a module
 */
export async function assignClientsToModule(
  moduleId: string,
  clientIds: string[],
  therapistId: string,
  options?: { therapistNotes?: string }
): Promise<ApiResponse<ModuleClientAssignment[]>> {
  const assignments: ModuleClientAssignmentInsert[] = clientIds.map(
    (clientId) => ({
      module_id: moduleId,
      client_id: clientId,
      therapist_id: therapistId,
      therapist_notes: options?.therapistNotes || null,
      is_active: true,
    })
  );

  const { data, error } = await supabase
    .from("module_client_assignments")
    .upsert(assignments, { onConflict: "module_id,client_id" })
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get all clients assigned to a module
 */
export async function getAssignedClients(
  moduleId: string
): Promise<ApiResponse<ModuleClientAssignmentWithClient[]>> {
  const { data, error } = await supabase
    .from("module_client_assignments")
    .select(`
      *,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as ModuleClientAssignmentWithClient[], error: null };
}

/**
 * Get all modules assigned to a client
 */
export async function getAssignedModules(
  clientId: string
): Promise<ApiResponse<any[]>> {
  const { data, error } = await supabase
    .from("module_client_assignments")
    .select(`
      *,
      modules (*)
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Remove a client assignment from a module
 */
export async function removeAssignment(
  assignmentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("module_client_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Update an assignment (e.g., notes, status)
 */
export async function updateAssignment(
  assignmentId: string,
  updates: ModuleClientAssignmentUpdate
): Promise<ApiResponse<ModuleClientAssignment>> {
  const { data, error } = await supabase
    .from("module_client_assignments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Mark an assignment as accessed (client viewed the module)
 */
export async function markAssignmentAccessed(
  assignmentId: string
): Promise<ApiResponse<ModuleClientAssignment>> {
  return updateAssignment(assignmentId, {
    accessed_at: new Date().toISOString(),
  });
}

/**
 * Mark an assignment as completed
 */
export async function completeAssignment(
  assignmentId: string
): Promise<ApiResponse<ModuleClientAssignment>> {
  return updateAssignment(assignmentId, {
    completed_at: new Date().toISOString(),
  });
}

/**
 * Get assignment counts for a module
 */
export async function getAssignmentCounts(
  moduleId: string
): Promise<ApiResponse<{ total: number; accessed: number; completed: number }>> {
  const { data, error } = await supabase
    .from("module_client_assignments")
    .select("accessed_at, completed_at")
    .eq("module_id", moduleId)
    .eq("is_active", true);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const counts = {
    total: data.length,
    accessed: data.filter((a) => a.accessed_at !== null).length,
    completed: data.filter((a) => a.completed_at !== null).length,
  };

  return { data: counts, error: null };
}

