import { supabase } from "@/lib/supabaseClient";

export interface FinalizationLogData {
  logId: number;
  finalizationDate: string;
  totalStaff: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  lateCount: number;
  skippedHoliday: boolean;
  errorCount: number;
  triggeredBy: string;
  createdAt: string;
}

export const getFinalizationLogs = async (params: {
  collegeId: number;
  page: number;
  limit: number;
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
}) => {
  try {
    const { collegeId, page, limit, fromDate, toDate, searchQuery } = params;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from("staff_attendance_finalization_logs")
      .select("*", { count: "exact" })
      .eq("collegeId", collegeId)
      .eq("is_deleted", false);

    if (fromDate) {
      query = query.gte("finalizationDate", fromDate);
    }
    if (toDate) {
      query = query.lte("finalizationDate", toDate);
    }
    if (searchQuery) {
      // If there is any string searching needed (e.g. triggeredBy)
      query = query.ilike("triggeredBy", `%${searchQuery}%`);
    }

    const { data, count, error } = await query
      .order("finalizationDate", { ascending: false })
      .order("createdAt", { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      success: true,
      data: data as FinalizationLogData[],
      totalCount: count || 0,
    };
  } catch (error: any) {
    return { success: false, data: [], totalCount: 0, error: error.message };
  }
};
