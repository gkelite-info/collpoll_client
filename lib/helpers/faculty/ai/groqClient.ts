import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

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
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `
You are a senior university curriculum architect specializing in detailed academic unit design.

TASK:
Generate syllabus-ready topic suggestions for a unit.

VALIDATION RULES:
- First check whether the Unit Name logically matches the given Education Type, Branch, and Subject Name.
- If the Unit Name does not match, do NOT generate topics.
- In that case, return ONLY this exact JSON array:
["The unit name does not match the selected subject."]
- Do not reinterpret the unit.
- Do not adapt an unrelated unit into the subject.

TOPIC RULES:
- If the unit is valid, generate EXACTLY 8 distinct topics.
- Each topic must be 6–10 academic words.
- Use precise academic terminology.
- Avoid generic words like "Overview" or "Introduction".
- Return ONLY a valid JSON array.
- No numbering.
- No bullet points.
- No explanations.
`
          },
          {
            role: "user",

            content: `${prompt}

IMPORTANT:
- Validate Education Type, Branch, Subject Name, and Unit Name first.
- If invalid, return ONLY:
["The unit name does not match the selected subject."]
- If valid, return EXACTLY 8 topics in a JSON array.`
          },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (text) return text;

    } catch (error: any) {
      lastError = error;
      if (error?.status === 429) {
        continue;
      }
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted");
  throw lastError ?? new Error("All Groq models exhausted");
}
