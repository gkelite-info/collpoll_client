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

// ── Build education summary from student's actual education rows ──────────────

function buildEducationSummary(educationDetails: Record<string, any>[]): string {
  if (!educationDetails.length) return "No education details available.";

  return educationDetails
    .map((ed) => {
      const parts: string[] = [];
      if (ed.educationLevel)   parts.push(`Level: ${ed.educationLevel}`);
      if (ed.institutionName)  parts.push(`Institution: ${ed.institutionName}`);
      if (ed.courseName)       parts.push(`Course: ${ed.courseName}`);
      if (ed.specialization)   parts.push(`Specialization: ${ed.specialization}`);
      if (ed.researchArea)     parts.push(`Research Area: ${ed.researchArea}`);
      if (ed.cgpa)             parts.push(`CGPA: ${ed.cgpa}`);
      if (ed.percentage)       parts.push(`Percentage: ${ed.percentage}%`);
      return parts.join(", ");
    })
    .join("\n");
}

// ── Per-category system prompts ───────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  technical: `
You are a resume assistant. Suggest ONLY Technical Skills — knowledge areas and concepts.
Base your suggestions on the student's actual education background provided in the prompt.

EXAMPLES of valid technical skills by field:
- CSE/IT        → Data Structures, Algorithm Design, OOP Concepts, Operating Systems, Computer Networks, Database Management, Compiler Design, Software Engineering
- AI/ML         → Supervised Learning, Neural Networks, Feature Engineering, Model Evaluation, NLP, Computer Vision, Reinforcement Learning, Deep Learning
- ECE/EEE       → Circuit Analysis, Signals & Systems, Digital Electronics, Embedded Systems, Power Systems, Control Systems, VLSI Design, Microprocessor Architecture
- Mechanical    → Thermodynamics, Fluid Mechanics, CAD Design, Manufacturing Processes, Heat Transfer, Finite Element Analysis, Robotics, Material Science
- Civil         → Structural Analysis, Geotechnical Engineering, Surveying, Construction Management, Hydrology, Transportation Engineering, Environmental Engineering

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- Base suggestions on the student's specialization, course, and research area.
- Do NOT return tool names (no Spring Boot, no MATLAB) — those belong in Tools & Frameworks.
- Do NOT return soft skills.
`,

  soft: `
You are a resume assistant. Suggest ONLY Soft Skills — interpersonal and professional behavioral skills.
Consider the student's education level and field when suggesting appropriate soft skills.

EXAMPLES of valid soft skills: "Communication", "Team Leadership", "Problem Solving", "Time Management", 
"Critical Thinking", "Adaptability", "Conflict Resolution", "Active Listening", "Decision Making", 
"Emotional Intelligence", "Collaboration", "Presentation Skills".

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ONLY human/behavioral skills. NOT technical topics. NOT tools.
- If it sounds like something you'd learn in an engineering class, it is WRONG. Reject it.
`,

  tools: `
You are a resume assistant. Suggest ONLY Tools & Frameworks — actual software, frameworks, and libraries.
Base your suggestions on the student's specialization, course, and research area.

EXAMPLES by field:
- CSE/IT/Web    → VS Code, Git, GitHub, Docker, Postman, Jira, Linux, Firebase, Vercel, MySQL, MongoDB, Redis
- AI/ML         → TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, Jupyter Notebook, Keras, OpenCV, Hugging Face, MLflow
- ECE/Embedded  → MATLAB, Simulink, PSpice, Keil uVision, Arduino IDE, Multisim, Xilinx Vivado, AutoCAD
- Mechanical    → MATLAB, AutoCAD, SolidWorks, ANSYS, CATIA, Fusion 360, Abaqus, Creo
- Civil         → AutoCAD, STAAD Pro, SAP2000, ETABS, Revit, ArcGIS, Primavera, MATLAB

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- Do NOT return raw programming language names like "Python", "Java", "C++" — return frameworks/tools instead.
- Do NOT return concepts or soft skills.
- Every item must be something a student literally installs, opens, or uses.
`,
};

// ── Search-specific system prompts (unchanged) ────────────────────────────────

const SEARCH_SYSTEM_PROMPTS: Record<string, string> = {
  technical: `
You are a resume assistant. Suggest ONLY Technical Skills related to the user's search query.

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ALL items must be directly related to the search keyword.
- ONLY knowledge/concept skills. NOT tools, NOT soft skills.
`,

  soft: `
You are a resume assistant. Suggest ONLY Soft Skills related to the user's search query.

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ALL items must be directly related to the search keyword.
- ONLY interpersonal/behavioral skills. NOT technical topics, NOT tools.
`,

  tools: `
You are a resume assistant. Suggest ONLY Tools & Frameworks related to the user's search keyword.

EXAMPLES by search keyword:
- "Java"      → Spring Boot, Hibernate, Maven, Gradle, JUnit, IntelliJ IDEA, Tomcat, Jenkins
- "Python"    → Django, Flask, FastAPI, Pandas, NumPy, Jupyter Notebook, PyCharm, Celery
- "React"     → Next.js, Redux, Tailwind CSS, Vite, Jest, React Native, Zustand, Storybook
- "database"  → MySQL, PostgreSQL, MongoDB, Redis, Prisma, Sequelize, DBeaver, pgAdmin
- "cloud"     → AWS, Azure, Google Cloud, Docker, Kubernetes, Terraform, Firebase, Vercel
- "testing"   → Jest, Selenium, Cypress, JUnit, Mocha, Postman, Playwright, TestNG
- "devops"    → Docker, Kubernetes, Jenkins, GitHub Actions, Terraform, Ansible, Nginx

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ALL items must be real frameworks, tools, or libraries from the ecosystem of the search keyword.
- Do NOT return the search keyword itself.
- Do NOT return concepts or soft skills.
`,
};

// ── Main export ───────────────────────────────────────────────────────────────

export async function suggestSkillsAction(
  educationDetails: Record<string, any>[],   // ← changed: was (educationType, branch)
  category: "technical" | "soft" | "tools",
  extraContext?: string
): Promise<string[]> {
  if (!educationDetails.length) return [];

  const isSearchQuery = !!extraContext?.startsWith("IMPORTANT:");

  const systemPrompt = isSearchQuery
    ? SEARCH_SYSTEM_PROMPTS[category]
    : SYSTEM_PROMPTS[category];

  const categoryLabel =
    category === "technical"
      ? "Technical Skills"
      : category === "soft"
      ? "Soft Skills"
      : "Tools & Frameworks";

  const educationSummary = buildEducationSummary(educationDetails);

  const prompt = isSearchQuery
    ? `
${extraContext}

Student Education Background:
${educationSummary}

Category: ${categoryLabel}

Return ONLY a JSON array of exactly 12 items all related to the search keyword.
No markdown. No explanation. Just the JSON array.
`
    : `
Student Education Background:
${educationSummary}

Category: ${categoryLabel}

Suggest exactly 12 ${categoryLabel} that are most relevant to this student's actual education background.
Prioritize their highest education level and specialization/research area.
No markdown. No explanation. Just the JSON array.
`;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: 600,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });

      let text = response.choices[0]?.message?.content ?? "";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("Not an array");

      return [...new Set(parsed.filter((s) => typeof s === "string"))].slice(0, 12);
    } catch (error: any) {
      if (error?.status === 429) continue;
      throw error;
    }
  }

  console.error("❌ All Groq models exhausted");
  return [];
}