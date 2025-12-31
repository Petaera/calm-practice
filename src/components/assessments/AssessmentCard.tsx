import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardCheck,
  Share2,
  BarChart3,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Link2,
  Copy,
} from "lucide-react";
import type { Assessment } from "@/lib/supabase/types";

interface AssessmentCardProps {
  assessment: Assessment & { question_count: number };
  submissionCount?: number;
  assignmentCount?: number;
  isExpanded?: boolean;
  onExpand?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onViewResults?: () => void;
  onAssignClients?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
  onCopyLink?: () => void;
}

/**
 * AssessmentCard - Displays an assessment with visible action buttons
 * 
 * Key UX improvements:
 * - Primary actions visible on the card (not hidden in menu)
 * - Status clearly indicated with color-coded badges
 * - Metrics (questions, submissions, assignments) visible at a glance
 * - Expand/collapse for viewing questions
 */
export function AssessmentCard({
  assessment,
  submissionCount = 0,
  assignmentCount = 0,
  isExpanded = false,
  onExpand,
  onEdit,
  onShare,
  onViewResults,
  onAssignClients,
  onToggleActive,
  onDelete,
  onCopyLink,
}: AssessmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = assessment.is_active;
  const hasShareLink = !!assessment.share_token;
  const questionCount = assessment.question_count;

  return (
    <Card
      className={`
        transition-all duration-200 border-2
        ${isExpanded ? "border-primary/30 shadow-md" : "border-transparent hover:border-muted-foreground/20"}
        ${isHovered ? "shadow-lg" : "shadow-sm"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon, Title, Status */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`
              p-2 rounded-lg shrink-0
              ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
            `}>
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base truncate">
                  {assessment.title}
                </h3>
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  className={`text-xs ${isActive ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}`}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
                {hasShareLink && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Link2 className="h-3 w-3" />
                    Shared
                  </Badge>
                )}
              </div>
              {assessment.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {assessment.description}
                </p>
              )}
              {assessment.category && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {assessment.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                {isActive ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Metrics Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileQuestion className="h-4 w-4" />
            <span>{questionCount} {questionCount === 1 ? "Question" : "Questions"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span>{submissionCount} {submissionCount === 1 ? "Submission" : "Submissions"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{assignmentCount} {assignmentCount === 1 ? "Client" : "Clients"}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="gap-1.5"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Generate or manage share link
              </TooltipContent>
            </Tooltip>

            {hasShareLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopyLink}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Copy share link
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewResults}
                  className="gap-1.5"
                  disabled={submissionCount === 0}
                >
                  <BarChart3 className="h-4 w-4" />
                  Results
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {submissionCount === 0 ? "No submissions yet" : "View submission results"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAssignClients}
                  className="gap-1.5"
                >
                  <Users className="h-4 w-4" />
                  Assign
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Assign to clients
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Expand/Collapse Button - Pushed to right */}
          <div className="flex-1" />
          <Button
            variant={isExpanded ? "secondary" : "ghost"}
            size="sm"
            onClick={onExpand}
            className="gap-1.5"
          >
            <FileQuestion className="h-4 w-4" />
            {isExpanded ? "Hide Questions" : "View Questions"}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentCard;

