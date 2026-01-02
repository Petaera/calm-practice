import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  assignClientsToResource,
  getAssignedClients,
  getAssignedResources,
  removeAssignment,
  removeResourceClientAssignment,
  updateAssignment,
  markAssignmentAccessed,
  completeAssignment,
  getAssignmentCounts,
  getAllClientResources,
} from "@/services/resource-assignments.service";

const QUERY_KEYS = {
  assignedClients: (resourceId: string) => ["resource-assignments", "clients", resourceId],
  assignedResources: (clientId: string) => ["resource-assignments", "resources", clientId],
  assignmentCounts: (resourceId: string) => ["resource-assignments", "counts", resourceId],
  allClientResources: (clientId: string, therapistId: string) => [
    "resource-assignments",
    "all-resources",
    clientId,
    therapistId,
  ],
};

/**
 * Get all clients assigned to a resource
 */
export function useAssignedClients(resourceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignedClients(resourceId || ""),
    queryFn: async () => {
      if (!resourceId) return [];
      const result = await getAssignedClients(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!resourceId,
  });
}

/**
 * Get all resources assigned to a client
 */
export function useAssignedResources(clientId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignedResources(clientId || ""),
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getAssignedResources(clientId);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!clientId,
  });
}

/**
 * Get assignment counts for a resource
 */
export function useAssignmentCounts(resourceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.assignmentCounts(resourceId || ""),
    queryFn: async () => {
      if (!resourceId) return null;
      const result = await getAssignmentCounts(resourceId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!resourceId,
  });
}

/**
 * Get all resources accessible to a client (directly assigned + from modules)
 */
export function useAllClientResources(clientId: string | undefined) {
  const { therapist } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.allClientResources(clientId || "", therapist?.id || ""),
    queryFn: async () => {
      if (!clientId || !therapist?.id) return [];
      const result = await getAllClientResources(clientId, therapist.id);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    enabled: !!clientId && !!therapist?.id,
  });
}

/**
 * Assign clients to a resource
 */
export function useAssignClientsToResource() {
  const queryClient = useQueryClient();
  const { therapist } = useAuth();

  return useMutation({
    mutationFn: async ({
      resourceId,
      clientIds,
      therapistNotes,
    }: {
      resourceId: string;
      clientIds: string[];
      therapistNotes?: string;
    }) => {
      if (!therapist?.id) throw new Error("Not authenticated");
      const result = await assignClientsToResource(resourceId, clientIds, therapist.id, {
        therapistNotes,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedClients(variables.resourceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentCounts(variables.resourceId) });
      // Invalidate assigned resources for each client
      variables.clientIds.forEach((clientId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedResources(clientId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allClientResources(clientId, therapist?.id || "") });
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
      // Invalidate all assignment queries since we don't know which resource/client it was
      queryClient.invalidateQueries({ queryKey: ["resource-assignments"] });
    },
  });
}

/**
 * Remove a resource-client assignment
 */
export function useRemoveResourceClientAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      clientId,
    }: {
      resourceId: string;
      clientId: string;
    }) => {
      const result = await removeResourceClientAssignment(resourceId, clientId);
      if (result.error) throw new Error(result.error.message);
      return { resourceId, clientId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedClients(variables.resourceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignedResources(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: ["resource-assignments"] });
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
      queryClient.invalidateQueries({ queryKey: ["resource-assignments"] });
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
      queryClient.invalidateQueries({ queryKey: ["resource-assignments"] });
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
      queryClient.invalidateQueries({ queryKey: ["resource-assignments"] });
    },
  });
}

