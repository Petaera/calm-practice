import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  CircleDot,
  ToggleLeft,
  Type,
  Star,
} from "lucide-react";
import type { Question, AssessmentQuestion, QuestionType, QuestionOption } from "@/lib/supabase/types";

export interface QuestionCardProps {
  assessmentQuestion: AssessmentQuestion & { questions: Question };
  index: number;
  onEdit: (assessmentQuestion: AssessmentQuestion & { questions: Question }) => void;
  onDuplicate: (assessmentQuestionId: string) => void;
  onDelete: (assessmentQuestionId: string) => void;
  isDragging?: boolean;
}

const QUESTION_TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  multiple_choice: <CircleDot className="w-4 h-4" />,
  yes_no: <ToggleLeft className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  rating: <Star className="w-4 h-4" />,
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  yes_no: "Yes/No",
  text: "Text",
  rating: "Rating",
};

/**
 * Card component displaying a single question in the builder
 */
export function QuestionCard({
  assessmentQuestion,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  isDragging = false,
}: QuestionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const question = assessmentQuestion.questions;
  const questionType = question.question_type as QuestionType;
  const options = question.options as QuestionOption[] | null;

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(assessmentQuestion.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-1">
            <GripVertical className="w-5 h-5 text-muted-foreground/50" />
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Q{index + 1}
              </span>
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                {QUESTION_TYPE_ICONS[questionType]}
                {QUESTION_TYPE_LABELS[questionType]}
              </Badge>
              {assessmentQuestion.is_required && (
                <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                  Required
                </Badge>
              )}
            </div>

            {/* Question Text */}
            <p className="text-sm font-medium text-foreground mb-2">
              {assessmentQuestion.override_question_text || question.question_text}
            </p>

            {/* Options Preview (for multiple choice) */}
            {questionType === "multiple_choice" && options && options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {options.slice(0, 3).map((option, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                  >
                    {option.label || `Option ${i + 1}`}
                  </span>
                ))}
                {options.length > 3 && (
                  <span className="text-xs px-2 py-1 text-muted-foreground">
                    +{options.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Rating Scale Preview */}
            {questionType === "rating" && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Yes/No Preview */}
            {questionType === "yes_no" && (
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-3 py-1 bg-muted rounded-md text-muted-foreground">
                  Yes
                </span>
                <span className="text-xs px-3 py-1 bg-muted rounded-md text-muted-foreground">
                  No
                </span>
              </div>
            )}

            {/* Text Preview */}
            {questionType === "text" && (
              <div className="mt-2 text-xs text-muted-foreground italic">
                Short text response
              </div>
            )}

            {/* Help Text */}
            {(assessmentQuestion.override_help_text || question.help_text) && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                💡 {assessmentQuestion.override_help_text || question.help_text}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(assessmentQuestion)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(assessmentQuestion.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className={showDeleteConfirm ? "text-destructive" : ""}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDeleteConfirm ? "Click again to confirm" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

