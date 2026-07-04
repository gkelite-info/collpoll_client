import { supabase } from "@/lib/supabaseClient";

export interface CronTimingRow {
  cronId: number;
  collegeId: number;
  finalizeTime: string;
  isActive: boolean;
}

export const getCollegeCronTiming = async (collegeId: number): Promise<{ success: boolean; data?: CronTimingRow; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("college_cron_timings")
      .select("*")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) {
      // If table doesn't exist yet, return a mock default for the UI to not break
      if (error.code === '42P01' || error.message?.includes('schema cache')) {
        return { success: true, data: { cronId: 0, collegeId, finalizeTime: "19:00", isActive: true } };
      }
      throw error;
    }

    // Default to 7 PM if no row exists
    if (!data) {
       return { success: true, data: { cronId: 0, collegeId, finalizeTime: "19:00", isActive: true } };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching automation timing:", err);
    return { success: false, error: err.message?.includes('schema cache') ? "Database setup for this feature is pending." : "An unexpected error occurred." };
  }
};

export const updateCollegeCronTiming = async (collegeId: number, finalizeTime: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if exists
    const { data: existing, error: fetchErr } = await supabase
      .from("college_cron_timings")
      .select("cronId")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (fetchErr) {
        if (fetchErr.code === '42P01' || fetchErr.message?.includes('schema cache')) {
             return { success: false, error: "Database setup for this feature is pending. Please contact your database administrator." };
        }
        throw fetchErr;
    }

    if (existing) {
      const { error } = await supabase
        .from("college_cron_timings")
        .update({ finalizeTime, updatedAt: new Date().toISOString() })
        .eq("collegeId", collegeId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("college_cron_timings")
        .insert({
          collegeId,
          finalizeTime,
          isActive: true,
          is_deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating automation timing:", err);
    return { success: false, error: err.message?.includes('schema cache') ? "Database setup for this feature is pending." : "An unexpected error occurred while saving." };
  }
};
