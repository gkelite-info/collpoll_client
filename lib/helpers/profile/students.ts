import { supabase } from "@/lib/supabaseClient";

export type StudentUpsertPayload = {
  userId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  entryType: "Regular" | "Lateral" | "Transfer";
  status?: "Active" | "Inactive" | "Blocked";
  collegeId?: number;
  createdBy: number;
};

export const upsertStudentEntry = async (payload: StudentUpsertPayload) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("students")
      .upsert(
        {
          userId: payload.userId,
          collegeEducationId: payload.collegeEducationId,
          collegeBranchId: payload.collegeBranchId,
          entryType: payload.entryType,
          status: payload.status ?? "Active",
          collegeId: payload.collegeId ?? 1,
          createdBy: payload.createdBy,
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
    console.error("STUDENT UPSERT ERROR:", err);

    let message = "Something went wrong";

    if (err.code === "23505") {
      message = "Student already exists for this user";
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
      .select(`
        studentId,
        userId,
        status,
        entryType,
        isActive,
        collegeId,
        createdAt,
        updatedAt,

        users (
          userId,
          fullName,
          email,
          mobile,
          gender
        ),

        college_education (
          collegeEducationId,
          educationName
        ),

        college_branch (
          collegeBranchId,
          branchName
        )
      `)
      .eq("userId", userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      student: data,
    };
  } catch (err: any) {
    console.error("FETCH STUDENT DETAILS ERROR:", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
};
