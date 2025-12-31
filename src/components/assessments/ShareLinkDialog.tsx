import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenerateShareToken, useRevokeShareToken } from "@/hooks/use-assessments";
import type { Assessment } from "@/lib/supabase/types";

export interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
  onTokenChange: () => void;
}

/**
 * Dialog for generating and managing shareable assessment links
 */
export function ShareLinkDialog({
  open,
  onOpenChange,
  assessment,
  onTokenChange,
}: ShareLinkDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(assessment.share_token);

  const generateTokenMutation = useGenerateShareToken();
  const revokeTokenMutation = useRevokeShareToken();

  // Update local state when assessment changes
  useEffect(() => {
    setShareToken(assessment.share_token);
  }, [assessment.share_token]);

  const shareUrl = shareToken
    ? `${window.location.origin}/assessment/${shareToken}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "The assessment link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateToken = async () => {
    const newToken = await generateTokenMutation.mutate(assessment.id);

    if (newToken) {
      setShareToken(newToken);
      onTokenChange();
      toast({
        title: "Link Generated",
        description: "A new shareable link has been created.",
      });
    } else if (generateTokenMutation.error) {
      toast({
        title: "Error",
        description: generateTokenMutation.error.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeToken = async () => {
    const result = await revokeTokenMutation.mutate(assessment.id);

    if (result === null) {
      setShareToken(null);
      onTokenChange();
      toast({
        title: "Link Revoked",
        description: "The shareable link has been revoked. Old links will no longer work.",
      });
    } else if (revokeTokenMutation.error) {
      toast({
        title: "Error",
        description: revokeTokenMutation.error.message,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Assessment</DialogTitle>
          <DialogDescription>
            Generate a shareable link that clients can use to complete this
            assessment without logging in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assessment Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium text-sm">{assessment.title}</p>
            {assessment.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {assessment.description}
              </p>
            )}
          </div>

          {shareUrl ? (
            <>
              {/* Share Link */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenLink}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can access and complete the assessment.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateToken}
                  disabled={generateTokenMutation.isLoading}
                  className="flex-1"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      generateTokenMutation.isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Generate New Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRevokeToken}
                  disabled={revokeTokenMutation.isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke
                </Button>
              </div>

              {/* Warning */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Generating a new link will invalidate
                  the current one. Anyone with the old link will no longer be
                  able to access the assessment.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* No Link Yet */}
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  No shareable link has been generated for this assessment yet.
                </p>
                <Button
                  onClick={handleGenerateToken}
                  disabled={generateTokenMutation.isLoading}
                >
                  {generateTokenMutation.isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Shareable Link</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

