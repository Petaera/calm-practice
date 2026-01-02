import { supabase } from "@/lib/supabase/client";
import type {
  Module,
  ModuleInsert,
  ModuleUpdate,
  ModuleWithCounts,
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

export interface ModuleFilters {
  is_active?: boolean;
  search?: string;
  tags?: string[];
}

export interface ModuleQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: ModuleFilters;
}

/**
 * Generate a unique share token for public module access
 */
export function generateShareToken(): string {
  return crypto.randomUUID();
}

/**
 * Fetch all modules for a therapist with optional filtering and pagination
 */
export async function getModules(
  therapistId: string,
  options?: ModuleQueryOptions
): Promise<ApiResponse<PaginatedResponse<Module>>> {
  let query = supabase
    .from("modules")
    .select("*", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.is_active !== undefined) {
    query = query.eq("is_active", options.filters.is_active);
  }
  if (options?.filters?.search) {
    query = query.or(
      `name.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
    );
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("display_order", { ascending: true });
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
 * Fetch modules with resource counts
 */
export async function getModulesWithCounts(
  therapistId: string
): Promise<ApiResponse<ModuleWithCounts[]>> {
  const { data, error } = await supabase
    .from("modules")
    .select(`
      *,
      module_resources(count),
      module_client_assignments(count)
    `)
    .eq("therapist_id", therapistId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  // Transform the response to include counts
  const modulesWithCounts = (data ?? []).map((module) => ({
    ...module,
    resource_count: (module.module_resources as unknown as { count: number }[])?.[0]?.count ?? 0,
    assignment_count: (module.module_client_assignments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return { data: modulesWithCounts, error: null };
}

/**
 * Fetch a single module by ID with resources
 */
export async function getModuleById(
  moduleId: string
): Promise<ApiResponse<Module>> {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Fetch module by share token for public access
 */
export async function getModuleByShareToken(
  shareToken: string
): Promise<ApiResponse<any>> {
  // Query module directly using share_token
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("share_token", shareToken)
    .eq("is_public", true)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  if (!data) {
    return {
      data: null,
      error: { message: "Module not found or not public" },
    };
  }

  return { data, error: null };
}

/**
 * Create a new module
 */
export async function createModule(
  module: ModuleInsert
): Promise<ApiResponse<Module>> {
  const { data, error } = await supabase
    .from("modules")
    .insert(module)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing module
 */
export async function updateModule(
  moduleId: string,
  updates: ModuleUpdate
): Promise<ApiResponse<Module>> {
  const { data, error } = await supabase
    .from("modules")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", moduleId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Generate and set a share token for a module
 */
export async function generateModuleShareToken(
  moduleId: string
): Promise<ApiResponse<string>> {
  const shareToken = generateShareToken();

  const { error } = await supabase
    .from("modules")
    .update({
      share_token: shareToken,
      is_public: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: shareToken, error: null };
}

/**
 * Remove share token from a module (revoke public access)
 */
export async function revokeModuleShareToken(
  moduleId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("modules")
    .update({
      share_token: null,
      is_public: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Delete a module and its resources (cascade handled by DB)
 */
export async function deleteModule(
  moduleId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Toggle module active status
 */
export async function toggleModuleActive(
  moduleId: string,
  isActive: boolean
): Promise<ApiResponse<Module>> {
  return updateModule(moduleId, { is_active: isActive });
}

/**
 * Reorder modules
 */
export async function reorderModules(
  moduleOrders: { id: string; display_order: number }[]
): Promise<ApiResponse<null>> {
  const updates = moduleOrders.map(({ id, display_order }) =>
    supabase
      .from("modules")
      .update({ display_order, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);

  if (firstError?.error) {
    return { data: null, error: toApiError(firstError.error) };
  }

  return { data: null, error: null };
}

