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

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a resume assistant that suggests Tools & Frameworks for student projects.

Given a project name and its domain, you must infer the most relevant tools, frameworks, 
libraries, and platforms a student would realistically use to build that specific project.

Use the project name as a context clue — for example:
- "E-Commerce Website" in "Full Stack Development" → Next.js, Stripe, PostgreSQL, Prisma, Tailwind CSS, Vercel
- "Crop Disease Detector" in "Machine Learning" → PyTorch, OpenCV, FastAPI, Roboflow, NumPy, Gradio
- "Hospital Management System" in "Backend Development" → Node.js, Express, PostgreSQL, JWT, Prisma, Docker
- "Budget Tracker App" in "Mobile App Development" → Flutter, Firebase, Dart, Hive, Provider, Figma

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words (the actual tool/framework/library name).
- Return EXACTLY 12 items.
- Every item must be something a student literally installs, opens, or uses — real tools only.
- Infer the stack intelligently from both the domain AND the project name together.
- Do NOT return raw programming language names like "Python", "Java", "JavaScript" — return frameworks/tools built on top of them (e.g. FastAPI, Spring Boot, React).
- Do NOT return concepts, algorithms, techniques, or soft skills.
- Do NOT repeat the domain name itself as a tool.
`;

// ── Main export ───────────────────────────────────────────────────────────────

export async function suggestProjectToolsAction(
  projectName: string,
  domain: string
): Promise<string[]> {
  if (!projectName.trim() || !domain.trim()) return [];

  const prompt = `
Project Name: "${projectName}"
Domain: "${domain}"

Based on the project name and domain above, suggest exactly 12 tools, frameworks, libraries, 
or platforms a student would use to build this project.

Think about:
- What kind of project this is (web app, mobile app, ML model, embedded system, design, etc.)
- What the typical tech stack looks like for this domain
- What specific tools fit this particular project name

Return ONLY a JSON array of exactly 12 strings. No markdown. No explanation. Just the array.
`;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: 600,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      let text = response.choices[0]?.message?.content ?? "";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found in response");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("Response is not an array");

      return [...new Set(parsed.filter((s) => typeof s === "string"))].slice(0, 12);
    } catch (error: any) {
      if (error?.status === 429) continue;
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted for suggestProjectToolsAction");
  return [];
}