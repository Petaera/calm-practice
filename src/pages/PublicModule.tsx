import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  Shield,
  Crown,
} from "lucide-react";
import { getModuleByShareToken, revokeModuleShareToken } from "@/services/modules.service";
import { getResourcesInModule } from "@/services/module-resources.service";
import type { Module, Resource, ResourceType } from "@/lib/supabase/types";
import { formatFileSize } from "@/services/storage.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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
  const { therapist } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

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

        // Important: module membership is maintained via `module_resources` junction table.
        const resourcesResult = await getResourcesInModule(moduleResult.data.id);
        if (resourcesResult.data) setResources(resourcesResult.data as Resource[]);
      } catch (err) {
        console.error("Error loading module:", err);
        setError("Failed to load module");
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [shareToken]);

  const isOwner = !!(module && therapist?.id && module.therapist_id === therapist.id);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    resources.forEach((r) => (r.tags ?? []).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...resources];

    if (selectedType !== "all") {
      list = list.filter((r) => r.resource_type === selectedType);
    }

    if (selectedTag !== "all") {
      list = list.filter((r) => (r.tags ?? []).includes(selectedTag));
    }

    if (q) {
      list = list.filter((r) => {
        const hay = `${r.title ?? ""} ${r.description ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return list;
  }, [resources, searchQuery, selectedType, selectedTag, sortOrder]);

  const activeResourceConfig = activeResource
    ? RESOURCE_TYPE_CONFIG[activeResource.resource_type as ResourceType]
    : null;

  const activeResourceMetadata = (activeResource?.metadata ?? {}) as {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    linkPreview?: { title?: string; description?: string; image?: string; siteName?: string };
  };

  const handleOpenResource = (resource: Resource) => {
    setActiveResource(resource);
  };

  const handleRevoke = async () => {
    if (!module || !isOwner) return;
    setIsRevoking(true);
    try {
      const result = await revokeModuleShareToken(module.id);
      if (result.error) throw new Error(result.error.message);
      toast({
        title: "Share link revoked",
        description: "Public access has been disabled for this module.",
      });
      setModule({ ...module, share_token: null, is_public: false });
      setError("This module is no longer public.");
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to revoke share link.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-light/20 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-background flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-sage-light/10 to-background">
      {/* Header / Hero */}
      <div className="border-b bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 shrink-0`}>
              <FolderOpen className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">{module.name}</h1>
                  {module.description && (
                    <p className="text-muted-foreground mt-2 max-w-3xl">
                      {module.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOwner ? (
                    <Badge variant="outline" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      View-only
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Badge variant="outline">
                  {resources.length} {resources.length === 1 ? "resource" : "resources"}
                </Badge>
                <Badge variant="secondary">Shared Module</Badge>

                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>

                  {isOwner && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard/resources")}
                      >
                        Open in Dashboard
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRevoke}
                        disabled={isRevoking}
                      >
                        {isRevoking ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Revoking...
                          </>
                        ) : (
                          "Revoke link"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
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
          <>
            {/* Browse controls */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources, descriptions, tags..."
                  className="pl-9"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="url">Links</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="font-medium">No resources match your filters</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try clearing search, type, or tag filters.
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedType("all");
                        setSelectedTag("all");
                        setSortOrder("newest");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => {
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
                    <Card
                      key={resource.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleOpenResource(resource)}
                    >
                      {/* Preview Image for URLs/Images */}
                      {resource.resource_type === "url" && metadata?.linkPreview?.image && (
                        <img
                          src={metadata.linkPreview.image}
                          alt={resource.title}
                          className="w-full h-40 object-cover"
                        />
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {config.label}
                              </Badge>
                            </div>
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

                        <p className="text-xs text-muted-foreground">
                          Click to view
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 max-w-6xl text-center text-sm text-muted-foreground">
          <p>This module was shared with you by a therapist.</p>
        </div>
      </div>

      {/* Resource viewer */}
      <Dialog open={!!activeResource} onOpenChange={(open) => !open && setActiveResource(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {activeResource && activeResourceConfig && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className={`p-2 rounded-lg ${activeResourceConfig.color}`}>
                    <activeResourceConfig.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate">{activeResource.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {activeResource.description || activeResourceConfig.label}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Primary preview area */}
                {activeResource.resource_type === "note" && (
                  <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {activeResource.content || "No content"}
                  </div>
                )}

                {activeResource.resource_type === "image" && activeResource.file_url && (
                  <div className="rounded-lg border overflow-hidden bg-black/5">
                    <img
                      src={activeResource.file_url}
                      alt={activeResource.title}
                      className="w-full max-h-[500px] object-contain"
                    />
                  </div>
                )}

                {activeResource.resource_type === "video" && activeResource.file_url && (
                  <div className="rounded-lg border overflow-hidden bg-black">
                    <video
                      src={activeResource.file_url}
                      controls
                      className="w-full max-h-[500px]"
                    />
                  </div>
                )}

                {activeResource.resource_type === "audio" && activeResource.file_url && (
                  <div className="rounded-lg border p-4">
                    <audio src={activeResource.file_url} controls className="w-full" />
                  </div>
                )}

                {activeResource.resource_type === "url" && (
                  <div className="rounded-lg border p-4 space-y-3">
                    {activeResourceMetadata?.linkPreview?.image && (
                      <img
                        src={activeResourceMetadata.linkPreview.image}
                        alt={activeResource.title}
                        className="w-full h-40 object-cover rounded-md border"
                      />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">
                        {activeResourceMetadata?.linkPreview?.title || activeResource.title}
                      </p>
                      {activeResourceMetadata?.linkPreview?.description && (
                        <p className="text-sm text-muted-foreground">
                          {activeResourceMetadata.linkPreview.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Secondary info + actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{activeResourceConfig.label}</Badge>
                    {activeResourceMetadata?.fileSize ? (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatFileSize(activeResourceMetadata.fileSize)}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    {activeResource.file_url && (
                      <Button asChild>
                        <a href={activeResource.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          {activeResource.resource_type === "document" ? "Open / Download" : "Open file"}
                        </a>
                      </Button>
                    )}
                    {activeResource.external_url && (
                      <Button variant="outline" asChild>
                        <a href={activeResource.external_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open link
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {activeResource.tags && activeResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activeResource.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicModule;

