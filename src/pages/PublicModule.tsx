import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FolderOpen,
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Headphones,
  Image as ImageIcon,
} from "lucide-react";
import { getModuleByShareToken } from "@/services/modules.service";
import { getResourcesByModule } from "@/services/resources.service";
import type { Module, Resource, ResourceType } from "@/lib/supabase/types";
import { formatFileSize } from "@/services/storage.service";

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

const PublicModule = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModule = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        const moduleResult = await getModuleByShareToken(shareToken);
        if (moduleResult.error || !moduleResult.data) {
          setError("Module not found or is no longer public");
          setIsLoading(false);
          return;
        }

        setModule(moduleResult.data as Module);

        const resourcesResult = await getResourcesByModule(moduleResult.data.id);
        if (resourcesResult.data) {
          setResources(resourcesResult.data);
        }
      } catch (err) {
        console.error("Error loading module:", err);
        setError("Failed to load module");
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Module Not Found</CardTitle>
            </div>
            <CardDescription>
              {error || "This module is no longer available or the link is invalid."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colorClass = module.color || "bg-primary";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
              <FolderOpen className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{module.name}</h1>
              {module.description && (
                <p className="text-muted-foreground mt-1">{module.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {resources.length} {resources.length === 1 ? "resource" : "resources"}
            </Badge>
            <Badge variant="secondary">Public Module</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {resources.length === 0 ? (
          <Alert>
            <AlertDescription>
              This module doesn't have any resources yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const config = RESOURCE_TYPE_CONFIG[resource.resource_type as ResourceType];
              const Icon = config.icon;
              const metadata = resource.metadata as {
                fileName?: string;
                fileSize?: number;
                mimeType?: string;
                linkPreview?: {
                  title?: string;
                  description?: string;
                  image?: string;
                };
              };

              return (
                <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Preview Image for URLs/Images */}
                  {resource.resource_type === "url" && metadata?.linkPreview?.image && (
                    <img
                      src={metadata.linkPreview.image}
                      alt={resource.title}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {resource.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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

                    {/* File Info */}
                    {metadata?.fileSize && (
                      <p className="text-xs text-muted-foreground">
                        Size: {formatFileSize(metadata.fileSize)}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {resource.file_url && (
                        <Button
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                      {resource.external_url && (
                        <Button
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Link
                          </a>
                        </Button>
                      )}
                      {resource.resource_type === "note" && resource.content && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Show note content in a modal or expand
                            alert(resource.content);
                          }}
                        >
                          View Note
                        </Button>
                      )}
                    </div>

                    {/* Resource Type Badge */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 max-w-6xl text-center text-sm text-muted-foreground">
          <p>This module was shared with you by a therapist</p>
        </div>
      </div>
    </div>
  );
};

export default PublicModule;

