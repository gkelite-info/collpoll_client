import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const INVALID_UNIT_MESSAGE =
  "The unit name does not match the selected subject.";

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "groq/compound",
  "groq/compound-mini",
  "qwen/qwen3-32b",
];

export async function generateWithGroqFallback(prompt: string): Promise<string> {
  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: 600,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are a university syllabus topic generator for Indian engineering colleges.

YOUR JOB:
Given Education Type, Branch, Subject Name, and Unit Name:

1. Check whether the Unit Name is academically relevant to the Subject Name.
2. If the Unit Name does NOT match the Subject, return ONLY this exact JSON array:
["${INVALID_UNIT_MESSAGE}"]

3. If the Unit Name matches the Subject, return ONLY a raw JSON array of exactly 8 topic strings.

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
- Each topic must be 6–10 words
- Precise academic terminology
- Strongly relevant to BOTH subject and unit
- No vague labels like "Introduction" or "Overview"

EXAMPLE VALID OUTPUT:
["Asymptotic analysis of recursive algorithms", "Recurrence relations in divide and conquer", "Best case and worst case complexity bounds", "Amortized analysis for dynamic data structures", "Complexity classes for sorting algorithms", "Time space tradeoffs in algorithm design", "Mathematical proofs for asymptotic notation", "Growth rate comparison of common functions"]

EXAMPLE INVALID OUTPUT:
["${INVALID_UNIT_MESSAGE}"]`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim();

      if (!raw) {
        console.warn(`⚠️ [groqClient] Empty response from ${model}, trying next`);
        continue;
      }

      console.log(`🟢 [groqClient] Raw from ${model}:`, raw);

      try {
        const cleaned = raw.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          console.warn(`⚠️ [groqClient] Not an array from ${model}, trying next`);
          continue;
        }

        // allow exact invalid message
        if (
          parsed.length === 1 &&
          typeof parsed[0] === "string" &&
          parsed[0].trim() === INVALID_UNIT_MESSAGE
        ) {
          console.log(`✅ [groqClient] Subject/unit mismatch from ${model}`);
          return JSON.stringify([INVALID_UNIT_MESSAGE]);
        }

        const valid = parsed.filter(
          (t: unknown) =>
            typeof t === "string" &&
            t.trim().length > 5 &&
            t.trim() !== INVALID_UNIT_MESSAGE
        );

        if (valid.length === 0) {
          console.warn(`⚠️ [groqClient] No valid topics from ${model}, trying next`);
          continue;
        }

        console.log(`✅ [groqClient] Returning ${valid.length} topics from ${model}`);
        return JSON.stringify(valid.slice(0, 8));
      } catch (parseErr) {
        console.warn(`⚠️ [groqClient] JSON parse failed for ${model}:`, parseErr);
        continue;
      }
    } catch (error: any) {
      lastError = error;

      if (error?.status === 429 || error?.status === 503) {
        console.warn(`⚠️ [groqClient] Rate limited on ${model}, trying next`);
        continue;
      }

      throw error;
    }
  }

  console.error("❌ [groqClient] All models exhausted");
  throw lastError ?? new Error("All Groq models exhausted");
}