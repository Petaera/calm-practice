import { supabase } from "@/lib/supabase/client";
import type {
  AssessmentSubmission,
  AssessmentSubmissionInsert,
  AssessmentResponse,
  AssessmentResponseInsert,
} from "@/lib/supabase/types";
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@/lib/supabase/api-types";
import {
  toApiError,
  getPaginationRange,
  createPaginatedResponse,
} from "@/lib/supabase/api-types";

// Type for submission with responses included
export interface SubmissionWithResponses extends AssessmentSubmission {
  assessment_responses: (AssessmentResponse & {
    questions?: {
      question_text: string;
      question_type: string;
    };
  })[];
}

// Type for creating a submission with all responses
export interface CreateSubmissionData {
  assessmentId: string;
  clientId: string;
  therapistId: string;
  sessionId?: string;
  responses: {
    assessmentQuestionId: string;
    questionId: string;
    responseValue?: string;
    responseValues?: string[];
    numericValue?: number;
  }[];
  completionTimeSeconds?: number;
}

// Type for public submission (from share link)
export interface PublicSubmissionData {
  assessmentId: string;
  therapistId: string;
  clientName: string;
  clientEmail?: string;
  responses: {
    assessmentQuestionId: string;
    questionId: string;
    responseValue?: string;
    responseValues?: string[];
    numericValue?: number;
  }[];
  completionTimeSeconds?: number;
}

/**
 * Create a new submission with all responses in a single transaction
 */
export async function createSubmission(
  data: CreateSubmissionData
): Promise<ApiResponse<AssessmentSubmission>> {
  // Create the submission
  const submissionData: AssessmentSubmissionInsert = {
    assessment_id: data.assessmentId,
    client_id: data.clientId,
    therapist_id: data.therapistId,
    session_id: data.sessionId,
    completion_time_seconds: data.completionTimeSeconds,
    status: "completed",
    submitted_at: new Date().toISOString(),
  };

  const { data: submission, error: submissionError } = await supabase
    .from("assessment_submissions")
    .insert(submissionData)
    .select()
    .single();

  if (submissionError) {
    return { data: null, error: toApiError(submissionError) };
  }

  // Create all responses
  const responsesData: AssessmentResponseInsert[] = data.responses.map((r) => ({
    submission_id: submission.id,
    assessment_question_id: r.assessmentQuestionId,
    question_id: r.questionId,
    response_value: r.responseValue,
    response_values: r.responseValues,
    numeric_value: r.numericValue,
  }));

  const { error: responsesError } = await supabase
    .from("assessment_responses")
    .insert(responsesData);

  if (responsesError) {
    // Rollback: delete the submission
    await supabase.from("assessment_submissions").delete().eq("id", submission.id);
    return { data: null, error: toApiError(responsesError) };
  }

  return { data: submission, error: null };
}

/**
 * Create a public submission (from share link - creates a temporary client record)
 * This is used when a client accesses an assessment via a public share link
 */
export async function createPublicSubmission(
  data: PublicSubmissionData
): Promise<ApiResponse<AssessmentSubmission>> {
  // First, get the assessment to verify it exists and is active
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, therapist_id, is_active")
    .eq("id", data.assessmentId)
    .single();

  if (assessmentError || !assessment) {
    return { data: null, error: assessmentError ? toApiError(assessmentError) : { message: "Assessment not found" } };
  }

  if (!assessment.is_active) {
    return { data: null, error: { message: "This assessment is no longer accepting submissions" } };
  }

  // Check if a client with this email already exists for this therapist
  let clientId: string | null = null;

  if (data.clientEmail) {
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("therapist_id", data.therapistId)
      .eq("email", data.clientEmail)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    }
  }

  // If no existing client, create a new one
  if (!clientId) {
    const clientIdCode = `ASSESS-${Date.now().toString(36).toUpperCase()}`;
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        therapist_id: data.therapistId,
        client_id: clientIdCode,
        full_name: data.clientName,
        email: data.clientEmail,
        status: "Active",
        intake_notes: "Created via public assessment submission",
      })
      .select()
      .single();

    if (clientError) {
      return { data: null, error: toApiError(clientError) };
    }

    clientId = newClient.id;
  }

  // Now create the submission
  return createSubmission({
    assessmentId: data.assessmentId,
    clientId,
    therapistId: data.therapistId,
    responses: data.responses,
    completionTimeSeconds: data.completionTimeSeconds,
  });
}

/**
 * Get all submissions for an assessment
 */
export async function getSubmissionsByAssessment(
  assessmentId: string,
  pagination?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<AssessmentSubmission & { clients: { full_name: string } }>>> {
  let query = supabase
    .from("assessment_submissions")
    .select(`
      *,
      clients (full_name)
    `, { count: "exact" })
    .eq("assessment_id", assessmentId)
    .order("submitted_at", { ascending: false });

  if (pagination) {
    const { from, to } = getPaginationRange(pagination);
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
      pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Get all submissions for a client
 */
export async function getSubmissionsByClient(
  clientId: string,
  pagination?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<AssessmentSubmission & { assessments: { title: string } }>>> {
  let query = supabase
    .from("assessment_submissions")
    .select(`
      *,
      assessments (title)
    `, { count: "exact" })
    .eq("client_id", clientId)
    .order("submitted_at", { ascending: false });

  if (pagination) {
    const { from, to } = getPaginationRange(pagination);
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
      pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Get a single submission with all its responses
 */
export async function getSubmissionById(
  submissionId: string
): Promise<ApiResponse<SubmissionWithResponses>> {
  const { data, error } = await supabase
    .from("assessment_submissions")
    .select(`
      *,
      assessment_responses (
        *,
        questions (
          question_text,
          question_type
        )
      )
    `)
    .eq("id", submissionId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as SubmissionWithResponses, error: null };
}

/**
 * Update submission status or add notes
 */
export async function updateSubmission(
  submissionId: string,
  updates: {
    status?: string;
    notes?: string;
    score_interpretation?: string;
    calculated_score?: number;
  }
): Promise<ApiResponse<AssessmentSubmission>> {
  const { data, error } = await supabase
    .from("assessment_submissions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Delete a submission and all its responses
 */
export async function deleteSubmission(
  submissionId: string
): Promise<ApiResponse<null>> {
  // First delete all responses
  const { error: responsesError } = await supabase
    .from("assessment_responses")
    .delete()
    .eq("submission_id", submissionId);

  if (responsesError) {
    return { data: null, error: toApiError(responsesError) };
  }

  // Then delete the submission
  const { error } = await supabase
    .from("assessment_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get submission count for an assessment
 */
export async function getSubmissionCount(
  assessmentId: string
): Promise<ApiResponse<number>> {
  const { count, error } = await supabase
    .from("assessment_submissions")
    .select("id", { count: "exact", head: true })
    .eq("assessment_id", assessmentId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: count ?? 0, error: null };
}

