import type { JSONContent } from "@tiptap/react";

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function safeParseJSONContent(raw: string): JSONContent | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JSONContent;
  } catch {
    return null;
  }
}

export function textToDoc(text: string): JSONContent {
  const trimmed = text.trim();
  if (!trimmed) return EMPTY_DOC;
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      },
    ],
  };
}

export function noteContentToDoc(content: string): JSONContent {
  const parsed = safeParseJSONContent(content);
  if (parsed) return parsed;
  // Back-compat: older notes might be plain text
  return textToDoc(content);
}

export function docToPlainText(doc: JSONContent): string {
  const parts: string[] = [];

  const walk = (node: JSONContent | null | undefined) => {
    if (!node) return;
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };

  walk(doc);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function docToExcerpt(doc: JSONContent, maxLen = 140): string {
  const text = docToPlainText(doc);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}…`;
}


