import Groq from "groq-sdk";

console.log("🟢 Groq helper loaded");
console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ✅ Priority order (best → fallback)
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
      console.log(`🤖 Trying Groq model: ${model}`);

      const response = await groq.chat.completions.create({
        model,
        max_tokens: 600,   // 🔥 ADD THIS
        temperature: 0.6,  // slightly increase
        messages: [
          {
            role: "system",
            content: `
You are a senior university curriculum architect specializing in detailed academic unit design.

TASK:
Generate comprehensive syllabus-ready topic titles for a single academic unit.

STRICT RULES (Non-Negotiable):
- Generate EXACTLY 12 distinct topics.
- Do NOT generate fewer than 12.
- Continue writing until all 12 are complete.
- Each topic must be 3–8 academic words.
- Use precise academic terminology.
- Avoid generic words like "Overview" or "Introduction".
- No numbering.
- No bullet points.
- No explanations.
- Return ONLY plain topic titles separated by new lines.
`
          },
          {
            role: "user",
            content: `${prompt}

IMPORTANT:
Generate exactly 12 topics. Do not stop early.`
          },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (text) return text;

    } catch (error: any) {
      lastError = error;

      // 🔁 Rate limit → switch model
      if (error?.status === 429) {
        console.warn(`⚠️ Rate limit hit for ${model}, switching...`);
        continue;
      }

      // ❌ Other errors → stop
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted");
  throw lastError ?? new Error("All Groq models exhausted");
}
