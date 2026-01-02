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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Video,
  Link as LinkIcon,
  StickyNote,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Headphones,
} from "lucide-react";
import type { Resource, ResourceInsert, ResourceUpdate, ResourceType } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";
import { uploadFile, type UploadProgress } from "@/services/storage.service";
import { fetchLinkPreview } from "@/services/link-preview.service";
import { toast } from "@/hooks/use-toast";

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource | null;
  moduleId?: string | null;
  onSubmit: (data: ResourceInsert | ResourceUpdate, file?: File) => Promise<void>;
  therapistId: string;
}

interface ResourceFormData {
  resource_type: ResourceType;
  title: string;
  description: string;
  external_url: string;
  content: string;
  tags: string;
}

const RESOURCE_TYPES = [
  { value: "document", label: "Document", icon: FileText, accept: ".pdf,.doc,.docx,.txt" },
  { value: "video", label: "Video", icon: Video, accept: "video/*" },
  { value: "audio", label: "Audio", icon: Headphones, accept: "audio/*" },
  { value: "image", label: "Image", icon: ImageIcon, accept: "image/*" },
  { value: "url", label: "URL/Link", icon: LinkIcon, accept: "" },
  { value: "note", label: "Note", icon: StickyNote, accept: "" },
] as const;

export function ResourceUploadDialog({
  open,
  onOpenChange,
  resource,
  moduleId,
  onSubmit,
  therapistId,
}: ResourceUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [linkPreview, setLinkPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResourceFormData>({
    defaultValues: {
      resource_type: "document",
      title: "",
      description: "",
      external_url: "",
      content: "",
      tags: "",
    },
  });

  const resourceType = watch("resource_type");
  const externalUrl = watch("external_url");

  // Reset form when dialog opens/closes or resource changes
  useEffect(() => {
    if (open) {
      if (resource) {
        reset({
          resource_type: resource.resource_type as ResourceType,
          title: resource.title,
          description: resource.description || "",
          external_url: resource.external_url || "",
          content: resource.content || "",
          tags: resource.tags?.join(", ") || "",
        });
        if (resource.metadata && typeof resource.metadata === 'object' && 'linkPreview' in resource.metadata) {
          setLinkPreview((resource.metadata as { linkPreview?: typeof linkPreview }).linkPreview || null);
        }
      } else {
        reset({
          resource_type: "document",
          title: "",
          description: "",
          external_url: "",
          content: "",
          tags: "",
        });
        setSelectedFile(null);
        setLinkPreview(null);
      }
    }
  }, [open, resource, reset]);

  // Fetch link preview when URL changes
  useEffect(() => {
    const currentTitle = watch("title");
    const currentDescription = watch("description");
    
    if (resourceType === "url" && externalUrl && !resource) {
      const timeoutId = setTimeout(async () => {
        setIsLoadingPreview(true);
        try {
          const result = await fetchLinkPreview(externalUrl);
          if (result.data) {
            setLinkPreview(result.data);
            // Auto-fill title if empty
            if (!currentTitle && result.data.title) {
              setValue("title", result.data.title);
            }
            if (!currentDescription && result.data.description) {
              setValue("description", result.data.description);
            }
          }
        } catch (error) {
          console.error("Failed to fetch link preview:", error);
        } finally {
          setIsLoadingPreview(false);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [externalUrl, resourceType, resource, watch, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!watch("title")) {
        setValue("title", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFormSubmit = async (data: ResourceFormData) => {
    // Validation
    if (["document", "video", "audio", "image"].includes(data.resource_type) && !selectedFile && !resource) {
      toast({
        title: "File required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (data.resource_type === "url" && !data.external_url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    if (data.resource_type === "note" && !data.content) {
      toast({
        title: "Content required",
        description: "Please enter some content for the note.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl: string | null = null;
      let metadata: Json = {};

      // Upload file if needed
      if (selectedFile && ["document", "video", "audio", "image"].includes(data.resource_type)) {
        const uploadResult = await uploadFile(selectedFile, therapistId, (progress) => {
          setUploadProgress(progress.percentage);
        });

        if (uploadResult.error) {
          throw new Error(uploadResult.error.message);
        }

        fileUrl = uploadResult.data!.fullUrl;
        metadata = uploadResult.data!.metadata;
      }

      // Add link preview to metadata
      if (data.resource_type === "url" && linkPreview) {
        metadata.linkPreview = linkPreview;
      }

      // Parse tags
      const tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (resource) {
        // Update existing resource
        await onSubmit({
          title: data.title,
          description: data.description || null,
          external_url: data.external_url || null,
          content: data.content || null,
          tags,
          metadata,
          ...(fileUrl && { file_url: fileUrl }),
        });
      } else {
        // Create new resource
        await onSubmit({
          therapist_id: therapistId,
          module_id: moduleId || null,
          resource_type: data.resource_type,
          title: data.title,
          description: data.description || null,
          file_url: fileUrl,
          external_url: data.external_url || null,
          content: data.content || null,
          tags,
          metadata,
        });
      }

      onOpenChange(false);
      toast({
        title: "Success",
        description: resource ? "Resource updated successfully." : "Resource uploaded successfully.",
      });
    } catch (error) {
      console.error("Error saving resource:", error);
      let errorMessage = "Failed to save resource.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Provide more helpful error messages
        if (error.message.includes("row-level security")) {
          errorMessage = "Authentication error. Please make sure you're logged in and try again.";
        } else if (error.message.includes("violates")) {
          errorMessage = "Permission denied. Please check your authentication.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const currentType = RESOURCE_TYPES.find((t) => t.value === resourceType);
  const Icon = currentType?.icon || FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resource ? "Edit Resource" : "Upload New Resource"}
          </DialogTitle>
          <DialogDescription>
            {resource
              ? "Update the resource details below."
              : "Choose a resource type and provide the details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Resource Type Selector */}
          <div className="space-y-2">
            <Label>Resource Type <span className="text-destructive">*</span></Label>
            <Select
              value={resourceType}
              onValueChange={(value) => setValue("resource_type", value as ResourceType)}
              disabled={!!resource}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload for documents, videos, audio, images */}
          {["document", "video", "audio", "image"].includes(resourceType) && (
            <div className="space-y-2">
              <Label htmlFor="file">
                File {!resource && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept={currentType?.accept}
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          )}

          {/* URL Input for links */}
          {resourceType === "url" && (
            <div className="space-y-2">
              <Label htmlFor="external_url">
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="external_url"
                type="url"
                placeholder="https://example.com"
                {...register("external_url", {
                  required: resourceType === "url" ? "URL is required" : false,
                })}
              />
              {errors.external_url && (
                <p className="text-sm text-destructive">{errors.external_url.message}</p>
              )}
              {isLoadingPreview && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading preview...
                </div>
              )}
              {linkPreview && (
                <div className="rounded-md border p-3 bg-muted/50">
                  {linkPreview.image && (
                    <img
                      src={linkPreview.image}
                      alt={linkPreview.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-sm font-medium">{linkPreview.title}</p>
                  {linkPreview.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {linkPreview.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content for notes */}
          {resourceType === "note" && (
            <div className="space-y-2">
              <Label htmlFor="content">
                Note Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                rows={6}
                {...register("content", {
                  required: resourceType === "note" ? "Content is required" : false,
                })}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Breathing Exercises Guide"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this resource..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="mindfulness, breathing, stress (comma-separated)"
              {...register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress > 0 ? "Uploading..." : "Saving..."}
                </>
              ) : resource ? (
                "Update Resource"
              ) : (
                "Upload Resource"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

