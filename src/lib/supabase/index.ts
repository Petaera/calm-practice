// Main Supabase client and types
export { supabase } from "./client";
export type { Database } from "./types";

// Domain types
export type {
  Therapist,
  TherapistInsert,
  TherapistUpdate,
  Client,
  ClientInsert,
  ClientUpdate,
  Session,
  SessionInsert,
  SessionUpdate,
  Task,
  TaskInsert,
  TaskUpdate,
  Note,
  NoteInsert,
  NoteUpdate,
  SoapNote,
  SoapNoteInsert,
  SoapNoteUpdate,
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  Assessment,
  AssessmentInsert,
  AssessmentUpdate,
  Question,
  QuestionInsert,
  QuestionUpdate,
  AssessmentQuestion,
  AssessmentQuestionInsert,
  AssessmentQuestionUpdate,
  AssessmentSubmission,
  AssessmentSubmissionInsert,
  AssessmentSubmissionUpdate,
  AssessmentResponse,
  AssessmentResponseInsert,
  AssessmentResponseUpdate,
  AssessmentAssignment,
  AssessmentAssignmentInsert,
  AssessmentAssignmentUpdate,
  TherapistSettings,
  TherapistSettingsInsert,
  TherapistSettingsUpdate,
  Notification,
  NotificationInsert,
  NotificationUpdate,
  ActivityFeed,
  ActivityFeedInsert,
  ActivityFeedUpdate,
  // Extended assessment types
  AssessmentWithQuestions,
  PublicAssessmentData,
  QuestionOption,
  RatingScaleConfig,
  AssessmentAssignmentWithClient,
  AssessmentWithCounts,
} from "./types";

// Enum types
export type {
  ClientStatus,
  SessionStatus,
  SessionType,
  PaymentStatus,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  NoteType,
  AppointmentType,
  AppointmentMode,
  AppointmentStatus,
  NotificationType,
  NotificationPriority,
  QuestionType,
  AssessmentSubmissionStatus,
  AssessmentCategory,
  AssessmentAssignmentStatus,
} from "./types";

// API utilities
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  QueryOptions,
} from "./api-types";

export {
  toApiError,
  getPaginationRange,
  createPaginatedResponse,
} from "./api-types";

