import { supabase } from "@/lib/supabaseClient";

export const upsertStudentEntry = async (payload: {
  userId: number;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  gender: "Male" | "Female" | "Other";
  collegeId: number;
  createdBy: number;
  department: string;
  degree: string;
  year: number;
  section: string;
}) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("students")
      .upsert(
        {
          userId: payload.userId,
          fullName: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
          role: payload.role,
          gender: payload.gender,
          collegeId: payload.collegeId,
          createdBy: payload.createdBy,
          department: payload.department,
          degree: payload.degree,
          year: payload.year,
          section: payload.section,
          updatedAt: now,
          createdAt: now,
        },
        {
          onConflict: "userId", 
        }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Student saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("STUDENT UPSERT ERROR:", err.message);

    let message = "Something went wrong";

    if (err.code === "23505") {
      if (err.message.includes("userId")) {
        message = "Student already exists for this user";
      } else {
        message = "Duplicate student record";
      }
    }

    return {
      success: false,
      error: message,
    };
  }
};

export const fetchStudentDetails = async (userId: number) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        studentsId,
        userId,
        fullName,
        email,
        mobile,
        role,
        gender,
        collegeId,
        department,
        degree,
        year,
        section
        `
      )
      .eq("userId", userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      student: data ?? null,
    };
  } catch (err: any) {
    console.error("FETCH STUDENT DETAILS ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};
