import { supabase } from "@/lib/supabaseClient";

type DepartmentItem = {
  uuid: string;
  name: string;
  code: string;
};

export const insertEducationDepartments = async (payload: {
  educationId: number;
  departments: DepartmentItem[];
}) => {
  const { educationId, departments } = payload;
  const now = new Date().toISOString();

 
  const { data: education, error: eduError } = await supabase
    .from("educations")
    .select("createdBy")
    .eq("educationId", educationId)
    .single();

  if (eduError || !education) {
    throw new Error("Education not found");
  }

  const createdBy = education.createdBy; 

  
  const { data: existingRow, error: fetchError } = await supabase
    .from("education_departments")
    .select("departments")
    .eq("educationId", educationId)
    .maybeSingle();

  if (fetchError) throw fetchError;

 
  const mergedDepartments = existingRow?.departments
    ? [...existingRow.departments, ...departments]
    : departments;

 
  const { data, error } = await supabase
    .from("education_departments")
    .upsert(
      {
        educationId,
        departments: mergedDepartments,
        createdBy,          
        updatedAt: now,
        createdAt: now,
      },
      {
        onConflict: "educationId",
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
};
