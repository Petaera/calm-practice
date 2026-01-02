import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionForm, type SessionFormData, type SessionFormProps } from "./SessionForm";

export interface SessionFormDialogProps {
  /** Trigger element to open the dialog */
  trigger: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Form submission handler */
  onSubmit: (data: SessionFormData) => Promise<void>;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** Initial form data (for edit mode) */
  initialData?: Partial<SessionFormData>;
  /** Form mode - create or edit */
  mode?: "create" | "edit";
  /** Available clients for selection */
  clients?: Array<{ id: string; full_name: string }>;
}

export function SessionFormDialog({
  trigger,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "create",
  clients = [],
}: SessionFormDialogProps) {
  const handleCancel = () => {
    onOpenChange?.(false);
  };

  const handleSubmit = async (data: SessionFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">
            {mode === "edit" ? "Edit Session" : "Log New Session"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "edit"
              ? "Update the session details below."
              : "Schedule or record a new therapy session with a client."}
          </DialogDescription>
        </DialogHeader>

        <SessionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode={mode}
          clients={clients}
        />
      </DialogContent>
    </Dialog>
  );
}

export default SessionFormDialog;

