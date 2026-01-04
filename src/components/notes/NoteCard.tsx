import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StickyNote, Star, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteType } from "@/lib/supabase";
import type { NoteWithClient } from "@/services/notes.service";
import { ClientAvatarStack } from "./ClientAvatarStack";
import type { JSONContent } from "@tiptap/react";
import { docToExcerpt, noteContentToDoc } from "./utils";

export interface NoteCardProps {
  note: NoteWithClient;
  onClick: (note: NoteWithClient) => void;
  onToggleImportant?: (note: NoteWithClient, next: boolean) => void;
  onToggleArchived?: (note: NoteWithClient, next: boolean) => void;
}

const typeLabel: Record<NoteType, string> = {
  general: "General",
  clinical: "Clinical",
  observation: "Observation",
  resource: "Resource",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function NoteCard({ note, onClick, onToggleImportant, onToggleArchived }: NoteCardProps) {
  const isImportant = Boolean(note.is_important);
  const isArchived = Boolean(note.is_archived);
  const noteType = (note.note_type ?? "general") as NoteType;

  const doc: JSONContent = noteContentToDoc(note.content);
  const excerpt = docToExcerpt(doc, 180);

  const clientItems = note.clients ? [{ id: note.clients.id, full_name: note.clients.full_name }] : [];

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
            <div className="p-2 bg-sage-light/30 rounded-lg text-primary">
              <StickyNote className="w-4 h-4" />
            </div>
            <Badge
              variant="secondary"
              className="bg-muted text-[10px] text-muted-foreground uppercase border-none px-2 py-0"
            >
              {typeLabel[noteType]}
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
        <p className="text-sm text-muted-foreground mb-6 line-clamp-4 flex-1">
          {excerpt || "—"}
        </p>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-muted text-[10px] text-muted-foreground uppercase border-none px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

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


