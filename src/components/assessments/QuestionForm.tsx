import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Library } from "lucide-react";
import type { QuestionType, QuestionOption } from "@/lib/supabase/types";

export interface QuestionFormData {
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  help_text: string;
  is_required: boolean;
  save_to_library: boolean;
  // Rating scale specific
  rating_min?: number;
  rating_max?: number;
  rating_min_label?: string;
  rating_max_label?: string;
}

export interface QuestionFormProps {
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "yes_no", label: "Yes/No" },
  { value: "text", label: "Short Text" },
  { value: "rating", label: "Rating Scale" },
];

/**
 * Form for creating/editing a question
 */
export function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: initialData?.question_text ?? "",
    question_type: initialData?.question_type ?? "multiple_choice",
    options: initialData?.options ?? [
      { label: "", value: "option_1" },
      { label: "", value: "option_2" },
    ],
    help_text: initialData?.help_text ?? "",
    is_required: initialData?.is_required ?? true,
    save_to_library: initialData?.save_to_library ?? false,
    rating_min: initialData?.rating_min ?? 1,
    rating_max: initialData?.rating_max ?? 5,
    rating_min_label: initialData?.rating_min_label ?? "Not at all",
    rating_max_label: initialData?.rating_max_label ?? "Extremely",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = "Question text is required";
    }

    if (formData.question_type === "multiple_choice") {
      const validOptions = formData.options.filter((o) => o.label.trim());
      if (validOptions.length < 2) {
        newErrors.options = "At least 2 options are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Filter out empty options for multiple choice
      const cleanedData = {
        ...formData,
        options:
          formData.question_type === "multiple_choice"
            ? formData.options.filter((o) => o.label.trim())
            : [],
      };
      onSubmit(cleanedData);
    }
  };

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      label: "",
      value: `option_${formData.options.length + 1}`,
    };
    handleChange("options", [...formData.options, newOption]);
  };

  const updateOption = (index: number, label: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], label };
    handleChange("options", newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    handleChange("options", newOptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="question_type" className="text-sm font-medium">
          Question Type
        </Label>
        <Select
          value={formData.question_type}
          onValueChange={(value) =>
            handleChange("question_type", value as QuestionType)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question_text" className="text-sm font-medium">
          Question <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="question_text"
          value={formData.question_text}
          onChange={(e) => handleChange("question_text", e.target.value)}
          placeholder="Enter your question..."
          rows={2}
          className={errors.question_text ? "border-destructive" : ""}
        />
        {errors.question_text && (
          <p className="text-sm text-destructive">{errors.question_text}</p>
        )}
      </div>

      {/* Multiple Choice Options */}
      {formData.question_type === "multiple_choice" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Options <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={option.value} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-sm text-destructive">{errors.options}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Option
          </Button>
        </div>
      )}

      {/* Rating Scale Settings */}
      {formData.question_type === "rating" && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Rating Scale Settings</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating_min" className="text-xs text-muted-foreground">
                Minimum Value
              </Label>
              <Input
                id="rating_min"
                type="number"
                min={0}
                max={formData.rating_max! - 1}
                value={formData.rating_min}
                onChange={(e) =>
                  handleChange("rating_min", parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating_max" className="text-xs text-muted-foreground">
                Maximum Value
              </Label>
              <Input
                id="rating_max"
                type="number"
                min={formData.rating_min! + 1}
                max={10}
                value={formData.rating_max}
                onChange={(e) =>
                  handleChange("rating_max", parseInt(e.target.value) || 5)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating_min_label" className="text-xs text-muted-foreground">
                Min Label
              </Label>
              <Input
                id="rating_min_label"
                value={formData.rating_min_label}
                onChange={(e) => handleChange("rating_min_label", e.target.value)}
                placeholder="e.g., Not at all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating_max_label" className="text-xs text-muted-foreground">
                Max Label
              </Label>
              <Input
                id="rating_max_label"
                value={formData.rating_max_label}
                onChange={(e) => handleChange("rating_max_label", e.target.value)}
                placeholder="e.g., Extremely"
              />
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="space-y-2">
        <Label htmlFor="help_text" className="text-sm font-medium">
          Help Text (Optional)
        </Label>
        <Input
          id="help_text"
          value={formData.help_text}
          onChange={(e) => handleChange("help_text", e.target.value)}
          placeholder="Additional instructions for the client..."
        />
      </div>

      {/* Required Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="is_required" className="text-sm font-medium">
            Required
          </Label>
          <p className="text-xs text-muted-foreground">
            Client must answer this question
          </p>
        </div>
        <Switch
          id="is_required"
          checked={formData.is_required}
          onCheckedChange={(checked) => handleChange("is_required", checked)}
        />
      </div>

      {/* Save to Library Option - only show when creating */}
      {mode === "create" && (
        <label className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
          <Checkbox
            checked={formData.save_to_library}
            onCheckedChange={(checked) =>
              handleChange("save_to_library", checked === true)
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Save to Question Library</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reuse this question in other assessments without duplicating it
            </p>
          </div>
        </label>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Adding..."
              : "Saving..."
            : mode === "create"
            ? "Add Question"
            : "Save Question"}
        </Button>
      </div>
    </form>
  );
}

