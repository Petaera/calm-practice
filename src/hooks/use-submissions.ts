import { useCallback } from "react";
import { useSupabaseQuery } from "./use-supabase-query";
import { getSubmissionsByClient } from "@/services/submissions.service";
import type { AssessmentSubmission, PaginatedResponse, PaginationParams } from "@/lib/supabase";

export type SubmissionListItem = AssessmentSubmission & {
  assessments: { title: string } | null;
};

export function useSubmissionsByClient(
  clientId: string | undefined,
  pagination?: PaginationParams
) {
  const queryFn = useCallback(() => {
    if (!clientId) return Promise.resolve({ data: null, error: null });
    return getSubmissionsByClient(clientId, pagination);
  }, [clientId, pagination]);

  return useSupabaseQuery<PaginatedResponse<SubmissionListItem>>(
    queryFn,
    [clientId, JSON.stringify(pagination)],
    { enabled: !!clientId }
  );
}


