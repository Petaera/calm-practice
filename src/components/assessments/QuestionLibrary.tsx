import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Library,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle,
  Circle,
  ToggleLeft,
  AlignLeft,
  Star,
  Hash,
} from "lucide-react";
import { useLibraryQuestions, useAddLibraryQuestion } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@/lib/supabase/types";

interface QuestionLibraryProps {
  therapistId: string;
  assessmentId?: string;
  existingQuestionIds?: string[];
  onQuestionAdded?: () => void;
}

/**
 * Get icon for question type
 */
function getQuestionTypeIcon(type: string) {
  switch (type) {
    case "multiple_choice":
      return <Circle className="h-3.5 w-3.5" />;
    case "yes_no":
      return <ToggleLeft className="h-3.5 w-3.5" />;
    case "text":
    case "textarea":
      return <AlignLeft className="h-3.5 w-3.5" />;
    case "rating":
      return <Star className="h-3.5 w-3.5" />;
    case "scale":
      return <Hash className="h-3.5 w-3.5" />;
    default:
      return <Circle className="h-3.5 w-3.5" />;
  }
}

/**
 * QuestionLibrary - Displays saved questions that can be reused across assessments
 * 
 * Features:
 * - Search/filter questions
 * - Quick add to current assessment
 * - Visual indicator for already-added questions
 * - Collapsible sidebar panel
 */
export function QuestionLibrary({
  therapistId,
  assessmentId,
  existingQuestionIds = [],
  onQuestionAdded,
}: QuestionLibraryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: libraryQuestions, isLoading } = useLibraryQuestions(therapistId);
  const addLibraryQuestionMutation = useAddLibraryQuestion();

  // Filter questions based on search term
  const filteredQuestions = useMemo(() => {
    if (!libraryQuestions) return [];
    if (!searchTerm.trim()) return libraryQuestions;
    
    const term = searchTerm.toLowerCase();
    return libraryQuestions.filter(
      (q) =>
        q.question_text.toLowerCase().includes(term) ||
        q.question_type.toLowerCase().includes(term)
    );
  }, [libraryQuestions, searchTerm]);

  // Check if a question is already in the current assessment
  const isQuestionInAssessment = (questionId: string) => {
    return existingQuestionIds.includes(questionId);
  };

  // Handle adding a library question to the assessment
  const handleAddQuestion = async (question: Question) => {
    if (!assessmentId) {
      toast({
        title: "No Assessment Selected",
        description: "Please expand an assessment to add questions to it.",
        variant: "destructive",
      });
      return;
    }

    const result = await addLibraryQuestionMutation.mutate({
      assessmentId,
      questionId: question.id,
    });

    if (result) {
      toast({
        title: "Question Added",
        description: `"${question.question_text.substring(0, 30)}..." has been added to the assessment.`,
      });
      onQuestionAdded?.();
    } else if (addLibraryQuestionMutation.error) {
      toast({
        title: "Error",
        description: addLibraryQuestionMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const questionCount = libraryQuestions?.length ?? 0;

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  Question Library
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {questionCount}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Questions List */}
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-3">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))
                ) : filteredQuestions.length === 0 ? (
                  // Empty state
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {searchTerm ? (
                      <p className="text-sm">No questions match your search</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">No saved questions yet</p>
                        <p className="text-xs mt-1">
                          Save questions to the library when creating them
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  // Question items
                  filteredQuestions.map((question) => {
                    const isAdded = isQuestionInAssessment(question.id);
                    return (
                      <div
                        key={question.id}
                        className={`
                          p-3 border rounded-lg transition-colors
                          ${isAdded ? "bg-muted/50 border-muted" : "hover:bg-muted/30"}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm line-clamp-2 ${isAdded ? "text-muted-foreground" : ""}`}>
                              {question.question_text}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-xs gap-1 py-0">
                                {getQuestionTypeIcon(question.question_type)}
                                {question.question_type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {isAdded ? (
                                  <div className="p-1.5 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => handleAddQuestion(question)}
                                    disabled={!assessmentId || addLibraryQuestionMutation.isLoading}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {isAdded
                                  ? "Already in assessment"
                                  : assessmentId
                                  ? "Add to assessment"
                                  : "Expand an assessment first"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Help text */}
            {!assessmentId && questionCount > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                Expand an assessment to add library questions
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default QuestionLibrary;

