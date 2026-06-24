import { supabase } from "@/lib/supabaseClient";

const parseTimeToMins = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3];
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

export type DayTimingPayload = {
  dayOfWeek: string;
  isOpen: boolean;
  openAt: string | null;
  lunchFrom: string | null;
  lunchTo: string | null;
  closeAt: string | null;
  breaks?: { startTime: string; endTime: string }[];
};

const err = (e: any) => {
  if (e?.message) {
    const msg = e.message.toLowerCase();
    if (msg.includes("duplicate key value violates unique constraint")) {
      return "These timings are already configured.";
    }
    if (msg.includes("violates foreign key constraint")) {
      return "Invalid college or admin reference.";
    }
    if (msg.includes("fetch") || msg.includes("network")) {
      return "Network error. Please check your connection.";
    }
    if (msg.includes("timeout")) {
      return "The request timed out. Please try again.";
    }
    if (e.code || msg.includes("postgres") || msg.includes("relation")) {
      return "Failed to save changes. Please try again later.";
    }
    return e.message;
  }
  return "An unexpected error occurred. Please try again.";
};

export const getCollegeTimings = async (collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("college_timings")
      .select(`
        *,
        college_break_timings (*)
      `)
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .order("collegeTimingId", { ascending: true });

    if (error) throw error;
    
    const dayOrder: Record<string, number> = {
      "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, 
      "Friday": 5, "Saturday": 6, "Sunday": 7
    };
    
    const formattedData = data ? data.map(item => ({
      ...item,
      dayOfWeek: item.dayOfWeek ? item.dayOfWeek.charAt(0).toUpperCase() + item.dayOfWeek.slice(1).toLowerCase() : item.dayOfWeek,
      breaks: item.college_break_timings?.filter((b: any) => !b.is_deleted).map((b: any) => ({
        startTime: b.startTime,
        endTime: b.endTime
      })).sort((a: any, b: any) => parseTimeToMins(a.startTime) - parseTimeToMins(b.startTime)) || []
    })) : [];

    const sortedData = formattedData.sort((a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]);

    return { success: true, data: sortedData };
  } catch (e) {
    return { success: false, data: [], error: err(e) };
  }
};

export const upsertCollegeTimings = async (
  collegeId: number, 
  adminId: number, 
  timings: DayTimingPayload[]
) => {
  try {
    const now = new Date().toISOString();
    
    const formattedPayload = timings.map(t => ({
      collegeId,
      dayOfWeek: t.dayOfWeek.toLowerCase(),
      isOpen: t.isOpen,
      openAt: t.isOpen ? t.openAt || null : null,
      lunchFrom: t.isOpen ? t.lunchFrom || null : null,
      lunchTo: t.isOpen ? t.lunchTo || null : null,
      closeAt: t.isOpen ? t.closeAt || null : null,
      createdBy: adminId,
      isActive: true,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }));

    // Step 1: Upsert main timings
    const { data: updatedTimings, error: timingsError } = await supabase
      .from("college_timings")
      .upsert(formattedPayload, { 
        onConflict: "collegeId,dayOfWeek",
        ignoreDuplicates: false 
      })
      .select();

    if (timingsError) throw timingsError;
    if (!updatedTimings || updatedTimings.length === 0) throw new Error("Failed to return updated timings");

    // Map dayOfWeek to the generated collegeTimingId
    const timingIdMap: Record<string, number> = {};
    updatedTimings.forEach(t => {
      timingIdMap[t.dayOfWeek.toLowerCase()] = t.collegeTimingId;
    });

    const timingIds = Object.values(timingIdMap);

    // Step 2: Fetch existing active breaks to prevent duplicates
    const { data: existingBreaks } = await supabase
      .from("college_break_timings")
      .select("breakId, collegeTimingId, startTime, endTime")
      .in("collegeTimingId", timingIds)
      .eq("is_deleted", false);

    const existingMap = new Map<string, number>();
    if (existingBreaks) {
      existingBreaks.forEach(b => {
        existingMap.set(`${b.collegeTimingId}-${b.startTime}-${b.endTime}`, b.breakId);
      });
    }

    const breaksToInsert: any[] = [];
    const breaksToKeep = new Set<number>();

    timings.forEach(day => {
      if (day.isOpen && day.breaks && day.breaks.length > 0) {
        const tId = timingIdMap[day.dayOfWeek.toLowerCase()];
        if (tId) {
          day.breaks.forEach(b => {
            if (b.startTime && b.endTime) {
              const key = `${tId}-${b.startTime}-${b.endTime}`;
              if (existingMap.has(key)) {
                breaksToKeep.add(existingMap.get(key)!);
              } else {
                breaksToInsert.push({
                  collegeTimingId: tId,
                  startTime: b.startTime,
                  endTime: b.endTime,
                  isActive: true,
                  is_deleted: false,
                  createdAt: now,
                  updatedAt: now,
                });
              }
            }
          });
        }
      }
    });

    const breaksToDelete = existingBreaks
      ?.filter(b => !breaksToKeep.has(b.breakId))
      .map(b => b.breakId) || [];

    // Step 3: Soft-delete only the breaks that were actually removed
    if (breaksToDelete.length > 0) {
      await supabase
        .from("college_break_timings")
        .update({ is_deleted: true, deletedAt: now })
        .in("breakId", breaksToDelete);
    }

    // Step 4: Insert only the truly new breaks
    if (breaksToInsert.length > 0) {
      const { error: breaksError } = await supabase
        .from("college_break_timings")
        .insert(breaksToInsert);
        
      if (breaksError) throw breaksError;
    }
    
    return { success: true, data: updatedTimings };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};
