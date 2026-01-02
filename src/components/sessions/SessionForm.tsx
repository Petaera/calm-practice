import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SessionType, SessionStatus, PaymentStatus } from "@/lib/supabase/types";

// Types
export interface SessionFormData {
  client_id: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  session_type: SessionType;
  session_purpose: string;
  status: SessionStatus;
  payment_status: PaymentStatus;
  payment_amount: string;
  location: string;
  meeting_link: string;
  session_notes: string;
}

export interface SessionFormProps {
  initialData?: Partial<SessionFormData>;
  onSubmit: (data: SessionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  clients?: Array<{ id: string; full_name: string }>;
}

// Default form values
const defaultFormData: SessionFormData = {
  client_id: "",
  session_date: "",
  session_time: "",
  duration_minutes: 50,
  session_type: "In-person",
  session_purpose: "",
  status: "Scheduled",
  payment_status: "Pending",
  payment_amount: "",
  location: "",
  meeting_link: "",
  session_notes: "",
};

export function SessionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
  clients = [],
}: SessionFormProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    ...defaultFormData,
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleFormChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isValid = formData.client_id && formData.session_date && formData.session_time;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Session Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client - Required */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="client_id" className="flex items-center gap-1">
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => handleFormChange("client_id", value)}
              disabled={mode === "edit"}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Date - Required */}
          <div className="space-y-2">
            <Label htmlFor="session_date" className="flex items-center gap-1">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="session_date"
              type="date"
              className="rounded-xl h-11"
              value={formData.session_date}
              onChange={(e) => handleFormChange("session_date", e.target.value)}
            />
          </div>

          {/* Session Time - Required */}
          <div className="space-y-2">
            <Label htmlFor="session_time" className="flex items-center gap-1">
              Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="session_time"
              type="time"
              className="rounded-xl h-11"
              value={formData.session_time}
              onChange={(e) => handleFormChange("session_time", e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="15"
              step="15"
              className="rounded-xl h-11"
              value={formData.duration_minutes}
              onChange={(e) => handleFormChange("duration_minutes", parseInt(e.target.value) || 50)}
            />
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="session_type">Session Type</Label>
            <Select
              value={formData.session_type}
              onValueChange={(value: SessionType) => handleFormChange("session_type", value)}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-person">In-person</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Purpose */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="session_purpose">Session Purpose</Label>
            <Input
              id="session_purpose"
              placeholder="e.g., Initial consultation, Follow-up, Therapy session"
              className="rounded-xl h-11"
              value={formData.session_purpose}
              onChange={(e) => handleFormChange("session_purpose", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Location & Meeting Details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Location & Meeting Details
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Office Room 101, Client's Home"
              className="rounded-xl h-11"
              value={formData.location}
              onChange={(e) => handleFormChange("location", e.target.value)}
            />
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meeting_link">Meeting Link (for online sessions)</Label>
            <Input
              id="meeting_link"
              type="url"
              placeholder="https://zoom.us/j/..."
              className="rounded-xl h-11"
              value={formData.meeting_link}
              onChange={(e) => handleFormChange("meeting_link", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Status & Payment */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Status & Payment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Session Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: SessionStatus) => handleFormChange("status", value)}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No-show">No-show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value: PaymentStatus) => handleFormChange("payment_status", value)}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment_amount">Payment Amount</Label>
            <Input
              id="payment_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="rounded-xl h-11"
              value={formData.payment_amount}
              onChange={(e) => handleFormChange("payment_amount", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Session Notes */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Session Notes
        </h3>

        <div className="space-y-2">
          <Label htmlFor="session_notes">Clinical Notes</Label>
          <Textarea
            id="session_notes"
            placeholder="Document session observations, progress, and next steps..."
            rows={5}
            className="rounded-xl"
            value={formData.session_notes}
            onChange={(e) => handleFormChange("session_notes", e.target.value)}
          />
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Session"
            : "Create Session"}
        </Button>
      </div>
    </form>
  );
}

export default SessionForm;

