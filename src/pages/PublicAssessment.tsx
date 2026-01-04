import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2, ClipboardCheck } from "lucide-react";
import { useAssessmentByToken, useCreatePublicSubmission } from "@/hooks";
import type { QuestionOption, RatingScaleConfig, Json } from "@/lib/supabase/types";

type ResponseMap = Record<string, string | number>;

/**
 * Public assessment page - accessible via share token without authentication
 */
export default function PublicAssessment() {
  const { token } = useParams<{ token: string }>();
  const { data: assessment, isLoading, error } = useAssessmentByToken(token);
  const createSubmission = useCreatePublicSubmission();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [responses, setResponses] = useState<ResponseMap>({});
  const [currentStep, setCurrentStep] = useState<"intro" | "questions" | "complete">("intro");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number | null>(null);

  // Start timer when questions begin
  useEffect(() => {
    if (currentStep === "questions" && !startTime) {
      setStartTime(Date.now());
    }
  }, [currentStep, startTime]);

  const handleResponseChange = (questionId: string, value: string | number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    // Clear validation error when response is provided
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validateResponses = (): boolean => {
    if (!assessment) return false;

    const errors: Record<string, string> = {};

    assessment.questions.forEach((q) => {
      if (q.is_required && !responses[q.assessment_question_id]) {
        errors[q.assessment_question_id] = "This question is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartAssessment = () => {
    if (!clientName.trim()) {
      setValidationErrors({ clientName: "Name is required" });
      return;
    }
    setValidationErrors({});
    setCurrentStep("questions");
  };

  const handleSubmit = async () => {
    if (!validateResponses() || !assessment) return;

    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : undefined;

    // Use therapist_id from initial assessment payload (no extra query needed)
    const result = await createSubmission.mutate({
      assessmentId: assessment.id,
      therapistId: assessment.therapist_id,
      clientName,
      clientEmail: clientEmail || undefined,
      responses: assessment.questions.map((q) => ({
        assessmentQuestionId: q.assessment_question_id,
        questionId: q.id,
        responseValue:
          typeof responses[q.assessment_question_id] === "string"
            ? (responses[q.assessment_question_id] as string)
            : undefined,
        numericValue:
          typeof responses[q.assessment_question_id] === "number"
            ? (responses[q.assessment_question_id] as number)
            : undefined,
      })),
      completionTimeSeconds: completionTime,
    });

    if (result) {
      setCurrentStep("complete");
    }
  };

  const renderQuestionInput = (question: typeof assessment extends { questions: (infer Q)[] } ? Q : never) => {
    const questionType = question.question_type;
    const options = question.options as unknown as QuestionOption[] | RatingScaleConfig | null;
    const currentValue = responses[question.assessment_question_id];

    switch (questionType) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={currentValue as string || ""}
            onValueChange={(value) =>
              handleResponseChange(question.assessment_question_id, value)
            }
            className="space-y-2"
          >
            {Array.isArray(options) &&
              options.map((option: QuestionOption, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
          </RadioGroup>
        );

      case "yes_no":
        return (
          <RadioGroup
            value={currentValue as string || ""}
            onValueChange={(value) =>
              handleResponseChange(question.assessment_question_id, value)
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      case "text":
        return (
          <Textarea
            value={(currentValue as string) || ""}
            onChange={(e) =>
              handleResponseChange(question.assessment_question_id, e.target.value)
            }
            placeholder="Enter your response..."
            rows={3}
          />
        );

      case "rating": {
        const config = options as unknown as RatingScaleConfig | null;
        const min = config?.min ?? 1;
        const max = config?.max ?? 5;
        const minLabel = config?.minLabel ?? "";
        const maxLabel = config?.maxLabel ?? "";

        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    handleResponseChange(question.assessment_question_id, value)
                  }
                  className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                    currentValue === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      }

      default:
        return <p className="text-muted-foreground">Unknown question type</p>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-light/20 to-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Assessment Not Found</h1>
            <p className="text-muted-foreground">
              This assessment link is invalid or has expired. Please contact your
              therapist for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (currentStep === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-4">
              Your responses have been submitted successfully. Your therapist will
              review them.
            </p>
            <p className="text-sm text-muted-foreground">
              You can close this page now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate progress
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = assessment.questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-light/20 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{assessment.title}</h1>
          {assessment.description && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {assessment.description}
            </p>
          )}
        </div>

        {currentStep === "intro" ? (
          // Intro / Client Info Step
          <Card>
            <CardHeader>
              <CardTitle>Before You Begin</CardTitle>
              <CardDescription>
                Please provide your information to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter your full name"
                  className={validationErrors.clientName ? "border-destructive" : ""}
                />
                {validationErrors.clientName && (
                  <p className="text-sm text-destructive">{validationErrors.clientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email (Optional)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleStartAssessment} className="w-full">
                  Start Assessment
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                This assessment contains {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Questions Step
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>
                  {answeredCount} of {totalQuestions} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {assessment.questions.map((question, index) => (
                <Card
                  key={question.assessment_question_id}
                  className={
                    validationErrors[question.assessment_question_id]
                      ? "border-destructive"
                      : ""
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </p>
                        {question.help_text && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {question.help_text}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-11">
                      {renderQuestionInput(question)}
                      {validationErrors[question.assessment_question_id] && (
                        <p className="text-sm text-destructive mt-2">
                          {validationErrors[question.assessment_question_id]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit */}
            <div className="mt-8">
              {validationErrors.submit && (
                <p className="text-sm text-destructive text-center mb-4">
                  {validationErrors.submit}
                </p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={createSubmission.isLoading}
                className="w-full h-12"
                size="lg"
              >
                {createSubmission.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

