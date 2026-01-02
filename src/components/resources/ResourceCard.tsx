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
  FolderInput,
  Image,
  Headphones,
} from "lucide-react";
import type { Resource, ResourceType } from "@/lib/supabase/types";
import { formatFileSize } from "@/services/storage.service";

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onMove: (resource: Resource) => void;
  onClick?: (resource: Resource) => void;
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
  onMove,
  onClick,
}: ResourceCardProps) {
  const config = RESOURCE_TYPE_CONFIG[resource.resource_type as ResourceType];
  const Icon = config.icon;
  const metadata = resource.metadata as any;

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
              <h3 className="font-semibold truncate">{resource.title}</h3>
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(resource);
                }}
              >
                <FolderInput className="h-4 w-4 mr-2" />
                Move to Module
              </DropdownMenuItem>
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

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          {config.label}
        </Badge>
        {metadata?.fileSize && (
          <span>{formatFileSize(metadata.fileSize)}</span>
        )}
        {resource.resource_type === "url" && resource.external_url && (
          <span className="truncate max-w-[150px]">
            {new URL(resource.external_url).hostname}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

