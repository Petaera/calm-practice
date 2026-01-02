
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FolderOpen,
  Users,
  Share2,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ModuleWithCounts } from "@/lib/supabase/types";

interface ModuleCardProps {
  module: ModuleWithCounts;
  onEdit: (module: ModuleWithCounts) => void;
  onDelete: (module: ModuleWithCounts) => void;
  onShare: (module: ModuleWithCounts) => void;
  onAssign: (module: ModuleWithCounts) => void;
  onToggleActive: (module: ModuleWithCounts, isActive: boolean) => void;
  onClick?: (module: ModuleWithCounts) => void;
}

export function ModuleCard({
  module,
  onEdit,
  onDelete,
  onShare,
  onAssign,
  onToggleActive,
  onClick,
}: ModuleCardProps) {
  const colorClass = module.color || "bg-primary";

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
        !module.is_active ? "opacity-60" : ""
      }`}
      onClick={() => onClick?.(module)}
    >
      {/* Color accent bar */}
      <div className={`h-2 ${colorClass}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
              <FolderOpen className={`h-5 w-5 ${colorClass.replace("bg-", "text-")}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {module.name}
              </CardTitle>
              {module.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {module.description}
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
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(module);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Module
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onAssign(module);
              }}>
                <Users className="h-4 w-4 mr-2" />
                Assign to Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onShare(module);
              }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onToggleActive(module, !module.is_active);
              }}>
                {module.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(module);
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            <span>{module.resource_count || 0} resources</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{module.assignment_count || 0} assigned</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {!module.is_active && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
          {module.is_public && (
            <Badge variant="outline" className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

