"use server";

import { generateWithGroqFallback } from "./groqClient";

const INVALID_UNIT_MESSAGE =
  "The unit name does not match the selected subject.";
const INVALID_FOCUS_MESSAGE =
  "The entered topic does not match the selected subject and unit.";

export async function suggestTopicsAction(
  subject: string,
  unitName: string,
  educationType?: string,
  branch?: string,
  existingTopics: string[] = [],
  focusTerm?: string,
): Promise<string[]> {

  if (!subject || !unitName) {
    console.warn("🔴 [suggestTopicsAction] Missing subject or unitName");
    return [];
  }

  const prompt = `
You are given academic context from an Indian college syllabus.

Education Type: ${educationType || "B.Tech"}
Branch: ${branch || "CSE"}
Subject: ${subject}
Unit Name: ${unitName}
Existing Topics: ${existingTopics.length > 0 ? existingTopics.join(" | ") : "None"}
Requested Topic Focus: ${focusTerm?.trim() || "None"}

TASK:
1. First determine whether the Unit Name is academically relevant to the Subject.
2. If the Unit Name does NOT match the Subject, return ONLY this exact JSON array:
["${INVALID_UNIT_MESSAGE}"]

3. If the Unit Name matches the Subject, return ONLY a JSON array of exactly 8 topic strings.
4. Do not repeat or closely paraphrase any Existing Topics. Suggest additional relevant topics instead.
5. When Requested Topic Focus is provided, suggestions must relate to that focus while remaining relevant to the Subject and Unit Name.
6. If Requested Topic Focus does not relate to BOTH the Subject and Unit Name, return ONLY this exact JSON array:
["${INVALID_FOCUS_MESSAGE}"]

STRICT RULES:
- Output must be valid raw JSON only
- No markdown
- No explanation
- No extra text
- No headings
- No backticks
- Topics must be directly relevant to BOTH Subject and Unit Name
- Topics must be 6–10 words each
- Use precise academic terminology
`;

  try {
    const rawText = await generateWithGroqFallback(prompt);
    const cleaned = rawText.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      return [];
    }

    if (
      parsed.length === 1 &&
      typeof parsed[0] === "string" &&
      [INVALID_UNIT_MESSAGE, INVALID_FOCUS_MESSAGE].includes(parsed[0].trim())
    ) {
      return [parsed[0].trim()];
    }

    const filtered = parsed.filter(
      (t: unknown) =>
        typeof t === "string" &&
        t.trim().length > 5 &&
        ![INVALID_UNIT_MESSAGE, INVALID_FOCUS_MESSAGE].includes(t.trim())
    );

    return filtered.slice(0, 8);
  } catch (err) {
    console.error("[suggestTopicsAction] Failed:", err);
    // Server actions serialize thrown errors as HTTP 500 responses. Returning
    // an empty result lets the query layer handle retries and show its normal
    // inline unavailable state without breaking the request itself.
    return [];
  }
}
