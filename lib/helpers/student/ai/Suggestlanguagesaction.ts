"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "groq/compound",
  "groq/compound-mini",
  "qwen/qwen3-32b",
];

const LANGUAGE_SYSTEM_PROMPT = `
You are a career counselor specializing in student resume building.
Your job is to suggest relevant languages a student might know or want to add to their resume.

RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be a real human language name (e.g., "English", "Hindi", "Telugu").
- Return EXACTLY 12 languages.
- Prioritize languages commonly spoken in India relevant to the student's education type and branch.
- Always include English.
- Include major Indian regional languages + a couple of international ones.
- Do NOT include programming languages — only spoken/written human languages.
`;

export async function suggestLanguagesAction(
  educationType: string,
  branch: string
): Promise<string[]> {
  if (!educationType || !branch) return [];

  const prompt = `
Education Type: ${educationType}
Branch/Major: ${branch}

Return ONLY a valid JSON array of exactly 12 human language names this student is likely to know or would benefit from listing on their resume.
Include:
- English (always)
- Hindi (always)
- 5–6 major Indian regional languages (Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, etc.)
- 2–3 internationally relevant languages (French, German, Spanish, Japanese, Mandarin, Arabic, etc.)

No markdown. No explanation. Just the JSON array of language name strings.
`;

  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: 300,
        temperature: 0.5,
        messages: [
          { role: "system", content: LANGUAGE_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      let text = response.choices[0]?.message?.content ?? "";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found in response");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("Parsed value is not array");

      return [...new Set(parsed.filter((s) => typeof s === "string"))].slice(0, 12) as string[];
    } catch (error: any) {
      lastError = error;
      if (error?.status === 429) continue;
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted for language suggestions");
  return [];
}

export async function searchLanguagesAction(query: string): Promise<string[]> {
  if (!query.trim()) return [];

  const prompt = `The user typed "${query}" in a language search field on a resume builder.

Task: Return ALL real human languages (spoken/written) whose names START WITH the letters "${query}" (case-insensitive).

Rules:
- Match must BEGIN with "${query}" — not just contain it somewhere in the middle or end
- Include both widely-spoken AND regional/minority languages that genuinely start with "${query}"
- Do NOT include programming languages, coding languages, or markup languages
- Do NOT include dialects unless they are commonly recognized as distinct languages
- Sort results: most widely spoken first, then lesser-known ones
- If zero languages start with "${query}", return []
- Return ONLY a raw JSON array of strings. No markdown, no backticks, no explanation, no preamble.

Examples of correct output:
- query "hi" → ["Hindi", "Hiligaynon", "Hiri Motu", "Hittite"]
- query "fr" → ["French", "Frisian"]
- query "ta" → ["Tamil", "Tagalog", "Tatar", "Tamazight", "Tajik"]
- query "ar" → ["Arabic", "Aragonese", "Aramaic", "Armenian"]
- query "te" → ["Telugu", "Tetum", "Teso"]
- query "ma" → ["Malay", "Mandarin", "Marathi", "Macedonian", "Malagasy", "Maltese", "Maori"]

Now return the JSON array for query: "${query}"`;

  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: 200,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a linguistics expert. Your only job is to return a valid JSON array of real human language names that START WITH the user's query string. Return ONLY the JSON array — no markdown, no backticks, no explanation, no extra text before or after.`,
          },
          { role: "user", content: prompt },
        ],
      });

      let text = response.choices[0]?.message?.content ?? "";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("Not an array");

      const results = [...new Set(parsed.filter((s) => typeof s === "string"))] as string[];

      // Client-side safety filter: ensure all results actually start with the query
      return results.filter((lang) =>
        lang.toLowerCase().startsWith(query.toLowerCase())
      );
    } catch (error: any) {
      lastError = error;
      if (error?.status === 429) continue;
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted for language search");
  return [];
}