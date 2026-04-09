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

// ── Per-category system prompts ───────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
technical: `
You are a resume assistant. Suggest ONLY Technical Skills — knowledge areas and concepts — related to the user's search keyword.

EXAMPLES by search keyword:
- "Java"       → J2EE, JSP, Servlets, JVM Internals, Java Collections, Multithreading, JDBC, Design Patterns, OOP Concepts, Java Memory Management
- "Python"     → Object Oriented Programming, Functional Programming, Data Structures, Algorithm Design, Web Scraping, REST API Design, Scripting, Automation
- "database"   → Database Normalization, SQL Queries, Indexing, Transaction Management, Database Design, Query Optimization, Stored Procedures, ERD Modeling
- "networking" → TCP/IP Protocol, Network Security, Routing Algorithms, OSI Model, Subnetting, Firewall Configuration, VPN, DNS Management
- "machine learning" → Supervised Learning, Unsupervised Learning, Neural Networks, Feature Engineering, Model Evaluation, Regression Analysis, Classification
- "embedded"   → Microcontroller Programming, RTOS, Interrupt Handling, Memory Management, Low-level Programming, I2C Protocol, SPI Protocol, PWM
- "web"        → REST API Design, HTTP Protocol, Web Security, MVC Architecture, Authentication, Session Management, Web Performance, Browser Rendering

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ALL items must be REAL technical concepts/knowledge areas related to the search keyword.
- Do NOT prefix every item with the keyword (no "Java Framework", "Java Runtime", "Java Server" — these are meaningless).
- Do NOT return tool names (no Spring Boot, no MATLAB) — those belong in Tools & Frameworks.
- Do NOT return soft skills.
- Return specific, meaningful technical concepts a student would actually learn and list on a resume.
`,

  soft: `
You are a resume assistant. Suggest ONLY Soft Skills — interpersonal and professional behavioral skills.

EXAMPLES of valid soft skills: "Communication", "Team Leadership", "Problem Solving", "Time Management", "Critical Thinking", "Adaptability", "Conflict Resolution", "Active Listening", "Decision Making", "Emotional Intelligence", "Collaboration", "Presentation Skills".

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- ONLY human/behavioral skills. NOT technical topics (no Power Systems, Circuit Analysis, Java). NOT tools (no Python, MATLAB).
- If it sounds like something you'd learn in an engineering class, it is WRONG. Reject it.
`,

  tools: `
You are a resume assistant. Suggest ONLY Tools & Frameworks — actual developer tools, frameworks, and libraries. NOT raw programming language names.

Return a balanced mix:
- Frameworks: Spring Boot, Django, Flask, React, Angular, Vue.js, Next.js, Express.js, Laravel, FastAPI
- Developer Tools: VS Code, Postman, Git, GitHub, Docker, Figma, Jira, MATLAB, PSpice, AutoCAD, Simulink, IntelliJ IDEA
- Libraries: TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, Hibernate, Axios
- Platforms/Cloud: AWS, Firebase, Linux, Supabase, Azure, Vercel, Kubernetes

STRICT RULES:
- Return ONLY a valid JSON array of strings. No markdown, no backticks, no explanation.
- Each item must be 1–4 words.
- Return EXACTLY 12 items.
- Do NOT return raw programming language names like "Python", "Java", "C++", "JavaScript" — return their FRAMEWORKS and TOOLS instead.
- Do NOT return concepts (no "Machine Learning", no "Data Structures").
- Do NOT return soft skills.
- Every item must be something a developer literally installs, opens, or uses.
`,
};

// ── Search-specific system prompts ────────────────────────────────────────────

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
- Do NOT return the search keyword itself (e.g. searching "Java" → do NOT include "Java").
- Do NOT return concepts or soft skills.
`,
};

// ─────────────────────────────────────────────────────────────────────────────

export async function suggestSkillsAction(
  educationType: string,
  branch: string,
  category: "technical" | "soft" | "tools",
  extraContext?: string
): Promise<string[]> {
  if (!educationType || !branch) return [];

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

  const prompt = isSearchQuery
    ? `
${extraContext}

Education Type: ${educationType}
Branch: ${branch}
Category: ${categoryLabel}

Return ONLY a JSON array of exactly 12 items all related to the search keyword.
No markdown. No explanation. Just the JSON array.
`
    : `
Education Type: ${educationType}
Branch: ${branch}
Category: ${categoryLabel}

Return ONLY a JSON array of exactly 12 ${categoryLabel} for this student's resume.
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