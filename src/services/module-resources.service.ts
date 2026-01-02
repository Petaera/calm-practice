import { supabase } from "@/lib/supabase/client";
import type {
  ModuleResource,
  ModuleResourceInsert,
  ResourceWithModules,
  ModuleWithResources,
} from "@/lib/supabase/types";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";

/**
 * Add resources to one or more modules
 */
export async function addResourcesToModules(
  resourceIds: string[],
  moduleIds: string[]
): Promise<ApiResponse<ModuleResource[]>> {
  const inserts: ModuleResourceInsert[] = [];
  
  for (const resourceId of resourceIds) {
    for (const moduleId of moduleIds) {
      inserts.push({
        resource_id: resourceId,
        module_id: moduleId,
      });
    }
  }

  const { data, error } = await supabase
    .from("module_resources")
    .insert(inserts)
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data ?? [], error: null };
}

/**
 * Remove resources from one or more modules
 */
export async function removeResourcesFromModules(
  resourceIds: string[],
  moduleIds: string[]
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("module_resources")
    .delete()
    .in("resource_id", resourceIds)
    .in("module_id", moduleIds);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Remove a resource from all modules
 */
export async function removeResourceFromAllModules(
  resourceId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("module_resources")
    .delete()
    .eq("resource_id", resourceId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get all modules that contain a resource
 */
export async function getModulesForResource(
  resourceId: string
): Promise<ApiResponse<Array<{ id: string; name: string; color: string | null }>>> {
  const { data, error } = await supabase
    .from("module_resources")
    .select(`
      modules (
        id,
        name,
        color
      )
    `)
    .eq("resource_id", resourceId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const modules = (data || [])
    .map((mr: any) => mr.modules)
    .filter(Boolean);

  return { data: modules, error: null };
}

/**
 * Get all resources in a module (using junction table)
 */
export async function getResourcesInModule(
  moduleId: string
): Promise<ApiResponse<any[]>> {
  const { data, error } = await supabase
    .from("module_resources")
    .select(`
      resources (*)
    `)
    .eq("module_id", moduleId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const resources = (data || []).map((mr: any) => mr.resources).filter(Boolean);

  return { data: resources, error: null };
}

/**
 * Get resource with its modules
 */
export async function getResourceWithModules(
  resourceId: string
): Promise<ApiResponse<ResourceWithModules | null>> {
  const { data: resourceData, error: resourceError } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (resourceError) {
    return { data: null, error: toApiError(resourceError) };
  }

  const { data: moduleResources, error: mrError } = await supabase
    .from("module_resources")
    .select(`
      id,
      module_id,
      modules (
        id,
        name,
        color
      )
    `)
    .eq("resource_id", resourceId);

  if (mrError) {
    return { data: null, error: toApiError(mrError) };
  }

  const resourceWithModules: ResourceWithModules = {
    ...resourceData,
    module_resources: (moduleResources || []).map((mr: any) => ({
      id: mr.id,
      module_id: mr.module_id,
      modules: mr.modules,
    })),
  };

  return { data: resourceWithModules, error: null };
}

