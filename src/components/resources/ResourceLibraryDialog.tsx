import { useState, useMemo, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  Headphones,
  Loader2,
  X,
} from "lucide-react";
import type { Resource, ResourceType } from "@/lib/supabase/types";
import { useResources, useResourceTags, useResourcesByModule } from "@/hooks/use-resources";

interface ResourceLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResourceIds?: string[];
  onSelect: (resourceIds: string[]) => void;
  title?: string;
  description?: string;
  filterByModuleId?: string; // Only show resources from this module
  excludeResourceIds?: string[]; // Exclude these resources from selection
  multiSelect?: boolean;
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

export function ResourceLibraryDialog({
  open,
  onOpenChange,
  selectedResourceIds = [],
  onSelect,
  title = "Select Resources",
  description = "Choose resources from your library",
  filterByModuleId,
  excludeResourceIds = [],
  multiSelect = true,
}: ResourceLibraryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedResourceIds);

  const { data: allResourcesData, isLoading: isLoadingAllResources } = useResources();
  const { data: resourceTags = [] } = useResourceTags();
  const { data: moduleResources = [], isLoading: isLoadingModuleResources } = useResourcesByModule(filterByModuleId);

  // Determine which resources to show
  const availableResources = useMemo(() => {
    if (filterByModuleId) {
      return moduleResources;
    }
    // Get all resources from paginated response
    return (allResourcesData?.data || []) as Resource[];
  }, [filterByModuleId, moduleResources, allResourcesData]);

  const isLoadingResources = filterByModuleId 
    ? isLoadingModuleResources 
    : isLoadingAllResources;

  // Filter resources
  const filteredResources = useMemo(() => {
    return availableResources.filter((resource) => {
      // Exclude specified resources
      if (excludeResourceIds.includes(resource.id)) return false;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        selectedType === "all" || resource.resource_type === selectedType;

      // Tag filter
      const matchesTag =
        selectedTag === "all" ||
        (resource.tags && resource.tags.includes(selectedTag));

      return matchesSearch && matchesType && matchesTag;
    });
  }, [availableResources, searchQuery, selectedType, selectedTag, excludeResourceIds]);

  const handleToggleResource = (resourceId: string) => {
    if (multiSelect) {
      setLocalSelectedIds((prev) =>
        prev.includes(resourceId)
          ? prev.filter((id) => id !== resourceId)
          : [...prev, resourceId]
      );
    } else {
      setLocalSelectedIds([resourceId]);
    }
  };

  const handleSelectAll = () => {
    if (localSelectedIds.length === filteredResources.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(filteredResources.map((r) => r.id));
    }
  };

  const handleConfirm = () => {
    onSelect(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedResourceIds);
    onOpenChange(false);
  };

  // Reset local selection when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedResourceIds);
    }
  }, [open, selectedResourceIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Videos
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      Audio
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images
                    </div>
                  </SelectItem>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Links
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Notes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {resourceTags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {resourceTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Selection Summary */}
          {multiSelect && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {localSelectedIds.length} of {filteredResources.length} selected
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {localSelectedIds.length === filteredResources.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
          )}

          {/* Resource List */}
          <ScrollArea className="h-[400px] border rounded-lg">
            {(isLoadingResources || (filterByModuleId && isLoadingModuleResources)) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No resources found</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredResources.map((resource) => {
                  const config = RESOURCE_TYPE_CONFIG[resource.resource_type as ResourceType];
                  const Icon = config.icon;
                  const isSelected = localSelectedIds.includes(resource.id);

                  return (
                    <div
                      key={resource.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "bg-muted border-primary" : ""
                      }`}
                      onClick={() => handleToggleResource(resource.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleResource(resource.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
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
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={localSelectedIds.length === 0}
          >
            {multiSelect
              ? `Select ${localSelectedIds.length} Resource${localSelectedIds.length !== 1 ? "s" : ""}`
              : "Select Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

