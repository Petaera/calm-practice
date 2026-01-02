import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, FolderOpen } from "lucide-react";
import type { Module } from "@/lib/supabase/types";
import { useModulesWithCounts } from "@/hooks/use-modules";
import { useModulesForResource } from "@/hooks/use-module-resources";
import { toast } from "@/hooks/use-toast";

interface AddToModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string | null;
  onAdd: (moduleIds: string[]) => Promise<void>;
}

export function AddToModuleDialog({
  open,
  onOpenChange,
  resourceId,
  onAdd,
}: AddToModuleDialogProps) {
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: allModules = [], isLoading: isLoadingModules } = useModulesWithCounts();
  const { data: currentModules = [] } = useModulesForResource(resourceId || undefined);

  // Initialize selected modules when dialog opens
  useEffect(() => {
    if (open && resourceId) {
      // Pre-select modules that already contain this resource
      setSelectedModuleIds(currentModules.map((m) => m.id));
    }
  }, [open, resourceId, currentModules]);

  if (!resourceId) return null;

  const handleToggleModule = (moduleId: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModuleIds.length === allModules.length) {
      setSelectedModuleIds([]);
    } else {
      setSelectedModuleIds(allModules.map((m) => m.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedModuleIds.length === 0) {
      toast({
        title: "No modules selected",
        description: "Please select at least one module to add the resource to.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(selectedModuleIds);
      toast({
        title: "Resource added",
        description: `Successfully added resource to ${selectedModuleIds.length} module(s).`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add resource to modules.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentModuleIds = currentModules.map((m) => m.id);
  const newlySelected = selectedModuleIds.filter((id) => !currentModuleIds.includes(id));
  const removedModules = currentModuleIds.filter((id) => !selectedModuleIds.includes(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Add Resource to Modules
          </DialogTitle>
          <DialogDescription>
            Select one or more modules to add this resource to. The resource can belong to multiple modules.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {isLoadingModules ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allModules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No modules found. Create a module first.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedModuleIds.length} of {allModules.length} selected
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedModuleIds.length === allModules.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {/* Module List */}
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {allModules.map((module) => {
                    const isSelected = selectedModuleIds.includes(module.id);
                    const wasInModule = currentModuleIds.includes(module.id);
                    const isNew = isSelected && !wasInModule;
                    const isRemoved = !isSelected && wasInModule;

                    return (
                      <div
                        key={module.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                          isSelected ? "bg-muted border-primary" : ""
                        }`}
                        onClick={() => handleToggleModule(module.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleModule(module.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={`w-2 h-full rounded ${module.color || "bg-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{module.name}</p>
                            {wasInModule && isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Already added
                              </Badge>
                            )}
                            {isNew && (
                              <Badge variant="default" className="text-xs">
                                Will be added
                              </Badge>
                            )}
                            {isRemoved && (
                              <Badge variant="destructive" className="text-xs">
                                Will be removed
                              </Badge>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {module.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{module.resource_count || 0} resources</span>
                            <span>{module.assignment_count || 0} assigned</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Change Summary */}
              {(newlySelected.length > 0 || removedModules.length > 0) && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {newlySelected.length > 0 && (
                    <p>
                      <strong>{newlySelected.length}</strong> module(s) will be added
                    </p>
                  )}
                  {removedModules.length > 0 && (
                    <p className="text-destructive">
                      <strong>{removedModules.length}</strong> module(s) will be removed
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedModuleIds.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Add to ${selectedModuleIds.length} Module${selectedModuleIds.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

