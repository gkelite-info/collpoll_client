import { supabase } from "@/lib/supabaseClient";

export const upsertParentEntry = async (payload: {
  userId: number;
  studentId: number;
  collegeId: number;
  createdBy: number;
}) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("parents")
      .upsert(
        {
          userId: payload.userId,
          studentId: payload.studentId,
          collegeId: payload.collegeId,
          createdBy: payload.createdBy,
          isActive: true,
          is_deleted: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          onConflict: "userId,collegeId,studentId",
        }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Parent linked to student successfully",
      data,
    };
  } catch (err: any) {
    console.error("PARENT UPSERT ERROR:", err);

    let message = "Something went wrong";

    if (err.code === "23505") {
      message = "Parent already linked to this student";
    }

    return {
      success: false,
      error: message,
    };
  }
};

export const fetchParentDetails = async (studentId: number) => {
  try {
    const { data, error } = await supabase
      .from("parents")
      .select(
        `
        parentId,
        studentId,
        collegeId,
        users (
          userId,
          fullName,
          email,
          mobile,
          gender
        )
        `
      )
      .eq("studentId", studentId)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;

    return {
      success: true,
      parent: data ?? null,
    };
  } catch (err: any) {
    console.error("FETCH PARENT DETAILS ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};