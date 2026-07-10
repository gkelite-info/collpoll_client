import { supabase } from "@/lib/supabaseClient";

export type FinanceCalendarSectionRow = {
  financeCalendarSectionId: number;
  financeCalendarId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  collegeSectionsId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type FinanceCalendarConflict = {
  sourceRole: string;
  sourceType: string;
  eventTitle: string;
  eventTopic: string;
  date: string;
  fromTime: string;
  toTime: string;
  educationType: string;
  branch: string;
  academicYear: string;
  semester: string;
  section: string;
};

type MaybeArray<T> = T | T[] | null;

type FinanceCalendarConflictQueryRow = {
  finance_calendar: MaybeArray<{
    eventTitle?: string | null;
    eventTopic?: string | null;
    date?: string | null;
    fromTime?: string | null;
    toTime?: string | null;
  }>;
  college_education: MaybeArray<{
    collegeEducationType?: string | null;
  }>;
  college_branch: MaybeArray<{
    collegeBranchCode?: string | null;
  }>;
  college_academic_year: MaybeArray<{
    collegeAcademicYear?: string | null;
  }>;
  college_semester: MaybeArray<{
    collegeSemester?: number | string | null;
  }>;
  college_sections: MaybeArray<{
    collegeSections?: string | null;
  }>;
};

type AcademicCalendarConflictQueryRow = {
  calendarEventId: number;
  type?: string | null;
  date?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  meetingTitle?: string | null;
  facultyData: MaybeArray<{
    fullName?: string | null;
    collegeId?: number | null;
  }>;
  subjectData: MaybeArray<{
    subjectName?: string | null;
  }>;
  topicData: MaybeArray<{
    topicTitle?: string | null;
  }>;
  calendar_event_section?: Array<{
    isActive?: boolean | null;
    deletedAt?: string | null;
    collegeEducationId?: number | null;
    collegeBranchId?: number | null;
    collegeAcademicYearId?: number | null;
    collegeSemesterId?: number | null;
    collegeSectionId?: number | null;
    educationData: MaybeArray<{
      collegeEducationType?: string | null;
    }>;
    branchData: MaybeArray<{
      collegeBranchCode?: string | null;
    }>;
    academicYearData: MaybeArray<{
      collegeAcademicYear?: string | null;
    }>;
    semesterData: MaybeArray<{
      collegeSemester?: number | string | null;
    }>;
    sectionData: MaybeArray<{
      collegeSections?: string | null;
    }>;
  }> | null;
};

type HrCalendarConflictQueryRow = {
  title?: string | null;
  topic?: string | null;
  eventDate?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  role?: string | null;
};

const firstRelated = <T>(value: MaybeArray<T>): T | null =>
  Array.isArray(value) ? value[0] ?? null : value;

const toTimeValue = (time: string | null | undefined) => {
  if (!time) return "";

  const trimmed = time.trim();
  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);

  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = amPmMatch[2];
    const period = amPmMatch[3].toUpperCase();

    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${minute}:00`;
  }

  const [hour = "00", minute = "00", second = "00"] = trimmed.split(":");
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
};

const timesOverlap = (
  fromTime: string,
  toTime: string,
  existingFromTime: string | null | undefined,
  existingToTime: string | null | undefined,
) => fromTime < toTimeValue(existingToTime) && toTime > toTimeValue(existingFromTime);

export async function fetchFinanceCalendarSections(financeCalendarId: number) {
  const { data, error } = await supabase
    .from("finance_calendar_sections")
    .select(
      `
      financeCalendarSectionId,
      financeCalendarId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionsId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("financeCalendarId", financeCalendarId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("financeCalendarSectionId", { ascending: true });

  if (error) {
    console.error("fetchFinanceCalendarSections error:", error);
    throw error;
  }

  return data ?? [];
}

async function checkAcademicCalendarConflicts(payload: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  sectionIds: number[];
  date: string;
  fromTime: string;
  toTime: string;
}): Promise<FinanceCalendarConflict[]> {
  const { data, error } = await supabase
    .from("calendar_event")
    .select(
      `
      calendarEventId,
      type,
      date,
      fromTime,
      toTime,
      meetingTitle,
      facultyData:faculty!inner (
        fullName,
        collegeId
      ),
      subjectData:college_subjects (
        subjectName
      ),
      topicData:college_subject_unit_topics (
        topicTitle
      ),
      calendar_event_section (
        isActive,
        deletedAt,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionId,
        educationData:college_education (
          collegeEducationType
        ),
        branchData:college_branch (
          collegeBranchCode
        ),
        academicYearData:college_academic_year (
          collegeAcademicYear
        ),
        semesterData:college_semester (
          collegeSemester
        ),
        sectionData:college_sections (
          collegeSections
        )
      )
    `,
    )
    .eq("date", payload.date)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("faculty.collegeId", payload.collegeId)
    .lt("fromTime", payload.toTime)
    .gt("toTime", payload.fromTime);

  if (error) {
    console.error("checkAcademicCalendarConflicts error:", error);
    throw error;
  }

  const conflicts: FinanceCalendarConflict[] = [];

  for (const row of (data ?? []) as AcademicCalendarConflictQueryRow[]) {
    const activeSections = (row.calendar_event_section ?? []).filter(
      (section) =>
        section.isActive === true &&
        section.deletedAt === null &&
        section.collegeEducationId === payload.collegeEducationId &&
        section.collegeBranchId === payload.collegeBranchId &&
        section.collegeAcademicYearId === payload.collegeAcademicYearId &&
        section.collegeSemesterId === payload.collegeSemesterId &&
        section.collegeSectionId !== null &&
        section.collegeSectionId !== undefined &&
        payload.sectionIds.includes(section.collegeSectionId),
    );

    for (const section of activeSections) {
      const faculty = firstRelated(row.facultyData);
      const subject = firstRelated(row.subjectData);
      const topic = firstRelated(row.topicData);
      const education = firstRelated(section.educationData);
      const branch = firstRelated(section.branchData);
      const academicYear = firstRelated(section.academicYearData);
      const semester = firstRelated(section.semesterData);
      const sectionData = firstRelated(section.sectionData);
      const type = row.type ?? "class";

      conflicts.push({
        sourceRole: "Faculty",
        sourceType: type.charAt(0).toUpperCase() + type.slice(1),
        eventTitle:
          row.meetingTitle ||
          subject?.subjectName ||
          `${type.charAt(0).toUpperCase() + type.slice(1)} Event`,
        eventTopic: topic?.topicTitle ?? faculty?.fullName ?? "-",
        date: row.date ?? payload.date,
        fromTime: row.fromTime ?? "",
        toTime: row.toTime ?? "",
        educationType: education?.collegeEducationType ?? "-",
        branch: branch?.collegeBranchCode ?? "-",
        academicYear: academicYear?.collegeAcademicYear ?? "-",
        semester: semester?.collegeSemester
          ? `Semester ${semester.collegeSemester}`
          : "-",
        section: sectionData?.collegeSections ?? "-",
      });
    }
  }

  return conflicts;
}

