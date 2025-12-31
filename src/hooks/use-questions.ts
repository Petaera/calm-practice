import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  createQuestionForAssessment,
  updateQuestion,
  updateAssessmentQuestion,
  deleteQuestionFromAssessment,
  reorderQuestions,
  getAssessmentQuestions,
  duplicateQuestion,
  getLibraryQuestions,
  addLibraryQuestionToAssessment,
  saveQuestionToLibrary,
  removeQuestionFromLibrary,
  searchLibraryQuestions,
} from "@/services/questions.service";
import {
  createSubmission,
  createPublicSubmission,
  getSubmissionsByAssessment,
  getSubmissionById,
} from "@/services/submissions.service";
import type { CreateSubmissionData, PublicSubmissionData, SubmissionWithResponses } from "@/services/submissions.service";
import type {
  Question,
  QuestionInsert,
  QuestionUpdate,
  AssessmentQuestion,
  AssessmentQuestionInsert,
  AssessmentQuestionUpdate,
  AssessmentSubmission,
  PaginatedResponse,
} from "@/lib/supabase";

/**
 * Hook to fetch questions for an assessment
 */
export function useAssessmentQuestions(assessmentId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!assessmentId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getAssessmentQuestions(assessmentId);
  }, [assessmentId]);

  return useSupabaseQuery<(AssessmentQuestion & { questions: Question })[]>(
    queryFn,
    [assessmentId],
    { enabled: !!assessmentId }
  );
}

/**
 * Hook for creating a question and adding it to an assessment
 */
export function useCreateQuestion() {
  const mutationFn = useCallback(
    ({
      assessmentId,
      question,
      assessmentQuestionData,
    }: {
      assessmentId: string;
      question: QuestionInsert;
      assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>;
    }) => {
      return createQuestionForAssessment(assessmentId, question, assessmentQuestionData);
    },
    []
  );

  return useSupabaseMutation<
    { question: Question; assessmentQuestion: AssessmentQuestion },
    {
      assessmentId: string;
      question: QuestionInsert;
      assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>;
    }
  >(mutationFn);
}

/**
 * Hook for updating a question
 */
export function useUpdateQuestion() {
  const mutationFn = useCallback(
    ({ questionId, updates }: { questionId: string; updates: QuestionUpdate }) => {
      return updateQuestion(questionId, updates);
    },
    []
  );

  return useSupabaseMutation<Question, { questionId: string; updates: QuestionUpdate }>(
    mutationFn
  );
}

/**
 * Hook for updating assessment question settings
 */
export function useUpdateAssessmentQuestion() {
  const mutationFn = useCallback(
    ({
      assessmentQuestionId,
      updates,
    }: {
      assessmentQuestionId: string;
      updates: AssessmentQuestionUpdate;
    }) => {
      return updateAssessmentQuestion(assessmentQuestionId, updates);
    },
    []
  );

  return useSupabaseMutation<
    AssessmentQuestion,
    { assessmentQuestionId: string; updates: AssessmentQuestionUpdate }
  >(mutationFn);
}

/**
 * Hook for deleting a question from an assessment
 */
export function useDeleteQuestion() {
  const mutationFn = useCallback(
    ({
      assessmentQuestionId,
      deleteQuestionRecord = true,
    }: {
      assessmentQuestionId: string;
      deleteQuestionRecord?: boolean;
    }) => {
      return deleteQuestionFromAssessment(assessmentQuestionId, deleteQuestionRecord);
    },
    []
  );

  return useSupabaseMutation<null, { assessmentQuestionId: string; deleteQuestionRecord?: boolean }>(
    mutationFn
  );
}

/**
 * Hook for reordering questions
 */
export function useReorderQuestions() {
  const mutationFn = useCallback(
    ({
      assessmentId,
      orderedAssessmentQuestionIds,
    }: {
      assessmentId: string;
      orderedAssessmentQuestionIds: string[];
    }) => {
      return reorderQuestions(assessmentId, orderedAssessmentQuestionIds);
    },
    []
  );

  return useSupabaseMutation<
    null,
    { assessmentId: string; orderedAssessmentQuestionIds: string[] }
  >(mutationFn);
}

