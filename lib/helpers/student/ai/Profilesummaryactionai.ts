"use server";

import Groq from "groq-sdk";
import { supabase } from "@/lib/supabaseClient";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
];

// ─── Helper: call Groq with fallback models ───────────────────────────────────

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 800
): Promise<string> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await groq.chat.completions.create({
        model,
        temperature: 0.7,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      const text = res.choices[0]?.message?.content?.replace(/```/g, "").trim() ?? "";
      if (text && text.length > 20) return text;
    } catch (err: any) {
      if (err?.status === 429) continue;
    }
  }
  return "";
}

// ─── Fetch student data from all tables ──────────────────────────────────────

async function fetchStudentData(studentId: number) {
  const [
    { data: personal },
    { data: education },
    { data: skills },
    { data: internships },
    { data: projects },
    { data: employment },
    { data: awards },
    { data: certifications },
    { data: achievements },
  ] = await Promise.all([
    supabase
      .from("resume_personal_details")
      .select("fullName, currentCity, workStatus")
      .eq("studentId", studentId)
      .eq("is_deleted", false)
      .single(),
    supabase
      .from("resume_education_details")
      .select("educationLevel, institutionName, courseName, specialization, cgpa, percentage, startYear, endYear, yearOfPassing")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
    supabase
      .from("student_resume_skills")
      .select("resume_skills_master ( name )")
      .eq("studentId", studentId),
    supabase
      .from("resume_internships")
      .select("organizationName, role, domain, description, startDate, endDate")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
    supabase
      .from("resume_project_details")
      .select("projectName, domain, toolsAndTechnologies, description")
      .eq("studentId", studentId)
      .eq("isdeleted", false),
    supabase
      .from("resume_employment_details")
      .select("companyName, designation, experienceYears, experienceMonths")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
    supabase
      .from("resume_awards")
      .select("awardName, issuedBy, category")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
    supabase
      .from("resume_certifications")
      .select("certificationName")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
    supabase
      .from("resume_academic_achievements")
      .select("achievementName")
      .eq("studentId", studentId)
      .eq("is_deleted", false),
  ]);

  return {
    name: personal?.fullName,
    city: personal?.currentCity,
    workStatus: personal?.workStatus,
    education,
    skills: skills?.map((s: any) => s.resume_skills_master?.name).filter(Boolean),
    internships,
    projects,
    employment,
    awards,
    certifications,
    achievements,
  };
}

// ─── Generate 5 profile summaries ────────────────────────────────────────────

const SUMMARY_SYSTEM_PROMPT = `
You are an expert resume writer specializing in ATS-friendly resumes.
Generate exactly 5 distinct professional resume summaries.
Each summary must be 3-4 lines, unique in tone and focus.
Return ONLY a JSON array of 5 strings. No explanation, no markdown, no labels.
Example: ["Summary 1 text...", "Summary 2 text...", ...]
`;

export async function generateFiveProfileSummaries(
  studentId: number,
  jobDescription?: string
): Promise<string[]> {
  if (!studentId) return [];

  try {
    const studentData = await fetchStudentData(studentId);

    const prompt = `
Student Profile:
${JSON.stringify(studentData, null, 2)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\nGenerate summaries tailored to this JD.` : "Generate general professional summaries."}

Return ONLY a JSON array of exactly 5 resume summary strings.
`;

    const raw = await callGroq(SUMMARY_SYSTEM_PROMPT, prompt, 1000);

    // Parse JSON array safely
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5).map((s: string) => s.trim());
      }
    }

    // Fallback: split by newlines if JSON fails
    const lines = raw
      .split(/\n+/)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((l) => l.length > 30);

    return lines.slice(0, 5);
  } catch (error) {
    console.error("generateFiveProfileSummaries error:", error);
    return [];
  }
}

// ─── Suggest skills from JD ───────────────────────────────────────────────────

const SKILLS_SYSTEM_PROMPT = `
You are an expert technical recruiter.
Given a job description and a list of available skills, return ONLY the skill names that are relevant to the JD.
Return ONLY a JSON array of skill name strings. No explanation.
Example: ["Java", "Python", "Docker"]
`;
export async function suggestSkillsFromJDWithDemand(
  jd: string,
  availableSkills: string[]
): Promise<{
  matching: Array<{ name: string; demand: "high" | "medium" }>;
  missing: Array<{ name: string; demand: "high" | "medium" }>;
}> {
  try {
    const systemPrompt = `You are a senior technical recruiter. Analyze a candidate's skills against a JD.
Return ONLY a JSON object. No explanation. No markdown.`;

    const userPrompt = `=== JOB DESCRIPTION ===
${jd}

=== CANDIDATE'S AVAILABLE SKILLS (skill - category) ===
${availableSkills.join("\n")}

=== TASK ===
Split into two groups:

1. "matching": Skills from candidate's list relevant to this JD
   - Direct match: JD says "Git" → "Git" is matching
   - Semantic: backend JD → "Java", "Python", "Spring Boot", "Docker" are matching
   - Tools: debugging JD → "Postman", "VS Code" are matching
   - Soft skills if mentioned in JD

2. "missing": Important skills JD needs that are NOT in candidate's list at all
   - These are skill names the JD demands but aren't in available skills
   - Keep realistic (e.g. "React.js", "Node.js", "PostgreSQL")
   - Max 5 missing skills

Demand levels:
- "high": explicitly required / Must Have in JD
- "medium": good to have / implied by role

Strip "- category" from matching skill names.
Return 6-14 matching skills minimum.

Return ONLY this exact JSON:
{
  "matching": [{"name": "Python", "demand": "high"}, {"name": "Docker", "demand": "medium"}],
  "missing": [{"name": "Node.js", "demand": "high"}, {"name": "PostgreSQL", "demand": "medium"}]
}`;

    const raw = await callGroq(systemPrompt, userPrompt, 1000);
    console.log("suggestSkillsFromJDWithDemand raw:", raw);

    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        matching: Array.isArray(parsed.matching) ? parsed.matching : [],
        missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      };
    }
    return { matching: [], missing: [] };
  } catch (error) {
    console.error("suggestSkillsFromJDWithDemand error:", error);
    return { matching: [], missing: [] };
  }
}