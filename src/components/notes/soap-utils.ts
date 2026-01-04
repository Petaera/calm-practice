import type { JSONContent } from "@tiptap/react";
import { EMPTY_DOC, docToExcerpt } from "./utils";

export interface SoapSections {
  subjective: JSONContent;
  objective: JSONContent;
  assessment: JSONContent;
  plan: JSONContent;
}

export const EMPTY_SOAP: SoapSections = {
  subjective: EMPTY_DOC,
  objective: EMPTY_DOC,
  assessment: EMPTY_DOC,
  plan: EMPTY_DOC,
};

export function jsonToDoc(value: unknown): JSONContent {
  if (value && typeof value === "object") return value as JSONContent;
  return EMPTY_DOC;
}

export function toExcerpt(sections: SoapSections) {
  return {
    s: docToExcerpt(sections.subjective, 90),
    o: docToExcerpt(sections.objective, 90),
    a: docToExcerpt(sections.assessment, 90),
    p: docToExcerpt(sections.plan, 90),
  };
}


