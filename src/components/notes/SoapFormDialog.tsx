import { useEffect, useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Client, SoapNoteInsert, SoapNoteUpdate } from "@/lib/supabase";
import type { SoapNoteWithLinks } from "@/services/soap-notes.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoteEditor } from "./NoteEditor";
import { EMPTY_SOAP, jsonToDoc } from "./soap-utils";
import { useSubmissionsByClient } from "@/hooks";

export interface SoapFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
  clients: Client[];
  mode: "create" | "edit";
  note?: SoapNoteWithLinks | null;
  prefillClientId?: string;
  onCreate: (payload: SoapNoteInsert) => Promise<void>;
  onUpdate: (id: string, updates: SoapNoteUpdate) => Promise<void>;
  onArchiveToggle?: (id: string, nextArchived: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToText(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}

function submissionLabel(
  s: { id: string; submitted_at: string | null; assessments: { title: string } | null } | null
) {
  if (!s) return "None";
  const title = s.assessments?.title ?? "Assessment";
  const date = s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  return date ? `${title} • ${date}` : title;
}

export function SoapFormDialog({
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
}: SoapFormDialogProps) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string | undefined>();
  const [assessmentSubmissionId, setAssessmentSubmissionId] = useState<string | undefined>();
  const [tagsText, setTagsText] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  const [subjective, setSubjective] = useState<JSONContent>(EMPTY_SOAP.subjective);
  const [objective, setObjective] = useState<JSONContent>(EMPTY_SOAP.objective);
  const [assessment, setAssessment] = useState<JSONContent>(EMPTY_SOAP.assessment);
  const [plan, setPlan] = useState<JSONContent>(EMPTY_SOAP.plan);

  const clientOptions = useMemo(() => {
    return [...clients].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [clients]);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && note) {
      setTitle(note.title ?? "");
      setClientId(note.client_id ?? undefined);
      setAssessmentSubmissionId(note.assessment_submission_id ?? undefined);
      setTagsText(tagsToText(note.tags));
      setIsImportant(Boolean(note.is_important));
      setSubjective(jsonToDoc(note.subjective));
      setObjective(jsonToDoc(note.objective));
      setAssessment(jsonToDoc(note.assessment));
      setPlan(jsonToDoc(note.plan));
      return;
    }

    // create
    setTitle("");
    setClientId(prefillClientId || undefined);
    setAssessmentSubmissionId(undefined);
    setTagsText("");
    setIsImportant(false);
    setSubjective(EMPTY_SOAP.subjective);
    setObjective(EMPTY_SOAP.objective);
    setAssessment(EMPTY_SOAP.assessment);
    setPlan(EMPTY_SOAP.plan);
  }, [open, mode, note, prefillClientId]);

  const { data: submissionsData, isLoading: isLoadingSubmissions } = useSubmissionsByClient(
    clientId,
    { page: 1, pageSize: 50 }
  );
  const submissions = submissionsData?.data ?? [];

  const canSubmit = title.trim().length > 0 && Boolean(clientId);

  const handleSubmit = async () => {
    if (!canSubmit || !clientId) return;

    const tags = parseTags(tagsText);

    if (mode === "create") {
      const payload: SoapNoteInsert = {
        therapist_id: therapistId,
        client_id: clientId,
        assessment_submission_id: assessmentSubmissionId ?? null,
        title: title.trim(),
        subjective,
        objective,
        assessment,
        plan,
        tags: tags.length > 0 ? tags : null,
        is_important: isImportant,
        is_archived: false,
      };
      await onCreate(payload);
      return;
    }

    if (!note) return;
    const updates: SoapNoteUpdate = {
      client_id: clientId,
      assessment_submission_id: assessmentSubmissionId ?? null,
      title: title.trim(),
      subjective,
      objective,
      assessment,
      plan,
      tags: tags.length > 0 ? tags : null,
      is_important: isImportant,
    };
    await onUpdate(note.id, updates);
  };

  const linkedSubmission = useMemo(() => {
    if (!assessmentSubmissionId) return null;
    return submissions.find((s) => s.id === assessmentSubmissionId) ?? null;
  }, [assessmentSubmissionId, submissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">
            {mode === "edit" ? "Edit SOAP note" : "Create SOAP note"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Subjective, Objective, Assessment, Plan — structured clinical documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="soap-title">Title</Label>
            <Input
              id="soap-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly check-in, anxiety follow-up…"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Client (required)</Label>
              <Select
                value={clientId ?? ""}
                onValueChange={(v) => {
                  setClientId(v || undefined);
                  setAssessmentSubmissionId(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Link assessment submission (optional)</Label>
              <Select
                value={assessmentSubmissionId ?? "none"}
                onValueChange={(v) => setAssessmentSubmissionId(v === "none" ? undefined : v)}
                disabled={!clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!clientId ? "Select a client first" : "None"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {submissions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {submissionLabel({ id: s.id, submitted_at: s.submitted_at, assessments: s.assessments })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientId && isLoadingSubmissions && (
                <div className="text-xs text-muted-foreground">Loading submissions…</div>
              )}
              {clientId && !isLoadingSubmissions && assessmentSubmissionId && (
                <div className="text-xs text-muted-foreground">
                  Linked: {submissionLabel(linkedSubmission)}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="soap-tags">Tags (comma separated)</Label>
            <Input
              id="soap-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. anxiety, CBT, follow-up"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="soap-important"
              checked={isImportant}
              onCheckedChange={(v) => setIsImportant(v === true)}
            />
            <Label htmlFor="soap-important">Mark as important</Label>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Subjective
              </div>
              <NoteEditor
                value={subjective}
                onChange={setSubjective}
                resetKey={`soap-${note?.id ?? "new"}-${open}-subjective`}
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Objective
              </div>
              <NoteEditor
                value={objective}
                onChange={setObjective}
                resetKey={`soap-${note?.id ?? "new"}-${open}-objective`}
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Assessment
              </div>
              <NoteEditor
                value={assessment}
                onChange={setAssessment}
                resetKey={`soap-${note?.id ?? "new"}-${open}-assessment`}
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Plan
              </div>
              <NoteEditor
                value={plan}
                onChange={setPlan}
                resetKey={`soap-${note?.id ?? "new"}-${open}-plan`}
              />
            </div>
          </div>
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
            {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create SOAP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


