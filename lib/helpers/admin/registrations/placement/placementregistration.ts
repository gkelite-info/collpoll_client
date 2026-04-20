import { supabase } from "@/lib/supabaseClient";

export const upsertPlacementEmployee = async (payload: {
  placementEmployeeId?: number;
  userId: number;
  collegeId: number;
  createdBy: number;
  isActive?: boolean;
}) => {
  const now = new Date().toISOString();

  const upsertPayload: any = {
    collegeId: payload.collegeId,
    is_deleted: false,
    deletedAt: null,
    updatedAt: now,
  };

  if (!payload.placementEmployeeId) {
    upsertPayload.userId = payload.userId;
    upsertPayload.createdBy = payload.createdBy;
    upsertPayload.createdAt = now;

    const { data, error } = await supabase
      .from("placement_employee")
      .insert([upsertPayload])
      .select("placementEmployeeId")
      .single();

    if (error) {
      console.error("upsertPlacementEmployee insert error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error };
    }

    return {
      success: true,
      placementEmployeeId: data.placementEmployeeId,
    };
  }

  const { error } = await supabase
    .from("placement_employee")
    .update(upsertPayload)
    .eq("placementEmployeeId", payload.placementEmployeeId);

  if (error) {
    console.error("upsertPlacementEmployee update error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { success: false, error };
  }

  return {
    success: true,
    placementEmployeeId: payload.placementEmployeeId,
  };
};

export const deletePlacementEmployee = async (
  placementEmployeeId: number
) => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("placement_employee")
    .update({
      is_deleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .eq("placementEmployeeId", placementEmployeeId);

  if (error) {
    console.error("deletePlacementEmployee error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { success: false, error };
  }

  return { success: true };
};

export const fetchPlacementEmployeesByCollege = async (collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("placement_employee")
      .select(
        `
        placementEmployeeId,
        userId,
        collegeId,
        createdBy,
        createdAt,
        updatedAt,
        users (
          fullName,
          email,
          mobile,
          gender
        )
      `
      )
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (error) throw error;

    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("fetchPlacementEmployeesByCollege error:", err.message);
    return { success: false, error: err.message };
  }
};