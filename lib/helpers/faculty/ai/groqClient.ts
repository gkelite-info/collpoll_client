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
        messages: [
          { role: "system", content: "You are an academic syllabus expert." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
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
