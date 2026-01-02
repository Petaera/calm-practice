import { supabase } from "@/lib/supabase/client";
import type {
  Resource,
  ResourceInsert,
  ResourceUpdate,
  ResourceType,
} from "@/lib/supabase/types";
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

export interface ResourceFilters {
  module_id?: string;
  resource_type?: ResourceType;
  search?: string;
  tags?: string[];
}

export interface ResourceQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: ResourceFilters;
}

/**
 * Fetch all resources for a therapist with optional filtering and pagination
 */
export async function getResources(
  therapistId: string,
  options?: ResourceQueryOptions
): Promise<ApiResponse<PaginatedResponse<Resource>>> {
  let query = supabase
    .from("resources")
    .select("*", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.module_id) {
    query = query.eq("module_id", options.filters.module_id);
  }
  if (options?.filters?.resource_type) {
    query = query.eq("resource_type", options.filters.resource_type);
  }
  if (options?.filters?.search) {
    query = query.or(
      `title.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
    );
  }
  if (options?.filters?.tags && options.filters.tags.length > 0) {
    query = query.contains("tags", options.filters.tags);
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply pagination
  if (options?.pagination) {
    const { from, to } = getPaginationRange(options.pagination);
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return {
    data: createPaginatedResponse(
      data ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 20 }
    ),
    error: null,
  };
}

/**
 * Fetch resources by module ID
 */
export async function getResourcesByModule(
  moduleId: string
): Promise<ApiResponse<Resource[]>> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("module_id", moduleId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Fetch unorganized resources (not assigned to any module)
 */
export async function getUnorganizedResources(
  therapistId: string
): Promise<ApiResponse<Resource[]>> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("therapist_id", therapistId)
    .is("module_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Fetch a single resource by ID
 */
export async function getResourceById(
  resourceId: string
): Promise<ApiResponse<Resource>> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Create a new resource
 */
export async function createResource(
  resource: ResourceInsert
): Promise<ApiResponse<Resource>> {
  const { data, error } = await supabase
    .from("resources")
    .insert(resource)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing resource
 */
export async function updateResource(
  resourceId: string,
  updates: ResourceUpdate
): Promise<ApiResponse<Resource>> {
  const { data, error } = await supabase
    .from("resources")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", resourceId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Move a resource to a different module
 */
export async function moveResourceToModule(
  resourceId: string,
  moduleId: string | null
): Promise<ApiResponse<Resource>> {
  return updateResource(resourceId, { module_id: moduleId });
}

/**
 * Delete a resource
 */
export async function deleteResource(
  resourceId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get all unique tags used across resources for a therapist
 */
export async function getResourceTags(
  therapistId: string
): Promise<ApiResponse<string[]>> {
  const { data, error } = await supabase
    .from("resources")
    .select("tags")
    .eq("therapist_id", therapistId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  // Flatten and deduplicate tags
  const allTags = data?.flatMap((r) => r.tags ?? []) ?? [];
  const uniqueTags = Array.from(new Set(allTags)).sort();

  return { data: uniqueTags, error: null };
}

/**
 * Search resources by tags
 */
export async function searchResourcesByTags(
  therapistId: string,
  tags: string[]
): Promise<ApiResponse<Resource[]>> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("therapist_id", therapistId)
    .contains("tags", tags)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Get resource count by type
 */
export async function getResourceCountByType(
  therapistId: string
): Promise<ApiResponse<Record<ResourceType, number>>> {
  const { data, error } = await supabase
    .from("resources")
    .select("resource_type")
    .eq("therapist_id", therapistId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const counts: Record<ResourceType, number> = {
    document: 0,
    video: 0,
    audio: 0,
    image: 0,
    url: 0,
    note: 0,
  };

  data?.forEach((resource) => {
    const type = resource.resource_type as ResourceType;
    if (type && counts[type] !== undefined) {
      counts[type]++;
    }
  });

  return { data: counts, error: null };
}

/**
 * Add multiple resources to a module
 */
export async function addResourcesToModule(
  moduleId: string,
  resourceIds: string[]
): Promise<ApiResponse<Resource[]>> {
  const { data, error } = await supabase
    .from("resources")
    .update({ module_id: moduleId, updated_at: new Date().toISOString() })
    .in("id", resourceIds)
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Remove a resource from a module (set module_id to null)
 */
export async function removeResourceFromModule(
  resourceId: string
): Promise<ApiResponse<Resource>> {
  return updateResource(resourceId, { module_id: null });
}

/**
 * Remove multiple resources from a module
 */
export async function removeResourcesFromModule(
  resourceIds: string[]
): Promise<ApiResponse<Resource[]>> {
  const { data, error } = await supabase
    .from("resources")
    .update({ module_id: null, updated_at: new Date().toISOString() })
    .in("id", resourceIds)
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

