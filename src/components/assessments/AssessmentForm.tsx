import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Assessment, AssessmentCategory } from "@/lib/supabase/types";

export interface AssessmentFormData {
  title: string;
  description: string;
  category: AssessmentCategory;
  is_active: boolean;
  allow_multiple_submissions: boolean;
  show_scores_to_client: boolean;
}

export interface AssessmentFormProps {
  initialData?: Partial<Assessment>;
  onSubmit: (data: AssessmentFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const CATEGORIES: AssessmentCategory[] = [
  "Clinical",
  "Stress/Mood",
  "Personal",
  "Behavioral",
  "Other",
];

/**
 * Form component for creating/editing assessment metadata
 */
export function AssessmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: AssessmentFormProps) {
  const [formData, setFormData] = useState<AssessmentFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    category: (initialData?.category as AssessmentCategory) ?? "Clinical",
    is_active: initialData?.is_active ?? true,
    allow_multiple_submissions: initialData?.allow_multiple_submissions ?? true,
    show_scores_to_client: initialData?.show_scores_to_client ?? false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AssessmentFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssessmentFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = <K extends keyof AssessmentFormData>(
    field: K,
    value: AssessmentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Assessment Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., Depression Screening (PHQ-9)"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Brief description of the assessment purpose..."
          rows={3}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange("category", value as AssessmentCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-foreground">Settings</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_active" className="text-sm font-medium">
              Active
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow clients to access this assessment
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow_multiple" className="text-sm font-medium">
              Allow Multiple Submissions
            </Label>
            <p className="text-xs text-muted-foreground">
              Clients can submit this assessment more than once
            </p>
          </div>
          <Switch
            id="allow_multiple"
            checked={formData.allow_multiple_submissions}
            onCheckedChange={(checked) =>
              handleChange("allow_multiple_submissions", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show_scores" className="text-sm font-medium">
              Show Scores to Client
            </Label>
            <p className="text-xs text-muted-foreground">
              Display calculated scores after submission
            </p>
          </div>
          <Switch
            id="show_scores"
            checked={formData.show_scores_to_client}
            onCheckedChange={(checked) =>
              handleChange("show_scores_to_client", checked)
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
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
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Assessment"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

