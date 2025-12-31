import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, FileQuestion, Library } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { QuestionForm, type QuestionFormData } from "./QuestionForm";
import { QuestionLibrary } from "./QuestionLibrary";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useDuplicateQuestion,
  useSaveToLibrary,
} from "@/hooks/use-questions";
import type { Question, AssessmentQuestion, QuestionOption, RatingScaleConfig } from "@/lib/supabase/types";

export interface QuestionBuilderProps {
  assessmentId: string;
  therapistId: string;
  questions: (AssessmentQuestion & { questions: Question })[];
  onQuestionsChange: () => void;
}

/**
 * Component for building and managing questions within an assessment
 */
export function QuestionBuilder({
  assessmentId,
  therapistId,
  questions,
  onQuestionsChange,
}: QuestionBuilderProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<
    (AssessmentQuestion & { questions: Question }) | null
  >(null);

  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const duplicateQuestionMutation = useDuplicateQuestion();
  const saveToLibraryMutation = useSaveToLibrary();

  // Get IDs of questions already in this assessment (for library filter)
  const existingQuestionIds = questions.map((q) => q.question_id);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsDialogOpen(true);
  };

  const handleEditQuestion = (
    aq: AssessmentQuestion & { questions: Question }
  ) => {
    setEditingQuestion(aq);
    setIsDialogOpen(true);
  };

  const handleSubmitQuestion = async (formData: QuestionFormData) => {
    // Build options JSON based on question type
    let options: QuestionOption[] | RatingScaleConfig | null = null;

    if (formData.question_type === "multiple_choice") {
      options = formData.options.map((opt, index) => ({
        label: opt.label,
        value: `option_${index + 1}`,
        points: opt.points ?? index,
      }));
    } else if (formData.question_type === "rating") {
      options = {
        min: formData.rating_min ?? 1,
        max: formData.rating_max ?? 5,
        minLabel: formData.rating_min_label ?? "",
        maxLabel: formData.rating_max_label ?? "",
      } as unknown as QuestionOption[];
    } else if (formData.question_type === "yes_no") {
      options = [
        { label: "Yes", value: "yes", points: 1 },
        { label: "No", value: "no", points: 0 },
      ];
    }

    if (editingQuestion) {
      // Update existing question
      const result = await updateQuestionMutation.mutate({
        questionId: editingQuestion.questions.id,
        updates: {
          question_text: formData.question_text,
          question_type: formData.question_type,
          options: options,
          help_text: formData.help_text || null,
        },
      });

      if (result) {
        toast({
          title: "Question Updated",
          description: "The question has been updated successfully.",
        });
        setIsDialogOpen(false);
        onQuestionsChange();
      } else if (updateQuestionMutation.error) {
        toast({
          title: "Error",
          description: updateQuestionMutation.error.message,
          variant: "destructive",
        });
      }
    } else {
      // Create new question
      const result = await createQuestionMutation.mutate({
        assessmentId,
        question: {
          therapist_id: therapistId,
          question_text: formData.question_text,
          question_type: formData.question_type,
          options: options,
          help_text: formData.help_text || null,
          is_global: formData.save_to_library, // Save to library if requested
        },
        assessmentQuestionData: {
          is_required: formData.is_required,
        },
      });

      if (result) {
        const messages = ["The question has been added to the assessment."];
        if (formData.save_to_library) {
          messages.push("Also saved to your Question Library.");
        }
        toast({
          title: "Question Added",
          description: messages.join(" "),
        });
        setIsDialogOpen(false);
        onQuestionsChange();
      } else if (createQuestionMutation.error) {
        toast({
          title: "Error",
          description: createQuestionMutation.error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicateQuestion = async (assessmentQuestionId: string) => {
    const result = await duplicateQuestionMutation.mutate(assessmentQuestionId);

    if (result) {
      toast({
        title: "Question Duplicated",
        description: "A copy of the question has been added.",
      });
      onQuestionsChange();
    } else if (duplicateQuestionMutation.error) {
      toast({
        title: "Error",
        description: duplicateQuestionMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (assessmentQuestionId: string) => {
    const result = await deleteQuestionMutation.mutate({
      assessmentQuestionId,
      deleteQuestionRecord: true,
    });

    if (result !== undefined) {
      toast({
        title: "Question Deleted",
        description: "The question has been removed from the assessment.",
      });
      onQuestionsChange();
    } else if (deleteQuestionMutation.error) {
      toast({
        title: "Error",
        description: deleteQuestionMutation.error.message,
        variant: "destructive",
      });
    }
  };

  // Convert stored data back to form format for editing
  const getInitialFormData = (): Partial<QuestionFormData> | undefined => {
    if (!editingQuestion) return undefined;

    const q = editingQuestion.questions;
    const options = q.options as QuestionOption[] | RatingScaleConfig | null;

    const baseData: Partial<QuestionFormData> = {
      question_text: editingQuestion.override_question_text || q.question_text,
      question_type: q.question_type as QuestionFormData["question_type"],
      help_text: editingQuestion.override_help_text || q.help_text || "",
      is_required: editingQuestion.is_required ?? true,
    };

    if (q.question_type === "multiple_choice" && Array.isArray(options)) {
      baseData.options = options;
    } else if (q.question_type === "rating" && options && !Array.isArray(options)) {
      const ratingConfig = options as unknown as RatingScaleConfig;
      baseData.rating_min = ratingConfig.min;
      baseData.rating_max = ratingConfig.max;
      baseData.rating_min_label = ratingConfig.minLabel;
      baseData.rating_max_label = ratingConfig.maxLabel;
    }

    return baseData;
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={handleAddQuestion}
          size="sm"
          variant={questions.length === 0 ? "default" : "outline"}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Question
        </Button>
        <Button
          onClick={() => setShowLibrary(!showLibrary)}
          size="sm"
          variant={showLibrary ? "secondary" : "ghost"}
        >
          <Library className="w-4 h-4 mr-1.5" />
          {showLibrary ? "Hide Library" : "Import from Library"}
        </Button>
      </div>

      {/* Question Library Panel */}
      {showLibrary && (
        <QuestionLibrary
          therapistId={therapistId}
          assessmentId={assessmentId}
          existingQuestionIds={existingQuestionIds}
          onQuestionAdded={onQuestionsChange}
        />
      )}

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions
            .sort((a, b) => a.question_order - b.question_order)
            .map((aq, index) => (
              <QuestionCard
                key={aq.id}
                assessmentQuestion={aq}
                index={index}
                onEdit={handleEditQuestion}
                onDuplicate={handleDuplicateQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <FileQuestion className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No questions yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Create new questions or import from your Question Library. You can use
            multiple choice, yes/no, text, or rating scale questions.
          </p>
        </div>
      )}

      {/* Question Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details below."
                : "Create a new question for your assessment."}
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            initialData={getInitialFormData()}
            onSubmit={handleSubmitQuestion}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={
              createQuestionMutation.isLoading || updateQuestionMutation.isLoading
            }
            mode={editingQuestion ? "edit" : "create"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

