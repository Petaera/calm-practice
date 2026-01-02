import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { Module, ModuleInsert, ModuleUpdate, ModuleWithCounts } from "@/lib/supabase/types";
import {
  getModules,
  getModulesWithCounts,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  generateModuleShareToken,
  revokeModuleShareToken,
  toggleModuleActive,
  reorderModules,
  type ModuleQueryOptions,
} from "@/services/modules.service";

const QUERY_KEYS = {
  modules: (therapistId: string) => ["modules", therapistId],
  modulesWithCounts: (therapistId: string) => ["modules", therapistId, "withCounts"],
  module: (moduleId: string) => ["modules", moduleId],
};

/**
 * Fetch all modules for the current therapist with optional filtering/pagination
 */
export function useModules(options?: ModuleQueryOptions) {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.modules(therapist?.id || ""), options],
    queryFn: async () => {
      if (!therapist?.id) return null;
      const result = await getModules(therapist.id, options);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Fetch modules with resource and assignment counts
 */
export function useModulesWithCounts() {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.modulesWithCounts(therapist?.id || ""),
    queryFn: async () => {
      if (!therapist?.id) return [];
      const result = await getModulesWithCounts(therapist.id);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!therapist?.id,
  });
}

/**
 * Fetch a single module by ID
 */
export function useModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.module(moduleId || ""),
    queryFn: async () => {
      if (!moduleId) return null;
      const result = await getModuleById(moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!moduleId,
  });
}

/**
 * Create a new module
 */
export function useCreateModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (data: ModuleInsert) => {
      const result = await createModule(data);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesWithCounts(therapist.id) });
      }
    },
  });
}

/**
 * Update an existing module
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, updates }: { moduleId: string; updates: ModuleUpdate }) => {
      const result = await updateModule(moduleId, updates);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (therapist?.id && data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesWithCounts(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.module(data.id) });
      }
    },
  });
}

/**
 * Delete a module
 */
export function useDeleteModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const result = await deleteModule(moduleId);
      if (result.error) throw new Error(result.error.message);
      return moduleId;
    },
    onSuccess: () => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesWithCounts(therapist.id) });
      }
    },
  });
}

/**
 * Generate a share token for a module
 */
export function useGenerateShareToken() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const result = await generateModuleShareToken(moduleId);
      if (result.error) throw new Error(result.error.message);
      return { moduleId, shareToken: result.data };
    },
    onSuccess: ({ moduleId }) => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.module(moduleId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
      }
    },
  });
}

/**
 * Revoke share token for a module
 */
export function useRevokeShareToken() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const result = await revokeModuleShareToken(moduleId);
      if (result.error) throw new Error(result.error.message);
      return moduleId;
    },
    onSuccess: (moduleId) => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.module(moduleId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
      }
    },
  });
}

/**
 * Toggle module active status
 */
export function useToggleModuleActive() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: string; isActive: boolean }) => {
      const result = await toggleModuleActive(moduleId, isActive);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (therapist?.id && data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesWithCounts(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.module(data.id) });
      }
    },
  });
}

/**
 * Reorder modules
 */
export function useReorderModules() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async (moduleOrders: { id: string; display_order: number }[]) => {
      const result = await reorderModules(moduleOrders);
      if (result.error) throw new Error(result.error.message);
      return moduleOrders;
    },
    onSuccess: () => {
      if (therapist?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(therapist.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modulesWithCounts(therapist.id) });
      }
    },
  });
}

