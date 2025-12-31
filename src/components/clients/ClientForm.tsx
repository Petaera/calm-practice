import { useState } from "react";
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
import type { ClientInsert } from "@/lib/supabase";

// Types
export interface ClientFormData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  concerns: string[];
  intake_notes: string;
  status: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

export interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

// Default form values
const defaultFormData: ClientFormData = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
  concerns: [],
  intake_notes: "",
  status: "Active",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
};

export function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    ...defaultFormData,
    ...initialData,
  });

  const handleFormChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConcernsChange = (value: string) => {
    const concernsArray = value
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    setFormData((prev) => ({ ...prev, concerns: concernsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isValid = formData.full_name.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name - Required */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="full_name" className="flex items-center gap-1">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleFormChange("full_name", e.target.value)}
              placeholder="Enter client's full name"
              className="h-11"
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              placeholder="client@example.com"
              className="h-11"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="h-11"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleFormChange("date_of_birth", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleFormChange("gender", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              placeholder="Street address, City, State, ZIP"
              className="h-11"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleFormChange("status", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On-hold">On-hold</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Clinical Information Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Clinical Information
        </h3>

        <div className="space-y-4">
          {/* Concerns */}
          <div className="space-y-2">
            <Label htmlFor="concerns">Concerns/Issues</Label>
            <Input
              id="concerns"
              value={formData.concerns.join(", ")}
              onChange={(e) => handleConcernsChange(e.target.value)}
              placeholder="e.g., Anxiety, Depression, Stress Management"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple concerns with commas
            </p>
          </div>

          {/* Intake Notes */}
          <div className="space-y-2">
            <Label htmlFor="intake_notes">Intake Notes</Label>
            <Textarea
              id="intake_notes"
              value={formData.intake_notes}
              onChange={(e) => handleFormChange("intake_notes", e.target.value)}
              placeholder="Initial observations, referral source, treatment goals..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                handleFormChange("emergency_contact_name", e.target.value)
              }
              placeholder="Full name"
              className="h-11"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                handleFormChange("emergency_contact_phone", e.target.value)
              }
              placeholder="+1 (555) 000-0000"
              className="h-11"
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              value={formData.emergency_contact_relationship}
              onChange={(e) =>
                handleFormChange("emergency_contact_relationship", e.target.value)
              }
              placeholder="e.g., Spouse, Parent, Sibling, Friend"
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="min-w-[140px]"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Client"
            : "Create Client"}
        </Button>
      </div>
    </form>
  );
}

export default ClientForm;

