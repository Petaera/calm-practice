// Clients Service
export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  deleteClient,
  getClientCountByStatus,
} from "./clients.service";
export type { ClientFilters, ClientQueryOptions } from "./clients.service";

// Sessions Service
export {
  getSessions,
  getUpcomingSessions,
  getSessionById,
  createSession,
  updateSession,
  cancelSession,
  completeSession,
  deleteSession,
  getSessionsByDate,
} from "./sessions.service";
export type {
  SessionFilters,
  SessionQueryOptions,
  SessionWithClient,
} from "./sessions.service";

// Tasks Service
export {
  getTasks,
  getPendingTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  startTask,
  cancelTask,
  deleteTask,
  getTaskCountByStatus,
} from "./tasks.service";
export type {
  TaskFilters,
  TaskQueryOptions,
  TaskWithClient,
} from "./tasks.service";

// Notes Service
export {
  getNotes,
  getRecentNotes,
  getNotesByClient,
  getNoteById,
  createNote,
  updateNote,
  archiveNote,
  unarchiveNote,
  toggleNoteImportant,
  deleteNote,
} from "./notes.service";
export type {
  NoteFilters,
  NoteQueryOptions,
  NoteWithClient,
} from "./notes.service";

// Therapist Service
export {
  getTherapistById,
  getTherapistByEmail,
  createTherapist,
  updateTherapist,
  getTherapistSettings,
  createTherapistSettings,
  updateTherapistSettings,
  getOrCreateTherapistSettings,
} from "./therapist.service";

// Assessments Service
export {
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
  generateShareToken,
  // Client assignment functions
  assignClientsToAssessment,
  getAssignedClients,
  getAssignedAssessments,
  removeAssignment,
  updateAssignment,
  completeAssignment,
  getAssignmentCounts,
} from "./assessments.service";
export type {
  AssessmentFilters,
  AssessmentQueryOptions,
} from "./assessments.service";

// Questions Service
export {
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
} from "./questions.service";

// Submissions Service
export {
  createSubmission,
  createPublicSubmission,
  getSubmissionsByAssessment,
  getSubmissionsByClient,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getSubmissionCount,
} from "./submissions.service";
export type {
  SubmissionWithResponses,
  CreateSubmissionData,
  PublicSubmissionData,
} from "./submissions.service";

// Modules Service
export {
  getModules,
  getModulesWithCounts,
  getModuleById,
  getModuleByShareToken,
  createModule,
  updateModule,
  deleteModule,
  generateModuleShareToken,
  revokeModuleShareToken,
  toggleModuleActive,
  reorderModules,
  generateShareToken as generateModuleToken,
} from "./modules.service";
export type {
  ModuleFilters,
  ModuleQueryOptions,
} from "./modules.service";

// Resources Service
export {
  getResources,
  getResourcesByModule,
  getUnorganizedResources,
  getResourceById,
  createResource,
  updateResource,
  moveResourceToModule,
  deleteResource,
  getResourceTags,
  searchResourcesByTags,
  getResourceCountByType,
} from "./resources.service";
export type {
  ResourceFilters,
  ResourceQueryOptions,
} from "./resources.service";

// Module Assignments Service
export {
  assignClientsToModule,
  getAssignedClients as getModuleAssignedClients,
  getAssignedModules,
  removeAssignment as removeModuleAssignment,
  updateAssignment as updateModuleAssignment,
  markAssignmentAccessed,
  completeAssignment as completeModuleAssignment,
  getAssignmentCounts as getModuleAssignmentCounts,
} from "./module-assignments.service";

// Storage Service
export {
  uploadFile,
  deleteFile,
  getFileUrl,
  getFileMetadata,
  getStorageUsage,
  formatFileSize,
  isValidFileType,
  getFileIcon,
} from "./storage.service";
export type {
  UploadProgress,
  UploadResult,
} from "./storage.service";

// Link Preview Service
export {
  fetchLinkPreview,
  validateUrl,
  extractDomain,
  getFaviconUrl,
  isVideoUrl,
} from "./link-preview.service";
export type {
  LinkPreview,
} from "./link-preview.service";

