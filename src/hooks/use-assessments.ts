import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getAssessments,
  getAssessmentsWithQuestionCounts,
  getAssessmentById,
  getAssessmentByShareToken,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  generateAssessmentShareToken,
  revokeAssessmentShareToken,
  toggleAssessmentActive,
  assignClientsToAssessment,
  getAssignedClients,
  removeAssignment,
  updateAssignment,
} from "@/services/assessments.service";
import type { AssessmentQueryOptions } from "@/services/assessments.service";
import type {
  Assessment,
  AssessmentInsert,
  AssessmentUpdate,
  AssessmentWithQuestions,
  PublicAssessmentData,
  PaginatedResponse,
  AssessmentAssignment,
  AssessmentAssignmentUpdate,
  AssessmentAssignmentWithClient,
} from "@/lib/supabase";

/**
 * Hook to fetch paginated assessments with filtering
 */
export function useAssessments(
  therapistId: string | undefined,
  options?: AssessmentQueryOptions
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssessments(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<Assessment>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch assessments with question counts
 */
export function useAssessmentsWithCounts(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssessmentsWithQuestionCounts(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<(Assessment & { question_count: number })[]>(
    queryFn,
    [therapistId],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch a single assessment with its questions
 */
export function useAssessment(assessmentId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!assessmentId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssessmentById(assessmentId);
  }, [assessmentId]);

  return useSupabaseQuery<AssessmentWithQuestions>(
    queryFn,
    [assessmentId],
    { enabled: !!assessmentId }
  );
}

/**
 * Hook to fetch assessment by share token (for public access)
 */
export function useAssessmentByToken(shareToken: string | undefined) {
  const queryFn = useCallback(() => {
    if (!shareToken) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssessmentByShareToken(shareToken);
  }, [shareToken]);

  return useSupabaseQuery<PublicAssessmentData>(
    queryFn,
    [shareToken],
    { enabled: !!shareToken }
  );
}

/**
 * Hook for creating a new assessment
 */
export function useCreateAssessment() {
  const mutationFn = useCallback((assessment: AssessmentInsert) => {
    return createAssessment(assessment);
  }, []);

  return useSupabaseMutation<Assessment, AssessmentInsert>(mutationFn);
}

/**
 * Hook for updating an assessment
 */
export function useUpdateAssessment() {
  const mutationFn = useCallback(
    ({ assessmentId, updates }: { assessmentId: string; updates: AssessmentUpdate }) => {
      return updateAssessment(assessmentId, updates);
    },
    []
  );

  return useSupabaseMutation<Assessment, { assessmentId: string; updates: AssessmentUpdate }>(
    mutationFn
  );
}

/**
 * Hook for deleting an assessment
 */
export function useDeleteAssessment() {
  const mutationFn = useCallback((assessmentId: string) => {
    return deleteAssessment(assessmentId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

/**
 * Hook for generating a share token for an assessment
 */
export function useGenerateShareToken() {
  const mutationFn = useCallback((assessmentId: string) => {
    return generateAssessmentShareToken(assessmentId);
  }, []);

  return useSupabaseMutation<string, string>(mutationFn);
}

/**
 * Hook for revoking a share token
 */
export function useRevokeShareToken() {
  const mutationFn = useCallback((assessmentId: string) => {
    return revokeAssessmentShareToken(assessmentId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

/**
 * Hook for toggling assessment active status
 */
export function useToggleAssessmentActive() {
  const mutationFn = useCallback(
    ({ assessmentId, isActive }: { assessmentId: string; isActive: boolean }) => {
      return toggleAssessmentActive(assessmentId, isActive);
    },
    []
  );

  return useSupabaseMutation<Assessment, { assessmentId: string; isActive: boolean }>(
    mutationFn
  );
}

// ==================== CLIENT ASSIGNMENT HOOKS ====================

/**
 * Hook to fetch clients assigned to an assessment
 */
export function useAssignedClients(assessmentId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!assessmentId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssignedClients(assessmentId);
  }, [assessmentId]);

  return useSupabaseQuery<AssessmentAssignmentWithClient[]>(
    queryFn,
    ["assignments", assessmentId],
    { enabled: !!assessmentId }
  );
}

/**
 * Hook for assigning clients to an assessment
 */
export function useAssignClients() {
  const mutationFn = useCallback(
    ({
      assessmentId,
      clientIds,
      therapistId,
      options,
    }: {
      assessmentId: string;
      clientIds: string[];
      therapistId: string;
      options?: { dueDate?: string; notes?: string };
    }) => {
      return assignClientsToAssessment(assessmentId, clientIds, therapistId, options);
    },
    []
  );

  return useSupabaseMutation<
    AssessmentAssignment[],
    {
      assessmentId: string;
      clientIds: string[];
      therapistId: string;
      options?: { dueDate?: string; notes?: string };
    }
  >(mutationFn);
}

/**
 * Hook for removing an assignment
 */
export function useRemoveAssignment() {
  const mutationFn = useCallback((assignmentId: string) => {
    return removeAssignment(assignmentId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

/**
 * Hook for updating an assignment
 */
export function useUpdateAssignment() {
  const mutationFn = useCallback(
    ({ assignmentId, updates }: { assignmentId: string; updates: AssessmentAssignmentUpdate }) => {
      return updateAssignment(assignmentId, updates);
    },
    []
  );

  return useSupabaseMutation<
    AssessmentAssignment,
    { assignmentId: string; updates: AssessmentAssignmentUpdate }
  >(mutationFn);
}

