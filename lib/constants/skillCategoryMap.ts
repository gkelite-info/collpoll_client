export const SKILL_CATEGORY_MAP = {
  technical: "Technical Skills",
  soft: "Soft Skills",
  tools: "Tools & Frameworks",
} as const;

export type SkillSection = keyof typeof SKILL_CATEGORY_MAP;
