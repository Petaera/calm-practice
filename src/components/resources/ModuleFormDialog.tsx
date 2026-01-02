import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResourceLibraryDialog } from "./ResourceLibraryDialog";
import type { Module, ModuleInsert, ModuleUpdate } from "@/lib/supabase/types";

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: Module | null;
  onSubmit: (data: ModuleInsert | ModuleUpdate) => Promise<Module | void>;
  therapistId: string;
  onModuleCreated?: (moduleId: string, selectedResourceIds?: string[]) => void; // Callback when module is created with selected resources
}

interface ModuleFormData {
  name: string;
  description: string;
  color: string;
  is_active: boolean;
}

const COLOR_OPTIONS = [
  { value: "bg-primary", label: "Primary", class: "bg-primary" },
  { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", class: "bg-green-500" },
  { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
  { value: "bg-orange-500", label: "Orange", class: "bg-orange-500" },
  { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
  { value: "bg-teal-500", label: "Teal", class: "bg-teal-500" },
  { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" },
];

export function ModuleFormDialog({
  open,
  onOpenChange,
  module,
  onSubmit,
  therapistId,
  onModuleCreated,
}: ModuleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [resourceLibraryOpen, setResourceLibraryOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModuleFormData>({
    defaultValues: {
      name: "",
      description: "",
      color: "bg-primary",
      is_active: true,
    },
  });

  const selectedColor = watch("color");
  const isActive = watch("is_active");

  // Reset form when module changes or dialog opens
  useEffect(() => {
    if (open) {
      if (module) {
        reset({
          name: module.name,
          description: module.description || "",
          color: module.color || "bg-primary",
          is_active: module.is_active,
        });
        // Don't allow resource selection when editing
        setSelectedResourceIds([]);
      } else {
        reset({
          name: "",
          description: "",
          color: "bg-primary",
          is_active: true,
        });
        setSelectedResourceIds([]);
      }
    }
  }, [open, module, reset]);

  const handleFormSubmit = async (data: ModuleFormData) => {
    setIsSubmitting(true);
    try {
      if (module) {
        // Update existing module
        await onSubmit({
          name: data.name,
          description: data.description || null,
          color: data.color,
          is_active: data.is_active,
        });
        onOpenChange(false);
      } else {
        // Create new module
        const moduleData = {
          therapist_id: therapistId,
          name: data.name,
          description: data.description || null,
          color: data.color,
          is_active: data.is_active,
        };
        const createdModule = await onSubmit(moduleData);
        // Call onModuleCreated with the new module ID and selected resources
        if (onModuleCreated && createdModule) {
          await onModuleCreated(createdModule.id, selectedResourceIds);
        }
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving module:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {module ? "Edit Module" : "Create New Module"}
            </DialogTitle>
            <DialogDescription>
              {module
                ? "Update the module details below."
                : "Create a new module to organize your resources."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Module Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Mindfulness Exercises"
              {...register("name", { required: "Module name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this module contains..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-foreground scale-105"
                      : "border-border hover:border-foreground/50"
                  } ${color.class}`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Active Module
              </Label>
              <p className="text-sm text-muted-foreground">
                Inactive modules are hidden from clients
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          {/* Resource Selection - Only show when creating new module */}
          {!module && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Add Resources (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Select existing resources to add to this module
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setResourceLibraryOpen(true)}
                  >
                    {selectedResourceIds.length > 0
                      ? `Change (${selectedResourceIds.length})`
                      : "Select Resources"}
                  </Button>
                </div>
                {selectedResourceIds.length > 0 && (
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-sm font-medium mb-2">
                      {selectedResourceIds.length} resource{selectedResourceIds.length !== 1 ? "s" : ""} selected
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedResourceIds([])}
                      className="h-7 text-xs"
                    >
                      Clear selection
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : module
                  ? "Update Module"
                  : "Create Module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ResourceLibraryDialog
      open={resourceLibraryOpen}
      onOpenChange={setResourceLibraryOpen}
      selectedResourceIds={selectedResourceIds}
      onSelect={setSelectedResourceIds}
      title="Select Resources"
      description="Choose resources to add to this module"
      multiSelect={true}
    />
    </>
  );
}

