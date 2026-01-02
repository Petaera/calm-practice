import { supabase } from "@/lib/supabase/client";
import type {
  ResourceClientAssignment,
  ResourceClientAssignmentInsert,
  ResourceClientAssignmentUpdate,
  ResourceClientAssignmentWithClient,
  ResourceClientAssignmentWithResource,
} from "@/lib/supabase/types";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";

/**
 * Assign clients to a resource
 */
export async function assignClientsToResource(
  resourceId: string,
  clientIds: string[],
  therapistId: string,
  options?: { therapistNotes?: string }
): Promise<ApiResponse<ResourceClientAssignment[]>> {
  const assignments: ResourceClientAssignmentInsert[] = clientIds.map(
    (clientId) => ({
      resource_id: resourceId,
      client_id: clientId,
      therapist_id: therapistId,
      therapist_notes: options?.therapistNotes || null,
      is_active: true,
    })
  );

  const { data, error } = await supabase
    .from("resource_client_assignments")
    .upsert(assignments, { onConflict: "resource_id,client_id" })
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get all clients assigned to a resource
 */
export async function getAssignedClients(
  resourceId: string
): Promise<ApiResponse<ResourceClientAssignmentWithClient[]>> {
  const { data, error } = await supabase
    .from("resource_client_assignments")
    .select(`
      *,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq("resource_id", resourceId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as ResourceClientAssignmentWithClient[], error: null };
}

/**
 * Get all resources assigned to a client
 */
export async function getAssignedResources(
  clientId: string
): Promise<ApiResponse<ResourceClientAssignmentWithResource[]>> {
  const { data, error } = await supabase
    .from("resource_client_assignments")
    .select(`
      *,
      resources (*)
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as ResourceClientAssignmentWithResource[], error: null };
}

/**
 * Remove a client assignment from a resource
 */
export async function removeAssignment(
  assignmentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("resource_client_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Remove assignments for a resource and client combination
 */
export async function removeResourceClientAssignment(
  resourceId: string,
  clientId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("resource_client_assignments")
    .delete()
    .eq("resource_id", resourceId)
    .eq("client_id", clientId);

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
  updates: ResourceClientAssignmentUpdate
): Promise<ApiResponse<ResourceClientAssignment>> {
  const { data, error } = await supabase
    .from("resource_client_assignments")
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
 * Mark an assignment as accessed (client viewed the resource)
 */
export async function markAssignmentAccessed(
  assignmentId: string
): Promise<ApiResponse<ResourceClientAssignment>> {
  return updateAssignment(assignmentId, {
    accessed_at: new Date().toISOString(),
  });
}

/**
 * Mark an assignment as completed
 */
export async function completeAssignment(
  assignmentId: string
): Promise<ApiResponse<ResourceClientAssignment>> {
  return updateAssignment(assignmentId, {
    completed_at: new Date().toISOString(),
  });
}

/**
 * Get assignment counts for a resource
 */
export async function getAssignmentCounts(
  resourceId: string
): Promise<ApiResponse<{ total: number; accessed: number; completed: number }>> {
  const { data, error } = await supabase
    .from("resource_client_assignments")
    .select("accessed_at, completed_at")
    .eq("resource_id", resourceId)
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

/**
 * Get all resources accessible to a client (directly assigned + from modules)
 */
export async function getAllClientResources(
  clientId: string,
  therapistId: string
): Promise<ApiResponse<any[]>> {
  // Get directly assigned resources
  const directAssignments = await getAssignedResources(clientId);
  
  // Get resources from assigned modules
  const { data: moduleAssignments, error: moduleError } = await supabase
    .from("module_client_assignments")
    .select(`
      modules (
        id,
        resources (*)
      )
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .eq("therapist_id", therapistId);

  if (moduleError) {
    return { data: null, error: toApiError(moduleError) };
  }

  // Flatten module resources
  const moduleResources = (moduleAssignments || []).flatMap((ma: any) => 
    (ma.modules?.resources || []).map((resource: any) => ({
      ...resource,
      source: "module",
      module_id: ma.modules.id,
    }))
  );

  // Combine direct and module resources, deduplicate by resource id
  const allResources = [
    ...(directAssignments.data || []).map((a) => ({
      ...a.resources,
      source: "direct",
      assignment_id: a.id,
    })),
    ...moduleResources,
  ];

  // Deduplicate by resource id
  const uniqueResources = Array.from(
    new Map(allResources.map((r) => [r.id, r])).values()
  );

  return { data: uniqueResources, error: null };
}

