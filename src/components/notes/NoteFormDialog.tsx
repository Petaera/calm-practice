import { useEffect, useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { NoteType, NoteInsert, NoteUpdate } from "@/lib/supabase";
import type { Client } from "@/lib/supabase";
import type { NoteWithClient } from "@/services/notes.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NoteEditor } from "./NoteEditor";
import { EMPTY_DOC, noteContentToDoc } from "./utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface NoteFormValues {
  title: string;
  clientId?: string;
  noteType: NoteType;
  tagsText: string;
  isImportant: boolean;
  content: JSONContent;
}

export interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
  clients: Client[];
  mode: "create" | "edit";
  note?: NoteWithClient | null;
  prefillClientId?: string;
  onCreate: (payload: NoteInsert) => Promise<void>;
  onUpdate: (noteId: string, payload: NoteUpdate) => Promise<void>;
  onArchiveToggle?: (noteId: string, nextArchived: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

const NOTE_TYPES: Array<{ value: NoteType; label: string }> = [
  { value: "general", label: "General" },
  { value: "clinical", label: "Clinical" },
  { value: "observation", label: "Observation" },
  { value: "resource", label: "Resource" },
];

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToText(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}

export function NoteFormDialog({
  open,
  onOpenChange,
  therapistId,
  clients,
  mode,
  note,
  prefillClientId,
  onCreate,
  onUpdate,
  onArchiveToggle,
  isSubmitting = false,
}: NoteFormDialogProps) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [tagsText, setTagsText] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [content, setContent] = useState<JSONContent>(EMPTY_DOC);

  const dialogTitle = mode === "edit" ? "Edit note" : "Create note";
  const dialogDescription =
    mode === "edit"
      ? "Update your note details below."
      : "Capture observations, clinical insights, or quick reminders.";

  const clientOptions = useMemo(() => {
    const sorted = [...clients].sort((a, b) => a.full_name.localeCompare(b.full_name));
    return sorted;
  }, [clients]);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && note) {
      setTitle(note.title ?? "");
      setClientId(note.client_id ?? undefined);
      setNoteType((note.note_type ?? "general") as NoteType);
      setTagsText(tagsToText(note.tags));
      setIsImportant(Boolean(note.is_important));
      setContent(noteContentToDoc(note.content));
      return;
    }

    // create
    setTitle("");
    setClientId(prefillClientId || undefined);
    setNoteType("general");
    setTagsText("");
    setIsImportant(false);
    setContent(EMPTY_DOC);
  }, [open, mode, note, prefillClientId]);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const tags = parseTags(tagsText);
    const contentString = JSON.stringify(content ?? EMPTY_DOC);

    if (mode === "create") {
      const payload: NoteInsert = {
        therapist_id: therapistId,
        title: title.trim(),
        content: contentString,
        client_id: clientId ?? null,
        note_type: noteType,
        is_important: isImportant,
        is_archived: false,
        tags: tags.length > 0 ? tags : null,
      };
      await onCreate(payload);
      return;
    }

    if (!note) return;
    const updates: NoteUpdate = {
      title: title.trim(),
      content: contentString,
      client_id: clientId ?? null,
      note_type: noteType,
      is_important: isImportant,
      tags: tags.length > 0 ? tags : null,
    };
    await onUpdate(note.id, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Key observation, homework, follow-up…"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Client (optional)</Label>
              <Select
                value={clientId ?? "none"}
                onValueChange={(v) => setClientId(v === "none" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not assigned</SelectItem>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note-tags">Tags (comma separated)</Label>
            <Input
              id="note-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. anxiety, CBT, follow-up"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="note-important"
              checked={isImportant}
              onCheckedChange={(v) => setIsImportant(v === true)}
            />
            <Label htmlFor="note-important">Mark as important</Label>
          </div>

          <NoteEditor
            value={content}
            onChange={setContent}
            resetKey={`note-${note?.id ?? "new"}-${open}`}
          />
        </div>

        <DialogFooter className="gap-2">
          {mode === "edit" && note && onArchiveToggle && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onArchiveToggle(note.id, note.is_archived !== true)}
              disabled={isSubmitting}
            >
              {note.is_archived ? "Unarchive" : "Archive"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


