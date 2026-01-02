import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  assignClientsToModule,
  getAssignedClients,
  getAssignedModules,
  removeAssignment,
  updateAssignment,
  markAssignmentAccessed,
  completeAssignment,
  getAssignmentCounts,
} from "@/services/module-assignments.service";

const QUERY_KEYS = {
  assignedClients: (moduleId: string) => ["module-assignments", "clients", moduleId],
  assignedModules: (clientId: string) => ["module-assignments", "modules", clientId],
  assignmentCounts: (moduleId: string) => ["module-assignments", "counts", moduleId],
};

/**
 * Get all clients assigned to a module
 */
export function useAssignedClients(moduleId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignedClients(moduleId || ""),
    queryFn: async () => {
      if (!moduleId) return [];
      const result = await getAssignedClients(moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!moduleId,
  });
}

/**
 * Get all modules assigned to a client
 */
export function useAssignedModules(clientId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignedModules(clientId || ""),
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getAssignedModules(clientId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!clientId,
  });
}

/**
 * Get assignment counts for a module
 */
export function useAssignmentCounts(moduleId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignmentCounts(moduleId || ""),
    queryFn: async () => {
      if (!moduleId) return null;
      const result = await getAssignmentCounts(moduleId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!moduleId,
  });
}

/**
 * Assign clients to a module
 */
export function useAssignClientsToModule() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({
      moduleId,
      clientIds,
      therapistNotes,
    }: {
      moduleId: string;
      clientIds: string[];
      therapistNotes?: string;
    }) => {
      if (!therapist?.id) throw new Error("Not authenticated");
      const result = await assignClientsToModule(moduleId, clientIds, therapist.id, {
        therapistNotes,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedClients(variables.moduleId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentCounts(variables.moduleId) });
      // Invalidate assigned modules for each client
      variables.clientIds.forEach((clientId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedModules(clientId) });
      });
    },
  });
}

/**
 * Remove an assignment
 */
export function useRemoveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const result = await removeAssignment(assignmentId);
      if (result.error) throw new Error(result.error.message);
      return assignmentId;
    },
    onSuccess: () => {
      // Invalidate all assignment queries since we don't know which module/client it was
      queryClient.invalidateQueries({ queryKey: ["module-assignments"] });
    },
  });
}

/**
 * Update an assignment
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      updates,
    }: {
      assignmentId: string;
      updates: {
        therapist_notes?: string | null;
        is_active?: boolean;
      };
    }) => {
      const result = await updateAssignment(assignmentId, updates);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-assignments"] });
    },
  });
}

/**
 * Mark an assignment as accessed
 */
export function useMarkAssignmentAccessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const result = await markAssignmentAccessed(assignmentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-assignments"] });
    },
  });
}

/**
 * Mark an assignment as completed
 */
export function useCompleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const result = await completeAssignment(assignmentId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-assignments"] });
    },
  });
}

