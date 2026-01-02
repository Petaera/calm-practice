import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  X,
  Loader2,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  Headphones,
  Trash2,
} from "lucide-react";
import type { Module, Resource, ResourceType } from "@/lib/supabase/types";
import { useResourcesInModule } from "@/hooks/use-module-resources";
import { useAddResourcesToModules, useRemoveResourcesFromModules } from "@/hooks/use-module-resources";
import { ResourceLibraryDialog } from "./ResourceLibraryDialog";
import { toast } from "@/hooks/use-toast";

interface ModuleResourceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
  onResourcesChange?: () => void;
}

const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { icon: typeof FileText; label: string; color: string }
> = {
  document: {
    icon: FileText,
    label: "Document",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  },
  video: {
    icon: Video,
    label: "Video",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  },
  audio: {
    icon: Headphones,
    label: "Audio",
    color: "text-green-500 bg-green-50 dark:bg-green-950",
  },
  image: {
    icon: ImageIcon,
    label: "Image",
    color: "text-pink-500 bg-pink-50 dark:bg-pink-950",
  },
  url: {
    icon: LinkIcon,
    label: "Link",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950",
  },
  note: {
    icon: StickyNote,
    label: "Note",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  },
};

export function ModuleResourceManager({
  open,
  onOpenChange,
  module,
  onResourcesChange,
}: ModuleResourceManagerProps) {
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const { data: resources = [], isLoading } = useResourcesInModule(module?.id);
  const addResourcesMutation = useAddResourcesToModules();
  const removeResourcesMutation = useRemoveResourcesFromModules();

  if (!module) return null;

  const handleAddResources = async (resourceIds: string[]) => {
    if (resourceIds.length === 0) return;

    try {
      await addResourcesMutation.mutateAsync({
        resourceIds,
        moduleIds: [module.id],
      });
      toast({
        title: "Resources added",
        description: `Successfully added ${resourceIds.length} resource(s) to module.`,
      });
      setLibraryDialogOpen(false);
      onResourcesChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add resources to module.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    try {
      await removeResourcesMutation.mutateAsync({
        resourceIds: [resourceId],
        moduleIds: [module.id],
      });
      toast({
        title: "Resource removed",
        description: "Resource has been removed from the module.",
      });
      onResourcesChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resource from module.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMultiple = async (resourceIds: string[]) => {
    if (resourceIds.length === 0) return;

    try {
      await removeResourcesMutation.mutateAsync({
        resourceIds,
        moduleIds: [module.id],
      });
      toast({
        title: "Resources removed",
        description: `Successfully removed ${resourceIds.length} resource(s) from module.`,
      });
      onResourcesChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resources from module.",
        variant: "destructive",
      });
    }
  };

  const existingResourceIds = resources.map((r) => r.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Resources - {module.name}</DialogTitle>
            <DialogDescription>
              Add or remove resources from this module.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {resources.length} resource{resources.length !== 1 ? "s" : ""} in module
              </div>
              <Button
                type="button"
                onClick={() => setLibraryDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add from Library
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : resources.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No resources in this module. Click "Add from Library" to add resources.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {resources.map((resource) => {
                    const config = RESOURCE_TYPE_CONFIG[resource.resource_type as ResourceType];
                    const Icon = config.icon;

                    return (
                      <div
                        key={resource.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{resource.title}</p>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {resource.description}
                            </p>
                          )}
                          {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs mr-2">
                          {config.label}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResourceLibraryDialog
        open={libraryDialogOpen}
        onOpenChange={setLibraryDialogOpen}
        selectedResourceIds={[]}
        onSelect={handleAddResources}
        title="Add Resources to Module"
        description={`Select resources to add to "${module.name}"`}
        excludeResourceIds={existingResourceIds}
        multiSelect={true}
      />
    </>
  );
}

