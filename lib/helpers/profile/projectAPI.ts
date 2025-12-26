import { supabase } from "@/lib/supabaseClient";
import { ProjectFormInput } from "./types";

export async function insertProjectDetails(project: ProjectFormInput) {
  try {
    const { data, error } = await supabase
      .from("project_details")
      .insert([
        {
          studentId: project.studentId,
          projectName: project.projectName,
          domain: project.domain,
          startDate: project.startDate,
          endDate: project.endDate,
          projectUrl: project.projectUrl || null,
          toolsAndTechnologies: project.toolsAndTechnologies || [],
          description: project.description || null,
          isDeleted: project.isDeleted,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error inserting project:", err);
    throw err;
  }
}
