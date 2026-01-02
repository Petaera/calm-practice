import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  addResourcesToModules,
  removeResourcesFromModules,
  removeResourceFromAllModules,
  getModulesForResource,
  getResourcesInModule,
  getResourceWithModules,
} from "@/services/module-resources.service";

const QUERY_KEYS = {
  modulesForResource: (resourceId: string) => ["module-resources", "modules", resourceId],
  resourcesInModule: (moduleId: string) => ["module-resources", "resources", moduleId],
  resourceWithModules: (resourceId: string) => ["module-resources", "resource", resourceId],
};

/**
 * Get all modules that contain a resource
 */
export function useModulesForResource(resourceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.modulesForResource(resourceId || ""),
    queryFn: async () => {
      if (!resourceId) return [];
      const result = await getModulesForResource(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!resourceId,
  });
}

/**
 * Get all resources in a module (using junction table)
 */
export function useResourcesInModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.resourcesInModule(moduleId || ""),
    queryFn: async () => {
      if (!moduleId) return [];
      const result = await getResourcesInModule(moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!moduleId,
  });
}

/**
 * Get resource with its modules
 */
export function useResourceWithModules(resourceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.resourceWithModules(resourceId || ""),
    queryFn: async () => {
      if (!resourceId) return null;
      const result = await getResourceWithModules(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!resourceId,
  });
}

/**
 * Add resources to modules
 */
export function useAddResourcesToModules() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({
      resourceIds,
      moduleIds,
    }: {
      resourceIds: string[];
      moduleIds: string[];
    }) => {
      const result = await addResourcesToModules(resourceIds, moduleIds);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for affected resources and modules
      variables.resourceIds.forEach((resourceId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesForResource(resourceId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceWithModules(resourceId) });
      });
      variables.moduleIds.forEach((moduleId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesInModule(moduleId) });
      });
      // Also invalidate general resource queries
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      // Invalidate modules with counts to update resource counts
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: ["modules", therapist.id, "withCounts"] });
      }
    },
  });
}

/**
 * Remove resources from modules
 */
export function useRemoveResourcesFromModules() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({
      resourceIds,
      moduleIds,
    }: {
      resourceIds: string[];
      moduleIds: string[];
    }) => {
      const result = await removeResourcesFromModules(resourceIds, moduleIds);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for affected resources and modules
      variables.resourceIds.forEach((resourceId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesForResource(resourceId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceWithModules(resourceId) });
      });
      variables.moduleIds.forEach((moduleId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourcesInModule(moduleId) });
      });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      // Invalidate modules with counts to update resource counts
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: ["modules", therapist.id, "withCounts"] });
      }
    },
  });
}

/**
 * Remove a resource from all modules
 */
export function useRemoveResourceFromAllModules() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const result = await removeResourceFromAllModules(resourceId);
      if (result.error) throw new Error(result.error.message);
      return resourceId;
    },
    onSuccess: (resourceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesForResource(resourceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resourceWithModules(resourceId) });
      queryClient.invalidateQueries({ queryKey: ["module-resources", "resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      // Invalidate modules with counts to update resource counts
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: ["modules", therapist.id, "withCounts"] });
      }
    },
  });
}

