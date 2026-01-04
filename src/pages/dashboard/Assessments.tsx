import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ClipboardCheck,
  Search,
  FileQuestion,
  Share2,
  BarChart3,
  Users,
  Library,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useAssessmentsWithCounts,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useToggleAssessmentActive,
  useAssessment,
} from "@/hooks/use-assessments";
import { useLibraryQuestions } from "@/hooks";
import {
  AssessmentFormDialog,
  ShareLinkDialog,
  AssessmentResults,
  AssessmentCard,
  AssignClientsDialog,
  QuestionBuilder,
  QuestionLibrary,
} from "@/components/assessments";
import type { AssessmentFormData } from "@/components/assessments/AssessmentForm";
import type { Assessment } from "@/lib/supabase/types";

type FilterTab = "all" | "active" | "inactive";

/**
 * Assessments Dashboard Page
 * 
 * Redesigned with improved UX:
 * - Card-based layout with visible action buttons
 * - Filter tabs (All | Active | Inactive)
 * - Question Library sidebar
 * - Assign clients functionality
 * - Search functionality
 */
const Assessments = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();

  // Filter and search state
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);

  // Data hooks
  const {
    data: assessments,
    isLoading,
    refetch,
  } = useAssessmentsWithCounts(therapist?.id);

  const {
    data: expandedAssessmentData,
    refetch: refetchExpandedAssessment
  } = useAssessment(expandedAssessmentId || undefined);

  const { data: libraryQuestions } = useLibraryQuestions(therapist?.id);

  // Mutation hooks
  const createAssessmentMutation = useCreateAssessment();
  const updateAssessmentMutation = useUpdateAssessment();
  const deleteAssessmentMutation = useDeleteAssessment();
  const toggleActiveMutation = useToggleAssessmentActive();

  /**
   * Refresh both the assessments list and the expanded assessment data
   */
  const handleQuestionsChange = async () => {
    await Promise.all([
      refetch(),
      refetchExpandedAssessment(),
    ]);
  };

  // Filter assessments based on tab and search
  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];

    let filtered = assessments;

    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter((a) => a.is_active);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((a) => !a.is_active);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description?.toLowerCase().includes(term) ||
          a.category?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [assessments, activeTab, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!assessments) return { total: 0, active: 0, totalQuestions: 0, libraryCount: 0 };
    return {
      total: assessments.length,
      active: assessments.filter((a) => a.is_active).length,
      totalQuestions: assessments.reduce((sum, a) => sum + a.question_count, 0),
      libraryCount: libraryQuestions?.length ?? 0,
    };
  }, [assessments, libraryQuestions]);

  // Handlers
  const handleCreateAssessment = async (data: AssessmentFormData) => {
    if (!therapist?.id) return;

    const result = await createAssessmentMutation.mutate({
      therapist_id: therapist.id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      is_active: data.is_active,
      allow_multiple_submissions: data.allow_multiple_submissions,
      show_scores_to_client: data.show_scores_to_client,
    });

    if (result) {
      toast({
        title: "Assessment Created",
        description: `"${data.title}" has been created. Now add some questions!`,
      });
      setIsCreateDialogOpen(false);
      setExpandedAssessmentId(result.id);
      refetch();
    } else if (createAssessmentMutation.error) {
      toast({
        title: "Error",
        description: createAssessmentMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateAssessment = async (data: AssessmentFormData) => {
    if (!selectedAssessment) return;

    const result = await updateAssessmentMutation.mutate({
      assessmentId: selectedAssessment.id,
      updates: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        is_active: data.is_active,
        allow_multiple_submissions: data.allow_multiple_submissions,
        show_scores_to_client: data.show_scores_to_client,
      },
    });

    if (result) {
      toast({
        title: "Assessment Updated",
        description: "Changes have been saved.",
      });
      setIsEditDialogOpen(false);
      setSelectedAssessment(null);
      refetch();
    } else if (updateAssessmentMutation.error) {
      toast({
        title: "Error",
        description: updateAssessmentMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssessment) return;

    const result = await deleteAssessmentMutation.mutate(selectedAssessment.id);

    if (result === null) {
      toast({
        title: "Assessment Deleted",
        description: `"${selectedAssessment.title}" has been deleted.`,
      });
      if (expandedAssessmentId === selectedAssessment.id) {
        setExpandedAssessmentId(null);
      }
      setIsDeleteDialogOpen(false);
      setSelectedAssessment(null);
      refetch();
    } else if (deleteAssessmentMutation.error) {
      toast({
        title: "Error",
        description: deleteAssessmentMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (assessment: Assessment) => {
    const newState = !assessment.is_active;
    const result = await toggleActiveMutation.mutate({
      assessmentId: assessment.id,
      isActive: newState,
    });

    if (result) {
      toast({
        title: newState ? "Assessment Activated" : "Assessment Deactivated",
        description: newState
          ? "Clients can now access this assessment."
          : "This assessment is no longer accessible to clients.",
      });
      refetch();
    }
  };

  const handleCopyLink = (assessment: Assessment) => {
    if (!assessment.share_token) {
      toast({
        title: "No Share Link",
        description: "Generate a share link first.",
        variant: "destructive",
      });
      return;
    }
    const url = `${window.location.origin}/assessment/${assessment.share_token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Assessment link copied to clipboard.",
    });
  };

  // Get existing question IDs for the expanded assessment
  const existingQuestionIds = useMemo(() => {
    return expandedAssessmentData?.assessment_questions?.map((aq) => aq.question_id) ?? [];
  }, [expandedAssessmentData]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Assessments
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Create and manage client assessments with shareable links.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 rounded-xl h-11"
        >
          <Plus className="w-4 h-4" /> New Assessment
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Assessments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.libraryCount}</p>
              <p className="text-xs text-muted-foreground">Library Questions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="all" className="px-4">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="active" className="px-4">
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="px-4">
                  Inactive ({stats.total - stats.active})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Assessment Cards */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredAssessments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id}>
                  <AssessmentCard
                    assessment={assessment}
                    submissionCount={assessment.submission_count ?? 0}
                    assignmentCount={0}
                    isExpanded={expandedAssessmentId === assessment.id}
                    onExpand={() => setExpandedAssessmentId(
                      expandedAssessmentId === assessment.id ? null : assessment.id
                    )}
                    onEdit={() => {
                      setSelectedAssessment(assessment);
                      setIsEditDialogOpen(true);
                    }}
                    onShare={() => {
                      setSelectedAssessment(assessment);
                      setIsShareDialogOpen(true);
                    }}
                    onViewResults={() => {
                      setSelectedAssessment(assessment);
                      setIsResultsDialogOpen(true);
                    }}
                    onAssignClients={() => {
                      setSelectedAssessment(assessment);
                      setIsAssignDialogOpen(true);
                    }}
                    onToggleActive={() => handleToggleActive(assessment)}
                    onDelete={() => {
                      setSelectedAssessment(assessment);
                      setIsDeleteDialogOpen(true);
                    }}
                    onCopyLink={() => handleCopyLink(assessment)}
                  />

                  {/* Expanded Question Builder */}
                  {expandedAssessmentId === assessment.id && therapist && (
                    <Card className="mt-2 border-primary/20 bg-muted/30">
                      <CardContent className="pt-6">
                        <QuestionBuilder
                          assessmentId={assessment.id}
                          therapistId={therapist.id}
                          questions={expandedAssessmentData?.assessment_questions ?? []}
                          onQuestionsChange={handleQuestionsChange}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileQuestion className="w-16 h-16 text-muted-foreground/50 mb-4" />
                {searchTerm || activeTab !== "all" ? (
                  <>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No assessments found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your search or filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveTab("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No assessments yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      Create your first assessment to start collecting client
                      evaluations. You can add multiple choice, yes/no, text, or
                      rating scale questions.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Create First Assessment
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Library */}
          {therapist && (
            <QuestionLibrary
              therapistId={therapist.id}
              assessmentId={expandedAssessmentId ?? undefined}
              existingQuestionIds={existingQuestionIds}
              onQuestionAdded={handleQuestionsChange}
            />
          )}

          {/* How It Works */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  1
                </div>
                <p>Create an assessment and add your questions</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  2
                </div>
                <p>Generate a shareable link or assign to specific clients</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  3
                </div>
                <p>Share the link with clients - no login required!</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  4
                </div>
                <p>View responses and track results</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-border/50 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                💡 Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Save questions to the library to reuse them across assessments</p>
              <p>• Use the "Assign" button to send assessments directly to clients</p>
              <p>• Deactivated assessments won't accept new submissions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AssessmentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateAssessment}
        isSubmitting={createAssessmentMutation.isLoading}
      />

      {selectedAssessment && (
        <>
          <AssessmentFormDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            assessment={selectedAssessment}
            onSubmit={handleUpdateAssessment}
            isSubmitting={updateAssessmentMutation.isLoading}
          />

          <ShareLinkDialog
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
            assessment={selectedAssessment}
            onTokenChange={refetch}
          />

          <AssessmentResults
            open={isResultsDialogOpen}
            onOpenChange={setIsResultsDialogOpen}
            assessment={selectedAssessment}
          />

          {therapist && (
            <AssignClientsDialog
              isOpen={isAssignDialogOpen}
              onClose={() => setIsAssignDialogOpen(false)}
              assessmentId={selectedAssessment.id}
              assessmentTitle={selectedAssessment.title}
              therapistId={therapist.id}
              onAssigned={refetch}
            />
          )}

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{selectedAssessment.title}"? This will also
                  delete all associated questions and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </DashboardLayout>
  );
};

export default Assessments;
