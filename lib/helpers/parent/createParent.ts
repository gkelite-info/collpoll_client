import { supabase } from "@/lib/supabaseClient";

export const upsertParentEntry = async (payload: {
  studentId: number;               
  fullName: string;
  email: string;
  mobile: string;
  role: "FATHER" | "MOTHER";
  collegeId: string;               
  collegeCode?: string | null;
  createdBy: number;              
}) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("parents")
      .upsert(
        {
          studentId: payload.studentId,
          fullName: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
          role: payload.role,
          collegeId: payload.collegeId,      
          collegeCode: payload.collegeCode ?? null,
          createdBy: payload.createdBy,
          updatedAt: now,
          createdAt: now,
        },
        {
          onConflict: "studentId", 
        }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Parent saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("PARENT UPSERT ERROR:", err.message);

    let message = "Something went wrong";

    if (err.code === "23505") {
      if (err.message.includes("studentId")) {
        message = "Parent already exists for this student";
      } else {
        message = "Duplicate parent record";
      }
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
        fullName,
        email,
        mobile,
        role,
        collegeId,
        collegeCode,
        createdBy
        `
      )
      .eq("studentId", studentId)
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
