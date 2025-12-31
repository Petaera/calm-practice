import { supabase } from "@/lib/supabase/client";
import type {
  Question,
  QuestionInsert,
  QuestionUpdate,
  AssessmentQuestion,
  AssessmentQuestionInsert,
  AssessmentQuestionUpdate,
} from "@/lib/supabase/types";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";

/**
 * Create a new question and link it to an assessment
 * This creates both the question record and the assessment_question junction record
 */
export async function createQuestionForAssessment(
  assessmentId: string,
  question: QuestionInsert,
  assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>
): Promise<ApiResponse<{ question: Question; assessmentQuestion: AssessmentQuestion }>> {
  // First, get the current max order for this assessment
  const { data: existingQuestions, error: countError } = await supabase
    .from("assessment_questions")
    .select("question_order")
    .eq("assessment_id", assessmentId)
    .order("question_order", { ascending: false })
    .limit(1);

  if (countError) {
    return { data: null, error: toApiError(countError) };
  }

  const nextOrder = (existingQuestions?.[0]?.question_order ?? 0) + 1;

  // Create the question
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert(question)
    .select()
    .single();

  if (questionError) {
    return { data: null, error: toApiError(questionError) };
  }

  // Link question to assessment
  const assessmentQuestionInsert: AssessmentQuestionInsert = {
    assessment_id: assessmentId,
    question_id: questionData.id,
    question_order: assessmentQuestionData?.question_order ?? nextOrder,
    is_required: assessmentQuestionData?.is_required ?? true,
    points: assessmentQuestionData?.points ?? 0,
    ...assessmentQuestionData,
  };

  const { data: assessmentQuestionResult, error: linkError } = await supabase
    .from("assessment_questions")
    .insert(assessmentQuestionInsert)
    .select()
    .single();

  if (linkError) {
    // Rollback: delete the created question
    await supabase.from("questions").delete().eq("id", questionData.id);
    return { data: null, error: toApiError(linkError) };
  }

  return {
    data: {
      question: questionData,
      assessmentQuestion: assessmentQuestionResult,
    },
    error: null,
  };
}

/**
 * Update an existing question
 */
