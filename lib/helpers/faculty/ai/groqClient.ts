import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const INVALID_UNIT_MESSAGE =
  "The unit name does not match the selected subject.";
const INVALID_FOCUS_MESSAGE =
  "The entered topic does not match the selected subject and unit.";

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "groq/compound",
  "groq/compound-mini",
  "qwen/qwen3-32b",
];

const TOPIC_SUGGESTION_MODEL_LIMIT = 2;
const MODEL_TIMEOUT_MS = 5000;

type RawGroqParams = {
  prompt: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
};

async function generateRawWithModel(
  model: string,
  { prompt, systemPrompt, maxTokens = 600, temperature = 0 }: RawGroqParams,
): Promise<string> {
  const response = await groq.chat.completions.create(
    {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    },
    { timeout: MODEL_TIMEOUT_MS, maxRetries: 0 },
  );

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error(`Empty response from ${model}`);
  return raw;
}

function parseTopicArray(raw: string): string[] | null {
  const withoutFences = raw.replace(/```(?:json)?|```/gi, "").trim();
  const arrayStart = withoutFences.indexOf("[");
  const arrayEnd = withoutFences.lastIndexOf("]");
  const json =
    arrayStart >= 0 && arrayEnd > arrayStart
      ? withoutFences.slice(arrayStart, arrayEnd + 1)
      : withoutFences;
  const parsed: unknown = JSON.parse(json);
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : null;
}

export async function generateRawWithGroqFallback({
  prompt,
  systemPrompt,
  maxTokens = 600,
  temperature = 0,
}: RawGroqParams): Promise<string> {
  let lastError: any = null;

  for (const model of GROQ_MODELS.slice(0, TOPIC_SUGGESTION_MODEL_LIMIT)) {
    try {
      return await generateRawWithModel(model, { prompt, systemPrompt, maxTokens, temperature });
    } catch (error: any) {
      lastError = error;
      console.warn(`[groqClient] ${model} failed (${error?.status ?? "invalid response"}), trying next`);
    }
  }

  console.error("[groqClient] All models exhausted");
  throw lastError ?? new Error("All Groq models exhausted");
}

export async function generateWithGroqFallback(prompt: string): Promise<string> {
  const systemPrompt = `You are a university syllabus topic generator for Indian engineering colleges.

YOUR JOB:
Given Education Type, Branch, Subject Name, Unit Name, and an optional Requested Topic Focus:

1. Check whether the Unit Name is academically relevant to the Subject Name.
2. If the Unit Name does NOT match the Subject, return ONLY this exact JSON array:
["${INVALID_UNIT_MESSAGE}"]

3. If the Unit Name matches the Subject, return ONLY a raw JSON array of exactly 8 topic strings.
4. If a Requested Topic Focus is provided, every suggested topic must relate to that focus as well as the Subject and Unit Name.
5. If the Requested Topic Focus is unrelated to the Subject or Unit Name, return ONLY this exact JSON array:
["${INVALID_FOCUS_MESSAGE}"]

STRICT OUTPUT RULES:
- Return ONLY valid raw JSON
- No markdown
- No backticks
- No explanation
- No notes
- No headings
- No extra text

TOPIC RULES:
- Exactly 8 topics
- Each topic must be 6-10 words
- Precise academic terminology
- Strongly relevant to BOTH subject and unit
- No vague labels like "Introduction" or "Overview"

EXAMPLE VALID OUTPUT:
["Asymptotic analysis of recursive algorithms", "Recurrence relations in divide and conquer", "Best case and worst case complexity bounds", "Amortized analysis for dynamic data structures", "Complexity classes for sorting algorithms", "Time space tradeoffs in algorithm design", "Mathematical proofs for asymptotic notation", "Growth rate comparison of common functions"]

EXAMPLE INVALID OUTPUT:
["${INVALID_UNIT_MESSAGE}"]

EXAMPLE INVALID FOCUS OUTPUT:
["${INVALID_FOCUS_MESSAGE}"]`;

  let lastError: any = null;

  for (const model of GROQ_MODELS.slice(0, TOPIC_SUGGESTION_MODEL_LIMIT)) {
    try {
      const raw = await generateRawWithModel(model, {
        prompt,
        systemPrompt,
        maxTokens: 600,
        temperature: 0,
      });

      const parsed = parseTopicArray(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.warn(`[groqClient] Not an array from ${model}, trying next`);
        continue;
      }

      if (
        parsed.length === 1 &&
        typeof parsed[0] === "string" &&
        parsed[0].trim() === INVALID_UNIT_MESSAGE
      ) {
        return JSON.stringify([INVALID_UNIT_MESSAGE]);
      }

      const valid = parsed.filter(
        (topic: unknown) =>
          typeof topic === "string" &&
          topic.trim().length > 5 &&
          topic.trim() !== INVALID_UNIT_MESSAGE,
      );

      if (valid.length === 0) {
        console.warn(`[groqClient] No valid topics from ${model}, trying next`);
        continue;
      }

      return JSON.stringify(valid.slice(0, 8));
    } catch (error: any) {
      lastError = error;

      console.warn(`[groqClient] ${model} returned an unusable response (${error?.status ?? "invalid JSON"}), trying next`);
    }
  }

  console.error("[groqClient] All models exhausted");
  throw lastError ?? new Error("All Groq models exhausted");
}
