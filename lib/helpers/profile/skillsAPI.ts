import { SKILL_CATEGORY_MAP } from "@/lib/constants/skillCategoryMap";
import { supabase } from "@/lib/supabaseClient";

export type SkillSection = "technical" | "soft" | "tools";

export const getUserSkills = async (studentId: number) => {
    if (!studentId) throw new Error("Student ID is required");

    const { data, error } = await supabase
        .from("user_skills")
        .select(`
      skillId,
      skill:skills (
        name,
        category:skill_categories (
          name
        )
      )
    `)
        .eq("studentId", studentId);

    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
        skillId: row.skillId,
        name: row.skill.name,
        category: row.skill.category.name,
    }));
};


export const addUserSkill = async (
    studentId: number,
    section: SkillSection,
    skillName: string
) => {
    if (!studentId) {
        throw new Error("Student ID is required");
    }

    if (!skillName?.trim()) {
        throw new Error("Skill name cannot be empty");
    }

    const categoryName = SKILL_CATEGORY_MAP[section];

    const { data: category, error: categoryError } = await supabase
        .from("skill_categories")
        .select("categoryId")
        .eq("name", categoryName)
        .single();

    if (categoryError) throw categoryError;
    if (!category) {
        throw new Error("Category not found");
    }

    let { data: skill, error: skillFetchError } = await supabase
        .from("skills")
        .select("skillId")
        .eq("name", skillName)
        .eq("categoryId", category.categoryId)
        .single();

    if (skillFetchError && skillFetchError.code !== "PGRST116") {
        throw skillFetchError;
    }

    if (!skill) {
        const { data: created, error: createError } = await supabase
            .from("skills")
            .insert({
                name: skillName,
                categoryId: category.categoryId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .select()
            .single();

        if (createError) throw createError;
        if (!created) {
            throw new Error("Skill creation failed");
        }

        skill = created;
    }

    if (!skill) {
        throw new Error("Skill resolution failed");
    }

    const { error: linkError } = await supabase
        .from("user_skills")
        .insert({
            studentId,
            skillId: skill.skillId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

    if (linkError) throw linkError;


    if (linkError) throw linkError;
};

export const removeUserSkill = async (
    studentId: number,
    skillId: number
) => {
    if (!studentId) {
        throw new Error("Student ID is required");
    }

    if (!skillId) {
        throw new Error("Skill ID is required");
    }

    const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("studentId", studentId)
        .eq("skillId", skillId);

    if (error) throw error;
};
