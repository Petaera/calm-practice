import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { Resource, ResourceInsert, ResourceUpdate, ResourceType } from "@/lib/supabase/types";
import {
  getResources,
  getResourcesByModule,
  getUnorganizedResources,
  getResourceById,
  createResource,
  updateResource,
  moveResourceToModule,
  addResourcesToModule,
  removeResourceFromModule,
  removeResourcesFromModule,
  deleteResource,
  getResourceTags,
  searchResourcesByTags,
  getResourceCountByType,
  type ResourceQueryOptions,
} from "@/services/resources.service";

const QUERY_KEYS = {
  resources: (therapistId: string) => ["resources", therapistId],
  resourcesByModule: (moduleId: string) => ["resources", "module", moduleId],
  unorganizedResources: (therapistId: string) => ["resources", therapistId, "unorganized"],
  resource: (resourceId: string) => ["resources", resourceId],
  resourceTags: (therapistId: string) => ["resources", therapistId, "tags"],
  resourceCountByType: (therapistId: string) => ["resources", therapistId, "countByType"],
};

/**
 * Fetch all resources for the current therapist with optional filtering/pagination
 */
export function useResources(options?: ResourceQueryOptions) {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.resources(therapist?.id || ""), options],
    queryFn: async () => {
      if (!therapist?.id) return null;
      const result = await getResources(therapist.id, options);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Fetch resources for a specific module
 */
export function useResourcesByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.resourcesByModule(moduleId || ""),
    queryFn: async () => {
      if (!moduleId) return [];
      const result = await getResourcesByModule(moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!moduleId,
  });
}

/**
 * Fetch unorganized resources (not in any module)
 */
export function useUnorganizedResources() {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.unorganizedResources(therapist?.id || ""),
    queryFn: async () => {
      if (!therapist?.id) return [];
      const result = await getUnorganizedResources(therapist.id);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Fetch a single resource by ID
 */
export function useResource(resourceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.resource(resourceId || ""),
    queryFn: async () => {
      if (!resourceId) return null;
      const result = await getResourceById(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!resourceId,
  });
}

/**
 * Fetch all resource tags
 */
export function useResourceTags() {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.resourceTags(therapist?.id || ""),
    queryFn: async () => {
      if (!therapist?.id) return [];
      const result = await getResourceTags(therapist.id);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Get resource count by type
 */
export function useResourceCountByType() {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.resourceCountByType(therapist?.id || ""),
    queryFn: async () => {
      if (!therapist?.id) return null;
      const result = await getResourceCountByType(therapist.id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Create a new resource
 */
export function useCreateResource() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (data: ResourceInsert) => {
      const result = await createResource(data);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceTags(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceCountByType(therapist.id) });
        if (data?.module_id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesByModule(data.module_id) });
        } else {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unorganizedResources(therapist.id) });
        }
      }
    },
  });
}

/**
 * Update an existing resource
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ resourceId, updates }: { resourceId: string; updates: ResourceUpdate }) => {
      const result = await updateResource(resourceId, updates);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (therapist?.id && data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resource(data.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceTags(therapist.id) });
        if (data.module_id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesByModule(data.module_id) });
        }
      }
    },
  });
}

/**
 * Move resource to a different module
 */
export function useMoveResourceToModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ resourceId, moduleId }: { resourceId: string; moduleId: string | null }) => {
      const result = await moveResourceToModule(resourceId, moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: ["resources", "module"] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unorganizedResources(therapist.id) });
      }
    },
  });
}

/**
 * Delete a resource
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const result = await deleteResource(resourceId);
      if (result.error) throw new Error(result.error.message);
      return resourceId;
    },
    onSuccess: () => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceTags(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceCountByType(therapist.id) });
      }
    },
  });
}

/**
 * Search resources by tags
 */
export function useSearchResourcesByTags(tags: string[]) {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.resources(therapist?.id || ""), "byTags", tags],
    queryFn: async () => {
      if (!therapist?.id || tags.length === 0) return [];
      const result = await searchResourcesByTags(therapist.id, tags);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!therapist?.id && tags.length > 0,
  });
}

/**
 * Add multiple resources to a module
 */
export function useAddResourcesToModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, resourceIds }: { moduleId: string; resourceIds: string[] }) => {
      const result = await addResourcesToModule(moduleId, resourceIds);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesByModule(variables.moduleId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unorganizedResources(therapist.id) });
      }
    },
  });
}

/**
 * Remove a resource from a module
 */
export function useRemoveResourceFromModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const result = await removeResourceFromModule(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (therapist?.id && data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resource(data.id) });
        if (data.module_id) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesByModule(data.module_id) });
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unorganizedResources(therapist.id) });
      }
    },
  });
}

/**
 * Remove multiple resources from a module
 */
export function useRemoveResourcesFromModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ resourceIds, moduleId }: { resourceIds: string[]; moduleId?: string }) => {
      const result = await removeResourcesFromModule(resourceIds);
      if (result.error) throw new Error(result.error.message);
      return { data: result.data, moduleId };
    },
    onSuccess: (_, variables) => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resources(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unorganizedResources(therapist.id) });
        if (variables.moduleId) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesByModule(variables.moduleId) });
        }
      }
    },
  });
}

