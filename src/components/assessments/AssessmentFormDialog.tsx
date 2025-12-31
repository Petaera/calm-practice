import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AssessmentForm, type AssessmentFormData } from "./AssessmentForm";
import type { Assessment } from "@/lib/supabase/types";

export interface AssessmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: Assessment;
  onSubmit: (data: AssessmentFormData) => void;
  isSubmitting?: boolean;
}

/**
 * Dialog wrapper for assessment create/edit form
 */
export function AssessmentFormDialog({
  open,
  onOpenChange,
  assessment,
  onSubmit,
  isSubmitting = false,
}: AssessmentFormDialogProps) {
  const isEdit = !!assessment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Assessment" : "Create New Assessment"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update assessment details and settings."
              : "Create a new assessment to share with clients."}
          </DialogDescription>
        </DialogHeader>
        <AssessmentForm
          initialData={assessment}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          mode={isEdit ? "edit" : "create"}
        />
      </DialogContent>
    </Dialog>
  );
}

