"use server";

import Groq from "groq-sdk";
import { supabase } from "@/lib/supabaseClient";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
];

const JD_SYSTEM_PROMPT = `
You are an expert resume writer and ATS optimization specialist.

The user will provide:
1. Their resume data (skills, education, projects, internships)
2. A job description (JD) they are targeting

Your task is to generate exactly 5 profile summary versions that:
- Are ATS-friendly and keyword-rich using terms from the JD
- Match the student's actual experience to the job requirements
- Are 3-4 lines each, professional and concise
- Each version has a different tone/style focus

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no code fences.
- Format: { "suggestions": [ { "version": "v1", "label": "Concise & Punchy", "text": "..." }, ... ] }

The 5 versions must follow these labels in order:
v1 - Concise & Punchy (tight, impactful, minimal words — JD keywords woven in)
v2 - Detailed & Comprehensive (highlights breadth of skills matching the JD)
v3 - Achievement-Focused (emphasizes results and accomplishments relevant to JD)
v4 - Tech-Forward (emphasizes technical stack matching JD requirements)
v5 - Role-Aligned (directly mirrors the language and priorities of the JD)
`;

export async function generateJDProfileSummaryAction(
  studentId: number,
  jobDescription: string
): Promise<{ version: string; label: string; text: string }[]> {
  if (!studentId || !jobDescription?.trim()) return [];

  try {
    // Fetch student resume data to combine with JD
    const { data: personal } = await supabase
      .from("resume_personal_details")
      .select("fullName, currentCity, workStatus")
      .eq("studentId", studentId)
      .eq("is_deleted", false)
      .single();

    const { data: education } = await supabase
      .from("resume_education_details")
      .select("degree, branch, collegeName, graduationYear")
      .eq("studentId", studentId)
      .eq("is_deleted", false);

    const { data: skills } = await supabase
      .from("student_resume_skills")
      .select(`resume_skills_master ( name )`)
      .eq("studentId", studentId);

    const { data: internships } = await supabase
      .from("resume_internships")
      .select("role, companyName, domain, description")
      .eq("studentId", studentId)
      .eq("is_deleted", false);

    const { data: projects } = await supabase
      .from("resume_project_details")
      .select("projectName, domain, toolsAndTechnologies, description")
      .eq("studentId", studentId)
      .eq("isdeleted", false);

    const studentProfile = {
      name: personal?.fullName,
      workStatus: personal?.workStatus,
      education,
      skills: skills?.map((s: any) => s.resume_skills_master?.name).filter(Boolean),
      internships,
      projects,
    };

    const prompt = `
Student Resume Profile:
${JSON.stringify(studentProfile, null, 2)}

Target Job Description:
"""
${jobDescription.trim()}
"""

Generate 5 ATS-optimized profile summaries tailored to this job description using the student's actual experience. Return only valid JSON.
`;

    for (const model of GROQ_MODELS) {
      try {
        const res = await groq.chat.completions.create({
          model,
          temperature: 0.7,
          max_tokens: 1200,
          messages: [
            { role: "system", content: JD_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        });

        let raw = res.choices[0]?.message?.content ?? "";
        raw = raw.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length === 5) {
          return parsed.suggestions;
        }
      } catch (err: any) {
        if (err?.status === 429) continue;
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error("JD PROFILE SUMMARY ERROR:", error);
    return [];
  }
}