async function checkHrCalendarRoleConflicts(payload: {
  collegeId: number;
  date: string;
  fromTime: string;
  toTime: string;
}): Promise<FinanceCalendarConflict[]> {
  const { data, error } = await supabase
    .from("hr_calendar_events")
    .select(
      `
      title,
      topic,
      eventDate,
      fromTime,
      toTime,
      role
    `,
    )
    .eq("collegeId", payload.collegeId)
    .eq("eventDate", payload.date)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (error) {
    console.error("checkHrCalendarRoleConflicts error:", error);
    throw error;
  }

  return ((data ?? []) as HrCalendarConflictQueryRow[])
    .filter((row) =>
      timesOverlap(payload.fromTime, payload.toTime, row.fromTime, row.toTime),
    )
    .map((row) => ({
      sourceRole: row.role ?? "HR",
      sourceType: "HR Event",
      eventTitle: row.title ?? "Untitled Event",
      eventTopic: row.topic ?? "-",
      date: row.eventDate ?? payload.date,
      fromTime: toTimeValue(row.fromTime),
      toTime: toTimeValue(row.toTime),
      educationType: "All",
      branch: "All",
      academicYear: "All",
      semester: "All",
      section: "All",
    }));
}

export async function checkFinanceCalendarConflicts(payload: {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  sectionIds: number[];
  date: string;
  fromTime: string;
  toTime: string;
  ignoreFinanceCalendarId?: number;
}): Promise<FinanceCalendarConflict[]> {
  if (payload.sectionIds.length === 0) return [];

  let query = supabase
    .from("finance_calendar_sections")
    .select(
      `
      financeCalendarSectionId,
      financeCalendarId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionsId,
      finance_calendar!inner (
        financeCalendarId,
        eventTitle,
        eventTopic,
        date,
        fromTime,
        toTime,
        isActive,
        deletedAt
      ),
      college_education!inner (
        collegeId,
        collegeEducationType
      ),
      college_branch (
        collegeBranchCode
      ),
      college_academic_year (
        collegeAcademicYear
      ),
      college_semester (
        collegeSemester
      ),
      college_sections (
        collegeSections
      )
    `,
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("college_education.collegeId", payload.collegeId)
    .eq("collegeEducationId", payload.collegeEducationId)
    .eq("collegeBranchId", payload.collegeBranchId)
    .eq("collegeAcademicYearId", payload.collegeAcademicYearId);

  if (payload.collegeSemesterId !== null) {
    query = query.eq("collegeSemesterId", payload.collegeSemesterId);
  } else {
    query = query.is("collegeSemesterId", null);
  }

  query = query
    .in("collegeSectionsId", payload.sectionIds)
    .eq("finance_calendar.date", payload.date)
    .eq("finance_calendar.isActive", true)
    .is("finance_calendar.deletedAt", null)
    .lt("finance_calendar.fromTime", payload.toTime)
    .gt("finance_calendar.toTime", payload.fromTime);

  if (payload.ignoreFinanceCalendarId) {
    query = query.neq("financeCalendarId", payload.ignoreFinanceCalendarId);
  }

  const { data, error } = await query.order("fromTime", {
    ascending: true,
    referencedTable: "finance_calendar",
  });

  if (error) {
    console.error("checkFinanceCalendarConflicts error:", error);
    throw error;
  }

  const financeConflicts = ((data ?? []) as FinanceCalendarConflictQueryRow[]).map((row) => {
    const event = firstRelated(row.finance_calendar);
    const education = firstRelated(row.college_education);
    const branch = firstRelated(row.college_branch);
    const academicYear = firstRelated(row.college_academic_year);
    const semester = firstRelated(row.college_semester);
    const section = firstRelated(row.college_sections);

    return {
      sourceRole: "Finance",
      sourceType: "Finance Event",
      eventTitle: event?.eventTitle ?? "Untitled Event",
      eventTopic: event?.eventTopic ?? "-",
      date: event?.date ?? payload.date,
      fromTime: event?.fromTime ?? "",
      toTime: event?.toTime ?? "",
      educationType: education?.collegeEducationType ?? "-",
      branch: branch?.collegeBranchCode ?? "-",
      academicYear: academicYear?.collegeAcademicYear ?? "-",
      semester: semester?.collegeSemester
        ? `Semester ${semester.collegeSemester}`
        : "-",
      section: section?.collegeSections ?? "-",
    };
  });

  const [academicConflicts, hrConflicts] = await Promise.all([
    checkAcademicCalendarConflicts(payload),
    checkHrCalendarRoleConflicts(payload),
  ]);

  return [...financeConflicts, ...academicConflicts, ...hrConflicts];
}

export async function fetchExistingFinanceCalendarSection(payload: {
  financeCalendarId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  collegeSectionsId: number;
}) {
  let query = supabase
    .from("finance_calendar_sections")
    .select("financeCalendarSectionId")
    .eq("financeCalendarId", payload.financeCalendarId)
    .eq("collegeEducationId", payload.collegeEducationId)
    .eq("collegeBranchId", payload.collegeBranchId)
    .eq("collegeAcademicYearId", payload.collegeAcademicYearId);

  if (payload.collegeSemesterId !== null) {
    query = query.eq("collegeSemesterId", payload.collegeSemesterId);
  } else {
    query = query.is("collegeSemesterId", null);
  }

  const { data, error } = await query
    .eq("collegeSectionsId", payload.collegeSectionsId)
    .is("deletedAt", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    throw error;
  }

  return { success: true, data };
}

// export async function saveFinanceCalendarSection(
//   payload: {
//     financeCalendarSectionId?: number;
//     financeCalendarId: number;
//     collegeEducationId: number;
//     collegeBranchId: number;
//     collegeAcademicYearId: number;
//     collegeSemesterId: number;
//     collegeSectionsId: number;
//   },
//   createdBy: number,
// ) {
//   const now = new Date().toISOString();

//   const { data, error } = await supabase
//     .from("finance_calendar_sections")
//     .upsert(
//       {
//         financeCalendarSectionId: payload.financeCalendarSectionId,
//         financeCalendarId: payload.financeCalendarId,
//         collegeEducationId: payload.collegeEducationId,
//         collegeBranchId: payload.collegeBranchId,
//         collegeAcademicYearId: payload.collegeAcademicYearId,
//         collegeSemesterId: payload.collegeSemesterId,
//         collegeSectionsId: payload.collegeSectionsId,
//         createdBy,
//         updatedAt: now,
//       },
//       {
//         onConflict:
//           "financeCalendarId, collegeEducationId, collegeBranchId, collegeAcademicYearId, collegeSemesterId, collegeSectionsId",
//       },
//     )
//     .select("financeCalendarSectionId")
//     .single();

//   if (error) {
//     console.error("saveFinanceCalendarSection error:", error);
//     return { success: false, error };
//   }

//   return {
//     success: true,
//     financeCalendarSectionId: data.financeCalendarSectionId,
//   };
// }

export async function saveFinanceCalendarSection(
  payload: {
    financeCalendarSectionId?: number;
    financeCalendarId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number | null;
    collegeSectionsId: number;
  },
  createdBy: number,
) {
  const now = new Date().toISOString();

  if (payload.financeCalendarSectionId) {
    const { data, error } = await supabase
      .from("finance_calendar_sections")
      .update({
        financeCalendarId: payload.financeCalendarId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSemesterId: payload.collegeSemesterId,
        collegeSectionsId: payload.collegeSectionsId,
        createdBy,
        updatedAt: now,
      })
      .eq("financeCalendarSectionId", payload.financeCalendarSectionId)
      .select("financeCalendarSectionId")
      .single();

    if (error) {
      console.error("Update Section error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      financeCalendarSectionId: data.financeCalendarSectionId,
    };
  } else {
    const { data, error } = await supabase
      .from("finance_calendar_sections")
      .insert({
        financeCalendarId: payload.financeCalendarId,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSemesterId: payload.collegeSemesterId,
        collegeSectionsId: payload.collegeSectionsId,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .select("financeCalendarSectionId")
      .single();

    if (error) {
      console.error("Insert Section error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      financeCalendarSectionId: data.financeCalendarSectionId,
    };
  }
}

export async function deactivateFinanceCalendarSection(
  financeCalendarSectionId: number,
) {
  const { error } = await supabase
    .from("finance_calendar_sections")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("financeCalendarSectionId", financeCalendarSectionId);

  if (error) {
    console.error("deactivateFinanceCalendarSection error:", error);
    return { success: false };
  }

  return { success: true };
}

export async function deactivateAllFinanceCalendarSections(
  financeCalendarId: number,
) {
  const { error } = await supabase
    .from("finance_calendar_sections")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("financeCalendarId", financeCalendarId);

  if (error) {
    console.error("deactivateAllFinanceCalendarSections error:", error);
    return { success: false };
  }

  return { success: true };
}

export async function fetchFinanceCalendarSectionsWithDetails(
  financeCalendarId: number,
) {
  const { data, error } = await supabase
    .from("finance_calendar_sections")
    .select(
      `
            financeCalendarSectionId,
            college_branch ( collegeBranchCode ),
            college_academic_year ( collegeAcademicYear ),
            college_sections ( collegeSections ) 
        `,
    )
    .eq("financeCalendarId", financeCalendarId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("financeCalendarSectionId", { ascending: true });

  if (error) {
    console.error("fetchFinanceCalendarSectionsWithDetails error:", error);
    throw error;
  }

  return data ?? [];
}
