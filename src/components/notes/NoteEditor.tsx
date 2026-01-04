import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

export interface NoteEditorProps {
  value: JSONContent;
  onChange: (next: JSONContent) => void;
  /**
   * Forces the underlying TipTap editor instance to be re-created when this changes.
   * Use this when switching between different documents (e.g. editing different notes).
   */
  resetKey?: string | number;
  editable?: boolean;
  placeholder?: string;
  className?: string;
}

export function NoteEditor({
  value,
  onChange,
  resetKey,
  editable = true,
  placeholder = "Write your note…",
  className,
}: NoteEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-muted-foreground before:pointer-events-none before:h-0",
      }),
    ],
    [placeholder]
  );

  const editor = useEditor(
    {
      extensions,
      content: value,
      editable,
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm max-w-none dark:prose-invert focus:outline-none",
            "min-h-[180px] px-3 py-2",
            className
          ),
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getJSON());
      },
    },
    // TipTap only uses `content` on initialization; re-create the editor when switching docs.
    [resetKey]
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  // Keep editor in sync if the parent changes the value (e.g., switching notes)
  useEffect(() => {
    if (!editor) return;
    
    const next = JSON.stringify(value ?? {});
    const current = JSON.stringify(editor.getJSON() ?? {});
    
    if (next !== current) {
      editor.commands.setContent(value ?? { type: "doc", content: [{ type: "paragraph" }] }, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="rounded-xl border border-border/60 bg-background">
      <div className="border-b border-border/50 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Editor
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


