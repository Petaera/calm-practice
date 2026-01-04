import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Star, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientAvatarStack } from "./ClientAvatarStack";
import type { SoapNoteWithLinks } from "@/services/soap-notes.service";
import { jsonToDoc, toExcerpt } from "./soap-utils";

export interface SoapCardProps {
  note: SoapNoteWithLinks;
  onClick: (note: SoapNoteWithLinks) => void;
  onToggleImportant?: (note: SoapNoteWithLinks, next: boolean) => void;
  onToggleArchived?: (note: SoapNoteWithLinks, next: boolean) => void;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function SoapCard({ note, onClick, onToggleImportant, onToggleArchived }: SoapCardProps) {
  const isImportant = Boolean(note.is_important);
  const isArchived = Boolean(note.is_archived);

  const sections = {
    subjective: jsonToDoc(note.subjective),
    objective: jsonToDoc(note.objective),
    assessment: jsonToDoc(note.assessment),
    plan: jsonToDoc(note.plan),
  };
  const ex = toExcerpt(sections);

  const clientItems = note.clients ? [{ id: note.clients.id, full_name: note.clients.full_name }] : [];

  const linkedLabel = note.assessment_submissions?.assessments?.title
    ? `${note.assessment_submissions.assessments.title}${note.assessment_submissions.submitted_at ? ` • ${formatDate(note.assessment_submissions.submitted_at)}` : ""}`
    : null;

  return (
    <Card
      className={cn(
        "border-none shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group relative",
        isArchived && "opacity-70"
      )}
      onClick={() => onClick(note)}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-light/40 rounded-lg text-sky">
              <ClipboardList className="w-4 h-4" />
            </div>
            <Badge
              variant="secondary"
              className="bg-muted text-[10px] text-muted-foreground uppercase border-none px-2 py-0"
            >
              SOAP
            </Badge>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleImportant && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleImportant(note, !isImportant);
                }}
                title={isImportant ? "Unmark important" : "Mark important"}
              >
                <Star className={cn("w-4 h-4", isImportant && "text-amber-400 fill-amber-400")} />
              </Button>
            )}
            {onToggleArchived && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchived(note, !isArchived);
                }}
                title={isArchived ? "Unarchive" : "Archive"}
              >
                {isArchived ? (
                  <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Archive className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
          {note.title}
        </h3>

        {linkedLabel && (
          <div className="text-[11px] text-muted-foreground mb-3 line-clamp-1">
            Linked: {linkedLabel}
          </div>
        )}

        <div className="space-y-2 mb-6 flex-1">
          <div className="text-sm text-muted-foreground line-clamp-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">
              S
            </span>
            {ex.s || "—"}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">
              O
            </span>
            {ex.o || "—"}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">
              A
            </span>
            {ex.a || "—"}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">
              P
            </span>
            {ex.p || "—"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {formatDate(note.updated_at ?? note.created_at)}
          </span>
          <ClientAvatarStack clients={clientItems} />
        </div>
      </CardContent>
    </Card>
  );
}


