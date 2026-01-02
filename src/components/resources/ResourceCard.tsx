import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  FolderPlus,
  Image,
  Headphones,
  Users,
  Calendar,
  FolderOpen,
  Tag,
} from "lucide-react";
import type { Resource, ResourceType } from "@/lib/supabase/types";
import { formatFileSize } from "@/services/storage.service";
import { useModulesForResource } from "@/hooks/use-module-resources";
import { formatRelativeDate } from "@/lib/utils";

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onAddToModule?: (resource: Resource) => void;
  onAssign?: (resource: Resource) => void;
  onClick?: (resource: Resource) => void;
  assignmentCount?: number;
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
    icon: Image,
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

export function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onAddToModule,
  onAssign,
  onClick,
  assignmentCount,
}: ResourceCardProps) {
  const config = RESOURCE_TYPE_CONFIG[resource.resource_type as ResourceType];
  const Icon = config.icon;
  const metadata = resource.metadata as any;
  const { data: modules = [] } = useModulesForResource(resource.id);

  const handleDownload = () => {
    if (resource.file_url) {
      window.open(resource.file_url, "_blank");
    }
  };

  const handleOpenLink = () => {
    if (resource.external_url) {
      window.open(resource.external_url, "_blank");
    }
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => onClick?.(resource)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{resource.title}</h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {config.label}
                </Badge>
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {resource.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {resource.file_url && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {resource.external_url && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink();
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
              )}
              {(resource.file_url || resource.external_url) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onAddToModule && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToModule(resource);
                  }}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add to Module
                </DropdownMenuItem>
              )}
              {onAssign && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(resource);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign to Clients
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resource);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {/* Preview for links with metadata */}
        {resource.resource_type === "url" && metadata?.linkPreview && (
          <div className="mb-3 rounded-md border p-3 bg-muted/50">
            {metadata.linkPreview.image && (
              <img
                src={metadata.linkPreview.image}
                alt={metadata.linkPreview.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <p className="text-sm font-medium line-clamp-1">
              {metadata.linkPreview.title || "Link preview"}
            </p>
            {metadata.linkPreview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {metadata.linkPreview.description}
              </p>
            )}
          </div>
        )}

        {/* Modules - with distinct styling */}
        {modules.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Modules</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {modules.slice(0, 3).map((module) => {
                const colorClass = module.color || "bg-primary";
                return (
                  <Badge
                    key={module.id}
                    variant="outline"
                    className={`text-xs border-2 ${colorClass.replace("bg-", "border-")}`}
                  >
                    {module.name}
                  </Badge>
                );
              })}
              {modules.length > 3 && (
                <Badge variant="outline" className="text-xs border-2">
                  +{modules.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags - with distinct styling */}
        {resource.tags && resource.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs rounded-full">
                  {tag}
                </Badge>
              ))}
              {resource.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs rounded-full">
                  +{resource.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {assignmentCount !== undefined && assignmentCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {assignmentCount} assigned
            </Badge>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelativeDate(resource.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {metadata?.fileSize && (
            <span>{formatFileSize(metadata.fileSize)}</span>
          )}
          {resource.resource_type === "url" && resource.external_url && (
            <span className="truncate max-w-[150px]">
              {new URL(resource.external_url).hostname}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

