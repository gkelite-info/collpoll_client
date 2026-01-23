"use server";

import { generateWithGroqFallback } from "./groqClient";



export async function suggestTopicsAction(
  subject: string,
  unitName: string
): Promise<string[]> {
    console.log("🟢 suggestTopicsAction called", { subject, unitName });
  if (!subject || !unitName) return [];

   

  const prompt = `
Subject: ${subject}
Unit Name: ${unitName}

Return ONLY a JSON array of 5 topic names.
Do NOT wrap in markdown.
Do NOT include \`\`\`.
`;

  try {
    let text = await generateWithGroqFallback(prompt);

    // 🧹 cleanup (extra safety)
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("❌ Groq AI failed:", err);
    return [];
  }
}
