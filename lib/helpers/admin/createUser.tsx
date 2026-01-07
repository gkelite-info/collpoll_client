import { supabase } from "@/lib/supabaseClient";

type CreateUserPayload = {
  fullName: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "STUDENT" | "FACULTY" | "PARENT";
  collegeId: number;
  departmentId?: number;
  year?: number;
  section?: string;
};

export async function createUser(payload: CreateUserPayload) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      fullName: payload.fullName,
      email: payload.email,
      mobile: payload.mobile,
      role: payload.role,
      collegeId: payload.collegeId,
    })
    .select()
    .single();

  if (userError) throw userError;

  /* ---------------- STUDENT ---------------- */
  if (payload.role === "STUDENT") {
    const { error } = await supabase.from("student_academic_profiles").insert({
      studentId: user.userId,
      departmentId: payload.departmentId,
      year: payload.year,
      section: payload.section,
    });

    if (error) throw error;
  }

  /* ---------------- FACULTY ---------------- */
  if (payload.role === "FACULTY") {
    const { error } = await supabase.from("faculty_profiles").insert({
      facultyId: user.userId,
      departmentId: payload.departmentId,
    });

    if (error) throw error;
  }

  return user;
}