export async function updateQuestion(
  questionId: string,
  updates: QuestionUpdate
): Promise<ApiResponse<Question>> {
  const { data, error } = await supabase
    .from("questions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update assessment question settings (order, required, points, etc.)
 */
export async function updateAssessmentQuestion(
  assessmentQuestionId: string,
  updates: AssessmentQuestionUpdate
): Promise<ApiResponse<AssessmentQuestion>> {
  const { data, error } = await supabase
    .from("assessment_questions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assessmentQuestionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Delete a question from an assessment
 * This removes the link and optionally the question itself
 */
export async function deleteQuestionFromAssessment(
  assessmentQuestionId: string,
  deleteQuestionRecord: boolean = true
): Promise<ApiResponse<null>> {
  // Get the assessment question to find the question_id
  const { data: aq, error: fetchError } = await supabase
    .from("assessment_questions")
    .select("question_id, assessment_id, question_order")
    .eq("id", assessmentQuestionId)
    .single();

  if (fetchError) {
    return { data: null, error: toApiError(fetchError) };
  }

  // Delete the link
  const { error: deleteError } = await supabase
    .from("assessment_questions")
    .delete()
    .eq("id", assessmentQuestionId);

  if (deleteError) {
    return { data: null, error: toApiError(deleteError) };
  }

  // Optionally delete the question record
  if (deleteQuestionRecord) {
    const { error: questionDeleteError } = await supabase
      .from("questions")
      .delete()
      .eq("id", aq.question_id);

    if (questionDeleteError) {
      // Non-critical error, log but continue
      console.warn("Failed to delete question record:", questionDeleteError);
    }
  }

  // Reorder remaining questions
  const { data: remainingQuestions, error: fetchRemainingError } = await supabase
    .from("assessment_questions")
    .select("id, question_order")
    .eq("assessment_id", aq.assessment_id)
    .gt("question_order", aq.question_order)
    .order("question_order", { ascending: true });

  if (!fetchRemainingError && remainingQuestions) {
    // Update order of subsequent questions
    for (const rq of remainingQuestions) {
      await supabase
        .from("assessment_questions")
        .update({ question_order: rq.question_order - 1 })
        .eq("id", rq.id);
    }
  }

  return { data: null, error: null };
}

/**
 * Reorder questions within an assessment
 * Takes an array of assessment_question_ids in the desired order
 */
export async function reorderQuestions(
  assessmentId: string,
  orderedAssessmentQuestionIds: string[]
): Promise<ApiResponse<null>> {
  // Update each question with its new order
  const updates = orderedAssessmentQuestionIds.map((id, index) =>
    supabase
      .from("assessment_questions")
      .update({ question_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("assessment_id", assessmentId)
  );

  const results = await Promise.all(updates);

  // Check for errors
  const failedUpdate = results.find((r) => r.error);
  if (failedUpdate?.error) {
    return { data: null, error: toApiError(failedUpdate.error) };
  }

  return { data: null, error: null };
}

/**
 * Get all questions for an assessment in order
 */
export async function getAssessmentQuestions(
  assessmentId: string
): Promise<ApiResponse<(AssessmentQuestion & { questions: Question })[]>> {
  const { data, error } = await supabase
    .from("assessment_questions")
    .select(`
      *,
      questions (*)
    `)
    .eq("assessment_id", assessmentId)
    .order("question_order", { ascending: true });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as (AssessmentQuestion & { questions: Question })[], error: null };
}

/**
 * Duplicate a question within an assessment
 */
export async function duplicateQuestion(
  assessmentQuestionId: string
): Promise<ApiResponse<{ question: Question; assessmentQuestion: AssessmentQuestion }>> {
  // Get the original question and assessment_question data
  const { data: original, error: fetchError } = await supabase
    .from("assessment_questions")
    .select(`
      *,
      questions (*)
    `)
    .eq("id", assessmentQuestionId)
    .single();

  if (fetchError || !original) {
    return { data: null, error: fetchError ? toApiError(fetchError) : { message: "Question not found" } };
  }

  const originalQuestion = (original as unknown as { questions: Question }).questions;

  // Create the duplicate
  const newQuestion: QuestionInsert = {
    therapist_id: originalQuestion.therapist_id,
    question_text: `${originalQuestion.question_text} (Copy)`,
    question_type: originalQuestion.question_type,
    options: originalQuestion.options,
    validation_rules: originalQuestion.validation_rules,
    placeholder_text: originalQuestion.placeholder_text,
    help_text: originalQuestion.help_text,
    is_global: originalQuestion.is_global,
  };

  return createQuestionForAssessment(original.assessment_id, newQuestion, {
    is_required: original.is_required ?? true,
    points: original.points ?? 0,
    override_question_text: original.override_question_text,
    override_options: original.override_options,
    override_help_text: original.override_help_text,
    section_name: original.section_name,
    conditional_logic: original.conditional_logic,
  });
}

/**
 * Get all questions saved to the library (is_global = true) for a therapist
 * These questions can be reused across multiple assessments
 */
export async function getLibraryQuestions(
  therapistId: string
): Promise<ApiResponse<Question[]>> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("therapist_id", therapistId)
    .eq("is_global", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Add an existing library question to an assessment
 * Creates a new assessment_question link without duplicating the question
 */
export async function addLibraryQuestionToAssessment(
  assessmentId: string,
  questionId: string,
  assessmentQuestionData?: Partial<Omit<AssessmentQuestionInsert, "assessment_id" | "question_id">>
): Promise<ApiResponse<AssessmentQuestion>> {
  // Check if question is already linked to this assessment
  const { data: existing } = await supabase
    .from("assessment_questions")
    .select("id")
    .eq("assessment_id", assessmentId)
    .eq("question_id", questionId)
    .single();

  if (existing) {
    return { data: null, error: { message: "Question is already in this assessment" } };
  }

  // Get the current max order for this assessment
  const { data: existingQuestions, error: countError } = await supabase
    .from("assessment_questions")
    .select("question_order")
    .eq("assessment_id", assessmentId)
    .order("question_order", { ascending: false })
    .limit(1);

  if (countError) {
    return { data: null, error: toApiError(countError) };
  }

  const nextOrder = (existingQuestions?.[0]?.question_order ?? 0) + 1;

  // Link question to assessment
  const assessmentQuestionInsert: AssessmentQuestionInsert = {
    assessment_id: assessmentId,
    question_id: questionId,
    question_order: assessmentQuestionData?.question_order ?? nextOrder,
    is_required: assessmentQuestionData?.is_required ?? true,
    points: assessmentQuestionData?.points ?? 0,
    ...assessmentQuestionData,
  };

  const { data, error } = await supabase
    .from("assessment_questions")
    .insert(assessmentQuestionInsert)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Save a question to the library by marking it as global
 */
export async function saveQuestionToLibrary(
  questionId: string
): Promise<ApiResponse<Question>> {
  const { data, error } = await supabase
    .from("questions")
    .update({ is_global: true, updated_at: new Date().toISOString() })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Remove a question from the library (unmark as global)
 */
export async function removeQuestionFromLibrary(
  questionId: string
): Promise<ApiResponse<Question>> {
  const { data, error } = await supabase
    .from("questions")
    .update({ is_global: false, updated_at: new Date().toISOString() })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Search library questions by text
 */
export async function searchLibraryQuestions(
  therapistId: string,
  searchTerm: string
): Promise<ApiResponse<Question[]>> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("therapist_id", therapistId)
    .eq("is_global", true)
    .ilike("question_text", `%${searchTerm}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

