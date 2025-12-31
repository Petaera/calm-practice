import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm, type ClientFormData, type ClientFormProps } from "./ClientForm";

export interface ClientFormDialogProps {
  /** Trigger element to open the dialog */
  trigger: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Form submission handler */
  onSubmit: (data: ClientFormData) => Promise<void>;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** Initial form data (for edit mode) */
  initialData?: Partial<ClientFormData>;
  /** Form mode - create or edit */
  mode?: "create" | "edit";
}

export function ClientFormDialog({
  trigger,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "create",
}: ClientFormDialogProps) {
  const handleCancel = () => {
    onOpenChange?.(false);
  };

  const handleSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">
            {mode === "edit" ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "edit"
              ? "Update the client's information below."
              : "Create a new client record with their personal and contact information."}
          </DialogDescription>
        </DialogHeader>

        <ClientForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ClientFormDialog;

