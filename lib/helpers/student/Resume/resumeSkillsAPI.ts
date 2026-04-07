import { supabase } from "@/lib/supabaseClient";

type Section = "technical" | "soft" | "tools";

const CATEGORY_MAP: Record<Section, string> = {
  technical: "Technical Skills",
  soft: "Soft Skills",
  tools: "Tools & Frameworks",
};

let categoryCache: Record<string, number> | null = null;

async function getCategoryId(section: Section): Promise<number> {
  const categoryName = CATEGORY_MAP[section];

  if (!categoryCache) {
    const { data, error } = await supabase
      .from("resume_skill_categories")
      .select('"resumeSkillCategoryId", name')
      .eq("is_deleted", false);

    if (error) throw error;
    categoryCache = {};
    data.forEach((c: any) => {
      categoryCache![c.name] = c.resumeSkillCategoryId;
    });
  }

  let categoryId = categoryCache[categoryName];

  if (!categoryId) {
    const { data, error } = await supabase
      .from("resume_skill_categories")
      .insert({
        name: categoryName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    categoryCache[categoryName] = data.resumeSkillCategoryId;
    categoryId = data.resumeSkillCategoryId;
  }

  if (!categoryId) throw new Error("Category not found");
  return categoryId;
}

export async function fetchStudentResumeSkills(studentId: number) {
  const { data, error } = await supabase
    .from("student_resume_skills")
    .select(`
      resumeSkillId,
      resume_skills_master (
        resumeSkillId,
        name,
        resumeSkillCategoryId,
        resume_skill_categories ( name )
      )
    `)
    .eq("studentId", studentId);

  if (error) throw error;

  return data.map((item: any) => ({
    resumeSkillId: item.resume_skills_master.resumeSkillId,
    name: item.resume_skills_master.name,
    category: item.resume_skills_master.resume_skill_categories.name,
  }));
}

export async function createStudentResumeSkill(
  studentId: number,
  section: Section,
  skillName: string
) {
  const categoryId = await getCategoryId(section);

  const { data: skill, error: skillError } = await supabase
    .from("resume_skills_master")
    .upsert(
      {
        resumeSkillCategoryId: categoryId,
        name: skillName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "resumeSkillCategoryId,name" }
    )
    .select()
    .single();

  if (skillError) throw skillError;

  const { error: linkError } = await supabase
    .from("student_resume_skills")
    .upsert(
      {
        studentId,
        resumeSkillId: skill.resumeSkillId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "studentId,resumeSkillId" }
    );

  if (linkError) throw linkError;

  return {
    resumeSkillId: skill.resumeSkillId,
    name: skill.name,
    category: CATEGORY_MAP[section],
  };
}

export async function deleteStudentResumeSkill(
  studentId: number,
  resumeSkillId: number
) {
  const { error } = await supabase
    .from("student_resume_skills")
    .delete()
    .eq("studentId", studentId)
    .eq("resumeSkillId", resumeSkillId);

  if (error) throw error;
}