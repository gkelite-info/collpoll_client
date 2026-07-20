import { supabase } from "@/lib/supabaseClient";

export type CalendarEventSectionRow = {
    calendarEventId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number;
    collegeSectionId: number;
    createdAt: string;
};

export async function fetchCalendarEventSections(
    calendarEventId: number
) {
    const { data, error } = await supabase
        .from("calendar_event_section")
        .select(`
      calendarEventSectionId,
      calendarEventId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionId,
      createdAt,
      section:college_sections(collegeSections)
    `)
        .eq("calendarEventId", calendarEventId)
        .eq("isActive", true);

    if (error) {
        console.error("fetchCalendarEventSections error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchAllCalendarEventSections(
    calendarEventIds: number[]
) {
    if (!calendarEventIds || calendarEventIds.length === 0) return [];
    const { data, error } = await supabase
        .from("calendar_event_section")
        .select(`
      calendarEventSectionId,
      calendarEventId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionId,
      createdAt,
      section:college_sections(collegeSections),
      branch:college_branch(collegeBranchCode, collegeBranchType),
      academic_year:college_academic_year(collegeAcademicYear)
    `)
        .in("calendarEventId", calendarEventIds)
        .eq("isActive", true);

    if (error) {
        console.error("fetchAllCalendarEventSections error:", error);
        throw error;
    }

    return data ?? [];
}


export async function saveCalendarEventSections(
    calendarEventId: number,
    payload: {
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeSemesterId: number;
        sectionIds: number[];
    }
) {
    const now = new Date().toISOString();

    const { data: existingSections, error: fetchError } = await supabase
        .from("calendar_event_section")
        .select("collegeSectionId")
        .eq("calendarEventId", calendarEventId)
        .is("deletedAt", null)
        .eq("isActive", true);

    if (fetchError) {
        console.error("fetch existing sections error:", fetchError);
        return { success: false, error: fetchError };
    }

    const existingIds = existingSections.map((s) => s.collegeSectionId);
    const targetIds = payload.sectionIds || [];

    const toDelete = existingIds.filter((id) => !targetIds.includes(id));
    const toInsert = targetIds.filter((id) => !existingIds.includes(id));

    if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from("calendar_event_section")
            .update({ 
                isActive: false, 
                deletedAt: now,
                updatedAt: now 
            })
            .eq("calendarEventId", calendarEventId)
            .in("collegeSectionId", toDelete)
            .eq("isActive", true);

        if (deleteError) {
            console.error("delete sections error:", deleteError);
            return { success: false, error: deleteError };
        }
    }

    if (toInsert.length > 0) {
        const inserts = toInsert.map((sectionId) => ({
            calendarEventId,
            collegeEducationId: payload.collegeEducationId,
            collegeBranchId: payload.collegeBranchId,
            collegeAcademicYearId: payload.collegeAcademicYearId,
            collegeSemesterId: payload.collegeSemesterId,
            collegeSectionId: sectionId,
            createdAt: now,
            updatedAt: now,
            isActive: true,
            deletedAt: null
        }));

        const { error: insertError } = await supabase
            .from("calendar_event_section")
            .insert(inserts);

        if (insertError) {
            console.error("insert sections error:", insertError);
            return { success: false, error: insertError };
        }
    }

    return { success: true };
}

export async function softDeleteCalendarEventSection(
    calendarEventId: number,
    sectionId: number
) {
    const { error } = await supabase
        .from("calendar_event_section")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("calendarEventId", calendarEventId)
        .eq("collegeSectionId", sectionId)
        .eq("isActive", true);

    if (error) {
        console.error("softDeleteCalendarEventSection error:", error);
        return { success: false };
    }

    return { success: true };
}