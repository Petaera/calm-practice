// Core query hooks
export {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
export type {
  UseQueryResult,
  UseQueryOptions,
  UseMutationResult,
} from "./use-supabase-query";

// Client hooks
export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useArchiveClient,
  useDeleteClient,
  useClientCountByStatus,
} from "./use-clients";

// Session hooks
export {
  useSessions,
  useUpcomingSessions,
  useSessionsByDate,
  useSession,
  useCreateSession,
  useUpdateSession,
  useCancelSession,
  useCompleteSession,
  useDeleteSession,
} from "./use-sessions";

// Task hooks
export {
  useTasks,
  usePendingTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useStartTask,
  useCancelTask,
  useDeleteTask,
  useTaskCountByStatus,
} from "./use-tasks";

// Note hooks
export {
  useNotes,
  useRecentNotes,
  useNotesByClient,
  useNote,
  useCreateNote,
  useUpdateNote,
  useArchiveNote,
  useUnarchiveNote,
  useToggleNoteImportant,
  useDeleteNote,
} from "./use-notes";

// Assessment hooks
export {
  useAssessments,
  useAssessmentsWithCounts,
  useAssessment,
  useAssessmentByToken,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useGenerateShareToken,
  useRevokeShareToken,
  useToggleAssessmentActive,
  // Assignment hooks
  useAssignedClients,
  useAssignClients,
  useRemoveAssignment,
  useUpdateAssignment,
} from "./use-assessments";

// Question and Submission hooks
export {
  useAssessmentQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useUpdateAssessmentQuestion,
  useDeleteQuestion,
  useReorderQuestions,
  useDuplicateQuestion,
  // Library hooks
  useLibraryQuestions,
  useSearchLibraryQuestions,
  useAddLibraryQuestion,
  useSaveToLibrary,
  useRemoveFromLibrary,
  // Submission hooks
  useAssessmentSubmissions,
  useSubmission,
  useCreateSubmission,
  useCreatePublicSubmission,
} from "./use-questions";

// Existing hooks
export { useIsMobile } from "./use-mobile";
export { useToast, toast } from "./use-toast";

