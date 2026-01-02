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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Share2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Module } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

interface ShareModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
  onGenerateToken: (moduleId: string) => Promise<string | null>;
  onRevokeToken: (moduleId: string) => Promise<void>;
}

export function ShareModuleDialog({
  open,
  onOpenChange,
  module,
  onGenerateToken,
  onRevokeToken,
}: ShareModuleDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!module) return null;

  const shareUrl = module.share_token
    ? `${window.location.origin}/public/module/${module.share_token}`
    : null;

  const handleGenerateLink = async () => {
    if (!module.id) return;
    
    setIsGenerating(true);
    try {
      const token = await onGenerateToken(module.id);
      if (token) {
        toast({
          title: "Share link generated",
          description: "The module can now be accessed via the public link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeLink = async () => {
    if (!module.id) return;
    
    setIsRevoking(true);
    try {
      await onRevokeToken(module.id);
      toast({
        title: "Share link revoked",
        description: "The public link has been disabled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke share link.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Share link copied successfully.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Module
          </DialogTitle>
          <DialogDescription>
            Generate a public link to share "{module.name}" with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This module doesn't have a public link yet. Generate one to share it with clients or others.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">What gets shared:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Module name and description</li>
                  <li>All resources in this module</li>
                  <li>Anyone with the link can view (no login required)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Public sharing is enabled for this module.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="share-url">Public Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    title="Copy link"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleOpenLink}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Anyone with this link can view the module and its resources. Revoke the link to disable public access.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {shareUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRevokeLink}
                disabled={isRevoking}
                className="w-full sm:w-auto"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  "Revoke Link"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