/**
 * Hook for duplicating a question
 */
export function useDuplicateQuestion() {
  const mutationFn = useCallback((assessmentQuestionId: string) => {
    return duplicateQuestion(assessmentQuestionId);
  }, []);

  return useSupabaseMutation<
    { question: Question; assessmentQuestion: AssessmentQuestion },
    string
  >(mutationFn);
}

// ============= Question Library Hooks =============

/**
 * Hook to fetch all library questions for a therapist
 */
export function useLibraryQuestions(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getLibraryQuestions(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<Question[]>(
    queryFn,
    ["library", therapistId],
    { enabled: !!therapistId }
  );
}

/**
 * Hook for searching library questions
 */
export function useSearchLibraryQuestions(
  therapistId: string | undefined,
  searchTerm: string
) {
  const queryFn = useCallback(() => {
    if (!therapistId || !searchTerm.trim()) {
      return Promise.resolve({ data: null, error: null });
    }
    return searchLibraryQuestions(therapistId, searchTerm);
  }, [therapistId, searchTerm]);

  return useSupabaseQuery<Question[]>(
    queryFn,
    ["library-search", therapistId, searchTerm],
    { enabled: !!therapistId && searchTerm.trim().length > 0 }
  );
}

/**
 * Hook for adding a library question to an assessment
 */
export function useAddLibraryQuestion() {
  const mutationFn = useCallback(
    ({
      assessmentId,
      questionId,
      assessmentQuestionData,
    }: {
      assessmentId: string;
      questionId: string;
      assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>;
    }) => {
      return addLibraryQuestionToAssessment(assessmentId, questionId, assessmentQuestionData);
    },
    []
  );

  return useSupabaseMutation<
    AssessmentQuestion,
    {
      assessmentId: string;
      questionId: string;
      assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>;
    }
  >(mutationFn);
}

/**
 * Hook for saving a question to the library
 */
export function useSaveToLibrary() {
  const mutationFn = useCallback((questionId: string) => {
    return saveQuestionToLibrary(questionId);
  }, []);

  return useSupabaseMutation<Question, string>(mutationFn);
}

/**
 * Hook for removing a question from the library
 */
export function useRemoveFromLibrary() {
  const mutationFn = useCallback((questionId: string) => {
    return removeQuestionFromLibrary(questionId);
  }, []);

  return useSupabaseMutation<Question, string>(mutationFn);
}

// ============= Submission Hooks =============

/**
 * Hook to fetch submissions for an assessment
 */
export function useAssessmentSubmissions(
  assessmentId: string | undefined,
  page: number = 1
) {
  const queryFn = useCallback(() => {
    if (!assessmentId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getSubmissionsByAssessment(assessmentId, { page, pageSize: 10 });
  }, [assessmentId, page]);

  return useSupabaseQuery<PaginatedResponse<AssessmentSubmission & { clients: { full_name: string } }>>(
    queryFn,
    [assessmentId, page],
    { enabled: !!assessmentId }
  );
}

/**
 * Hook to fetch a single submission with responses
 */
export function useSubmission(submissionId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!submissionId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getSubmissionById(submissionId);
  }, [submissionId]);

  return useSupabaseQuery<SubmissionWithResponses>(
    queryFn,
    [submissionId],
    { enabled: !!submissionId }
  );
}

/**
 * Hook for creating a submission
 */
export function useCreateSubmission() {
  const mutationFn = useCallback((data: CreateSubmissionData) => {
    return createSubmission(data);
  }, []);

  return useSupabaseMutation<AssessmentSubmission, CreateSubmissionData>(mutationFn);
}

/**
 * Hook for creating a public submission (from share link)
 */
export function useCreatePublicSubmission() {
  const mutationFn = useCallback((data: PublicSubmissionData) => {
    return createPublicSubmission(data);
  }, []);

  return useSupabaseMutation<AssessmentSubmission, PublicSubmissionData>(mutationFn);
}

