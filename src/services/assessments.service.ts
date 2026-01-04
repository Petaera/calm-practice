import { supabase } from "@/lib/supabase/client";
import type {
  Assessment,
  AssessmentInsert,
  AssessmentUpdate,
  AssessmentWithQuestions,
  PublicAssessmentData,
  AssessmentAssignment,
  AssessmentAssignmentInsert,
  AssessmentAssignmentUpdate,
  AssessmentAssignmentWithClient,
} from "@/lib/supabase/types";
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SortParams,
} from "@/lib/supabase/api-types";
import {
  toApiError,
  getPaginationRange,
  createPaginatedResponse,
} from "@/lib/supabase/api-types";

export interface AssessmentFilters {
  category?: string;
  is_active?: boolean;
  search?: string;
}

export interface AssessmentQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: AssessmentFilters;
}

/**
 * Generate a unique share token for public assessment access
 * Uses crypto.randomUUID for secure, unguessable tokens
 */
export function generateShareToken(): string {
  return crypto.randomUUID();
}

/**
 * Fetch all assessments for a therapist with optional filtering and pagination
 */
export async function getAssessments(
  therapistId: string,
  options?: AssessmentQueryOptions
): Promise<ApiResponse<PaginatedResponse<Assessment>>> {
  let query = supabase
    .from("assessments")
    .select("*", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.is_active !== undefined) {
    query = query.eq("is_active", options.filters.is_active);
  }
  if (options?.filters?.category) {
    query = query.eq("category", options.filters.category);
  }
  if (options?.filters?.search) {
    query = query.or(
      `title.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
    );
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply pagination
  if (options?.pagination) {
    const { from, to } = getPaginationRange(options.pagination);
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return {
    data: createPaginatedResponse(
      data ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch assessments with their question counts
 */
export async function getAssessmentsWithQuestionCounts(
  therapistId: string
): Promise<ApiResponse<(Assessment & { question_count: number })[]>> {
  const { data, error } = await supabase
    .from("assessments")
    .select(`
      *,
      assessment_questions(count)
    `)
    .eq("therapist_id", therapistId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  // Transform the response to include question_count
  const assessmentsWithCounts = (data ?? []).map((assessment) => ({
    ...assessment,
    question_count: (assessment.assessment_questions as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return { data: assessmentsWithCounts, error: null };
}

/**
 * Fetch a single assessment by ID with all its questions
 */
export async function getAssessmentById(
  assessmentId: string
): Promise<ApiResponse<AssessmentWithQuestions>> {
  const { data, error } = await supabase
    .from("assessments")
    .select(`
      *,
      assessment_questions (
        *,
        questions (*)
      )
    `)
    .eq("id", assessmentId)
    .order("question_order", { referencedTable: "assessment_questions", ascending: true })
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as AssessmentWithQuestions, error: null };
}

/**
 * Fetch assessment by share token for public access (no auth required)
 */
export async function getAssessmentByShareToken(
  shareToken: string
): Promise<ApiResponse<PublicAssessmentData>> {
  const { data, error } = await supabase
    .from("assessments")
    .select(`
      id,
      therapist_id,
      title,
      description,
      category,
      allow_multiple_submissions,
      assessment_questions (
        id,
        question_order,
        is_required,
        override_question_text,
        override_options,
        override_help_text,
        questions (
          id,
          question_text,
          question_type,
          options,
          help_text
        )
      )
    `)
    .eq("share_token", shareToken)
    .eq("is_active", true)
    .order("question_order", { referencedTable: "assessment_questions", ascending: true })
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  // Transform to PublicAssessmentData format
  const questions = ((data.assessment_questions as unknown) as Array<{
    id: string;
    question_order: number;
    is_required: boolean | null;
    override_question_text: string | null;
    override_options: unknown | null;
    override_help_text: string | null;
    questions: {
      id: string;
      question_text: string;
      question_type: string;
      options: unknown | null;
      help_text: string | null;
    };
  }>).map((aq) => ({
    id: aq.questions.id,
    assessment_question_id: aq.id,
    question_text: aq.override_question_text ?? aq.questions.question_text,
    question_type: aq.questions.question_type,
    options: (aq.override_options ?? aq.questions.options) as import("@/lib/supabase/types").Json | null,
    help_text: aq.override_help_text ?? aq.questions.help_text,
    is_required: aq.is_required,
    question_order: aq.question_order,
  }));

  const publicData: PublicAssessmentData = {
    id: data.id,
    therapist_id: data.therapist_id,
    title: data.title,
    description: data.description,
    category: data.category,
    allow_multiple_submissions: data.allow_multiple_submissions,
    questions,
  };

  return { data: publicData, error: null };
}

/**
 * Create a new assessment
 */
export async function createAssessment(
  assessment: AssessmentInsert
): Promise<ApiResponse<Assessment>> {
  const { data, error } = await supabase
    .from("assessments")
    .insert(assessment)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing assessment
 */
export async function updateAssessment(
  assessmentId: string,
  updates: AssessmentUpdate
): Promise<ApiResponse<Assessment>> {
  const { data, error } = await supabase
    .from("assessments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assessmentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Generate and set a share token for an assessment
 */
export async function generateAssessmentShareToken(
  assessmentId: string
): Promise<ApiResponse<string>> {
  const shareToken = generateShareToken();

  const { error } = await supabase
    .from("assessments")
    .update({ share_token: shareToken, updated_at: new Date().toISOString() })
    .eq("id", assessmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: shareToken, error: null };
}

/**
 * Remove share token from an assessment (revoke public access)
 */
export async function revokeAssessmentShareToken(
  assessmentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("assessments")
    .update({ share_token: null, updated_at: new Date().toISOString() })
    .eq("id", assessmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Delete an assessment
 * CASCADE foreign key automatically deletes related assessment_questions
 */
export async function deleteAssessment(
  assessmentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Toggle assessment active status
 */
export async function toggleAssessmentActive(
  assessmentId: string,
  isActive: boolean
): Promise<ApiResponse<Assessment>> {
  return updateAssessment(assessmentId, { is_active: isActive });
}

// ==================== CLIENT ASSIGNMENT FUNCTIONS ====================

/**
 * Assign clients to an assessment
 */
export async function assignClientsToAssessment(
  assessmentId: string,
  clientIds: string[],
  therapistId: string,
  options?: { dueDate?: string; notes?: string }
): Promise<ApiResponse<AssessmentAssignment[]>> {
  const assignments: AssessmentAssignmentInsert[] = clientIds.map((clientId) => ({
    assessment_id: assessmentId,
    client_id: clientId,
    therapist_id: therapistId,
    due_date: options?.dueDate || null,
    notes: options?.notes || null,
    status: "pending",
  }));

  const { data, error } = await supabase
    .from("assessment_assignments")
    .upsert(assignments, { onConflict: "assessment_id,client_id" })
    .select();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Get all clients assigned to an assessment
 */
export async function getAssignedClients(
  assessmentId: string
): Promise<ApiResponse<AssessmentAssignmentWithClient[]>> {
  const { data, error } = await supabase
    .from("assessment_assignments")
    .select(`
      *,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq("assessment_id", assessmentId)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as AssessmentAssignmentWithClient[], error: null };
}

/**
 * Get all assessments assigned to a client
 */
export async function getAssignedAssessments(
  clientId: string
): Promise<ApiResponse<(AssessmentAssignment & { assessments: Assessment })[]>> {
  const { data, error } = await supabase
    .from("assessment_assignments")
    .select(`
      *,
      assessments (*)
    `)
    .eq("client_id", clientId)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as (AssessmentAssignment & { assessments: Assessment })[], error: null };
}

/**
 * Remove a client assignment from an assessment
 */
export async function removeAssignment(
  assignmentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from("assessment_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Update an assignment (e.g., due date, status, notes)
 */
export async function updateAssignment(
  assignmentId: string,
  updates: AssessmentAssignmentUpdate
): Promise<ApiResponse<AssessmentAssignment>> {
  const { data, error } = await supabase
    .from("assessment_assignments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Mark an assignment as completed
 */
export async function completeAssignment(
  assignmentId: string,
  submissionId?: string
): Promise<ApiResponse<AssessmentAssignment>> {
  return updateAssignment(assignmentId, {
    status: "completed",
    completed_at: new Date().toISOString(),
    submission_id: submissionId || null,
  });
}

/**
 * Get assignment counts for an assessment
 */
export async function getAssignmentCounts(
  assessmentId: string
): Promise<ApiResponse<{ total: number; pending: number; completed: number }>> {
  const { data, error } = await supabase
    .from("assessment_assignments")
    .select("status")
    .eq("assessment_id", assessmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const counts = {
    total: data.length,
    pending: data.filter((a) => a.status === "pending" || a.status === "in_progress").length,
    completed: data.filter((a) => a.status === "completed").length,
  };

  return { data: counts, error: null };
}

