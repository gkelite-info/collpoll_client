import type { TopicNotes } from "@/lib/helpers/faculty/ai/Generatetopicnotes";

export const INVALID_UNIT_MESSAGE = "The unit name does not match the selected subject.";

export function toPascalCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function runWhenBrowserIsIdle(task: () => void) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout: 5000 });
    return;
  }
  globalThis.setTimeout(task, 2500);
}

export function hasGenericTopicNotes(notes: TopicNotes) {
  const genericTerms = new Set([
    "concept",
    "process",
    "application",
    "diagram",
    "example",
    "advantage",
    "limitation",
    "revision",
    "key point",
    "summary",
  ]);
  const genericTermCount =
    notes.keyTerms?.filter((term) => genericTerms.has(term.term.trim().toLowerCase())).length ?? 0;
  const genericImageText = notes.imageExamples
    ?.map((image) => `${image.title} ${image.labels?.join(" ")}`)
    .join(" ") ?? "";
  const genericQuestionText = [
    ...(notes.keyPoints ?? []),
    ...(notes.workedExamples?.map((example) => `${example.problem} ${example.solution}`) ?? []),
  ].join(" ");

  return (
    genericTermCount >= 3 ||
    /labelled concept|structure or apparatus|process diagram|main part|working area|use case/i.test(
      genericImageText,
    ) ||
    /how does key point|explain summary|write short notes on example|diagram improves clarity/i.test(
      genericQuestionText,
    )
  );
}
