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

interface ResourceListItemProps {
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

export function ResourceListItem({
  resource,
  onEdit,
  onDelete,
  onAddToModule,
  onAssign,
  onClick,
  assignmentCount,
}: ResourceListItemProps) {
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
    <div
      className="group grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(resource)}
    >
      {/* Icon and Type */}
      <div className="col-span-1 flex items-center gap-2">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="col-span-3 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{resource.title}</h3>
          <Badge variant="outline" className="text-xs shrink-0">
            {config.label}
          </Badge>
        </div>
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {resource.description}
          </p>
        )}
      </div>

      {/* Modules */}
      <div className="col-span-2 flex flex-wrap gap-1 min-w-0">
        {modules.length > 0 ? (
          <>
            {modules.slice(0, 2).map((module) => {
              const colorClass = module.color || "bg-primary";
              return (
                <Badge
                  key={module.id}
                  variant="outline"
                  className={`text-xs border-2 shrink-0 ${colorClass.replace("bg-", "border-")}`}
                >
                  <FolderOpen className="h-3 w-3 mr-1" />
                  {module.name}
                </Badge>
              );
            })}
            {modules.length > 2 && (
              <Badge variant="outline" className="text-xs border-2">
                +{modules.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No modules</span>
        )}
      </div>

      {/* Tags */}
      <div className="col-span-2 flex flex-wrap gap-1 min-w-0">
        {resource.tags && resource.tags.length > 0 ? (
          <>
            {resource.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs rounded-full">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs rounded-full">
                +{resource.tags.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No tags</span>
        )}
      </div>

      {/* Date */}
      <div className="col-span-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span className="truncate">{formatRelativeDate(resource.created_at)}</span>
      </div>

      {/* Metadata */}
      <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
        {metadata?.fileSize && (
          <span>{formatFileSize(metadata.fileSize)}</span>
        )}
        {resource.resource_type === "url" && resource.external_url && (
          <span className="truncate max-w-[150px]">
            {new URL(resource.external_url).hostname}
          </span>
        )}
        {assignmentCount !== undefined && assignmentCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {assignmentCount}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end">
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
    </div>
  );
}

