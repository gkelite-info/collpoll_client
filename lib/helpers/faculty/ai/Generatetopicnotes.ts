import { generateRawWithGroqFallback } from "./groqClient";


export type TopicNotesSection = {
  heading: string;
  content: string;
  bulletPoints?: string[];
  codeExample?: {
    label: string;
    code: string;
  };
};

export type ComplexityRow = {
  algorithm: string;
  best: string;
  average: string;
  worst: string;
  space: string;
};

export type TopicNotes = {
  topicTitle: string;
  subject: string;
  unit: string;
  branch: string;
  educationType: string;
  introduction: string;
  explanation: string;
  sections: TopicNotesSection[];
  keyPoints: string[];
  advantages: string[];
  applications: string[];
  summary: string;
  keyTerms: { term: string; definition: string }[];
  complexityTable?: ComplexityRow[];
  realWorldExample?: string;
};

export async function generateTopicNotes(params: {
  topicTitle: string;
  subjectName: string;
  unitName: string;
  branch: string;
  educationType: string;
}): Promise<TopicNotes> {
  const { topicTitle, subjectName, unitName, branch, educationType } = params;

  const prompt = `
Generate comprehensive, detailed academic notes for a university student on this topic:

Education Type: ${educationType}
Branch: ${branch}
Subject: ${subjectName}
Unit: ${unitName}
Topic: ${topicTitle}

Return ONLY a valid JSON object with this EXACT structure. No markdown, no code fences, no extra text:

{
  "topicTitle": "exact topic title",
  "subject": "${subjectName}",
  "unit": "${unitName}",
  "branch": "${branch}",
  "educationType": "${educationType}",
  "introduction": "Clear 3-4 sentence introduction defining the topic and its importance.",
  "explanation": "Deep 4-6 sentence explanation covering how/why this works, with real-world context and examples. Mention how it connects to broader concepts in ${subjectName}.",
  "sections": [
    {
      "heading": "Core Concepts",
      "content": "4-6 sentence paragraph explaining foundational ideas.",
      "bulletPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"]
    },
    {
      "heading": "How It Works",
      "content": "4-6 sentence paragraph explaining the mechanism step by step.",
      "codeExample": {
        "label": "Example: brief label",
        "code": "Plain ASCII pseudocode or sample output (no unicode box characters)"
      }
    },
    {
      "heading": "Types / Variations",
      "content": "3-5 sentence paragraph introducing the main types or variants.",
      "bulletPoints": ["Type 1: brief description", "Type 2: brief description", "Type 3: brief description", "Type 4: brief description"]
    },
    {
      "heading": "Advantages and Limitations",
      "content": "3-4 sentence balanced analysis.",
      "bulletPoints": ["Advantage 1", "Advantage 2", "Limitation 1", "Limitation 2"]
    }
  ],
  "complexityTable": [
    { "algorithm": "Algorithm Name", "best": "O(...)", "average": "O(...)", "worst": "O(...)", "space": "O(...)" }
  ],
  "keyPoints": ["Takeaway 1","Takeaway 2","Takeaway 3","Takeaway 4","Takeaway 5"],
  "advantages": ["Advantage 1","Advantage 2","Advantage 3","Advantage 4"],
  "applications": ["Application 1","Application 2","Application 3","Application 4","Application 5"],
  "realWorldExample": "One concrete 2-3 sentence real-world scenario illustrating this topic.",
  "summary": "Concise 3-4 sentence summary covering importance and future relevance.",
  "keyTerms": [
    { "term": "Term 1", "definition": "1-2 sentence definition." },
    { "term": "Term 2", "definition": "1-2 sentence definition." },
    { "term": "Term 3", "definition": "1-2 sentence definition." },
    { "term": "Term 4", "definition": "1-2 sentence definition." },
    { "term": "Term 5", "definition": "1-2 sentence definition." },
    { "term": "Term 6", "definition": "1-2 sentence definition." }
  ]
}

RULES:
- Include complexityTable with real values if topic involves algorithms, else set to [].
- codeExample code must be plain ASCII only.
- All content must be precise and appropriate for ${educationType} level.
- Return PURE JSON ONLY. No markdown. No backticks.
`;

  const raw = await generateRawWithGroqFallback({
    prompt,
    maxTokens: 2200,
    temperature: 0.2,
    systemPrompt: `You are an academic content writer for Indian college students.

Return only one valid JSON object that exactly matches the user's requested schema.

STRICT RULES:
- No markdown
- No backticks
- No explanations outside JSON
- No truncation
- Keep code examples plain ASCII only
- Keep content educational, structured, and topic-specific`,
  });
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned) as TopicNotes;
}
