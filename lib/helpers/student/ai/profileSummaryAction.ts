// "use server";

// import Groq from "groq-sdk";
// import { supabase } from "@/lib/supabaseClient";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// const GROQ_MODELS = [
//   "llama-3.3-70b-versatile",
//   "llama-3.1-8b-instant",
//   "groq/compound",
//   "groq/compound-mini",
//   "qwen/qwen3-32b",
// ];

// const PROFILE_SYSTEM_PROMPT = `
// You are an expert resume writer.

// Generate a professional ATS-friendly resume summary in 3-4 lines.
// Do not give explanation.
// Return only plain text.
// `;

// export async function generateProfileSummaryAction(
//   studentId: number
// ): Promise<string> {
//   if (!studentId) return "";

//   try {
//     // ✅ DATA FETCH
//     const { data: personal } = await supabase
//       .from("resume_personal_details")
//       .select("*")
//       .eq("studentId", studentId)
//       .eq("is_deleted", false)
//       .single();

//     const { data: education } = await supabase
//       .from("resume_education_details")
//       .select("*")
//       .eq("studentId", studentId)
//       .eq("is_deleted", false);

//     const { data: skills } = await supabase
//       .from("student_resume_skills")
//       .select(`resume_skills_master ( name )`)
//       .eq("studentId", studentId);

//     const { data: internships } = await supabase
//       .from("resume_internships")
//       .select("*")
//       .eq("studentId", studentId)
//       .eq("is_deleted", false);

//     const { data: projects } = await supabase
//       .from("resume_project_details")
//       .select("*")
//       .eq("studentId", studentId)
//       .eq("isdeleted", false);

//     const cleanedData = {
//       name: personal?.fullName,
//       city: personal?.currentCity,
//       workStatus: personal?.workStatus,
//       education,
//       skills: skills?.map((s: any) => s.resume_skills_master?.name),
//       internships,
//       projects,
//     };

//     const prompt = `
// Student Data:
// ${JSON.stringify(cleanedData)}

// Generate a strong ATS-friendly resume summary.
// `;

//     // 🔥 FIXED: NO 2nd AI CALL (NO LOOPING ISSUE)
//     // 👉 Just get BEST from strongest model first

//     let finalSummary = "";

//     for (const model of GROQ_MODELS) {
//       try {
//         const res = await groq.chat.completions.create({
//           model,
//           temperature: 0.6,
//           max_tokens: 200,
//           messages: [
//             { role: "system", content: PROFILE_SYSTEM_PROMPT },
//             { role: "user", content: prompt },
//           ],
//         });

//         let text = res.choices[0]?.message?.content ?? "";
//         text = text.replace(/```/g, "").trim();

//         if (text && text.length > 20) {
//           finalSummary = text;
//           break; // ✅ STOP at first good response
//         }
//       } catch (err: any) {
//         if (err?.status === 429) continue;
//       }
//     }

//     return finalSummary || "Unable to generate profile summary.";

//   } catch (error) {
//     console.error("PROFILE SUMMARY ERROR:", error);
//     return "Error generating profile summary.";
//   }
// }

"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
];

const PROFILE_SYSTEM_PROMPT = `
You are an expert resume writer and career coach.

The user will provide their existing profile summary. Your task is to rewrite it into exactly 5 improved versions.

Rules:
- Each version must be ATS-friendly, professional, and 3-4 lines long
- Each version should have a different TONE/STYLE focus as labeled below
- Return ONLY valid JSON. No explanation, no markdown, no code fences.
- Format: { "suggestions": [ { "version": "v1", "label": "Concise & Punchy", "text": "..." }, ... ] }

The 5 versions must follow these labels in order:
v1 - Concise & Punchy (tight, impactful, minimal words)
v2 - Detailed & Comprehensive (highlights breadth of skills/experience)
v3 - Achievement-Focused (emphasizes results and accomplishments)
v4 - Tech-Forward (emphasizes technical stack and tools)
v5 - Soft Skills + Leadership (emphasizes collaboration, communication, growth mindset)
`;

export async function generateProfileSummaryAction(
  userSummary: string
): Promise<{ version: string; label: string; text: string }[]> {
  if (!userSummary?.trim()) return [];

  const prompt = `
Here is my current profile summary:
"""
${userSummary.trim()}
"""

Rewrite this into 5 improved ATS-friendly versions as instructed. Return only valid JSON.
`;

  for (const model of GROQ_MODELS) {
    try {
      const res = await groq.chat.completions.create({
        model,
        temperature: 0.75,
        max_tokens: 1200,
        messages: [
          { role: "system", content: PROFILE_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      let raw = res.choices[0]?.message?.content ?? "";
      // Strip markdown code fences if present
      raw = raw.replace(/```json|```/g, "").trim();

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length === 5) {
        return parsed.suggestions;
      }
    } catch (err: any) {
      if (err?.status === 429) continue;
      // JSON parse errors or other failures — try next model
      continue;
    }
  }

  return [];
}