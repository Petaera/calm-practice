import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { useAssessmentSubmissions, useSubmission } from "@/hooks/use-questions";
import type { Assessment, AssessmentSubmission } from "@/lib/supabase/types";

export interface AssessmentResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
}

/**
 * Dialog for viewing assessment submissions and results
 */
export function AssessmentResults({
  open,
  onOpenChange,
  assessment,
}: AssessmentResultsProps) {
  const [page, setPage] = useState(1);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const { data: submissionsData, isLoading } = useAssessmentSubmissions(
    open ? assessment.id : undefined,
    page
  );

  const { data: submissionDetail, isLoading: isLoadingDetail } = useSubmission(
    selectedSubmissionId || undefined
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      reviewed: { variant: "secondary", label: "Reviewed" },
      draft: { variant: "outline", label: "Draft" },
    };
    const s = statusMap[status || "completed"] || statusMap.completed;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assessment Results</DialogTitle>
          <DialogDescription>
            View submissions for "{assessment.title}"
          </DialogDescription>
        </DialogHeader>

        {selectedSubmissionId && submissionDetail ? (
          // Submission Detail View
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubmissionId(null)}
              className="mb-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to list
            </Button>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {/* Submission Info */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>{" "}
                        <span className="font-medium">
                          {formatDate(submissionDetail.submitted_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        <span className="font-medium">
                          {formatDuration(submissionDetail.completion_time_seconds)}
                        </span>
                      </div>
                      {submissionDetail.calculated_score !== null && (
                        <div>
                          <span className="text-muted-foreground">Score:</span>{" "}
                          <span className="font-medium">
                            {submissionDetail.calculated_score}
                          </span>
                        </div>
                      )}
                      {submissionDetail.score_interpretation && (
                        <div>
                          <span className="text-muted-foreground">Interpretation:</span>{" "}
                          <span className="font-medium">
                            {submissionDetail.score_interpretation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Responses */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Responses</h4>
                    {submissionDetail.assessment_responses?.map((response, index) => (
                      <div
                        key={response.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <p className="text-sm font-medium">
                          Q{index + 1}: {response.questions?.question_text || "Question"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Answer: </span>
                          {response.response_value ||
                            response.response_values?.join(", ") ||
                            response.numeric_value?.toString() ||
                            "No response"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {submissionDetail.notes && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {submissionDetail.notes}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          // Submissions List View
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : submissionsData && submissionsData.data.length > 0 ? (
              <>
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissionsData.data.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {(submission as AssessmentSubmission & { clients: { full_name: string } }).clients?.full_name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.submitted_at)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell>
                            {submission.calculated_score ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedSubmissionId(submission.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Pagination */}
                {submissionsData.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {submissionsData.totalPages} ({submissionsData.count} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= submissionsData.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No submissions yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Share the assessment link with clients to start receiving
                  submissions.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

