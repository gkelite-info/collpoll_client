import { supabase } from "@/lib/supabaseClient";

export type FinanceMeetingRow = {
  financeMeetingId: number;
  title: string;
  description: string;
  role: string;
  date: string;
  fromTime: string;
  toTime: string;
  meetingLink: string;
  inAppNotification: boolean;
  emailNotification: boolean;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const STAFF_MEETING_ROLES = [
  "Admin",
  "CollegeAdmin",
  "Finance",
  "CollegeHr",
  "PlacementOfficer",
  "WellbeingManager",
  "WellbeingExecutive",
];
const STAFF_ROLE_META_REGEX = /\s*\[\[staffRole:([A-Za-z]+)\]\]\s*$/;

const parseStaffRoleMetadata = (value: string | null | undefined) => {
  const description = value ?? "";
  const match = description.match(STAFF_ROLE_META_REGEX);
  return {
    description: description.replace(STAFF_ROLE_META_REGEX, "").trim(),
    staffRole: match?.[1] ?? null,
  };
};

// export async function fetchFinanceMeetings(params: {
//   createdBy: number;
//   role?: string;
//   type?: "upcoming" | "previous";
//   page?: number;
//   limit?: number;
//   currentDate: string;
//   currentTime: string;
// }) {
//   const {
//     createdBy,
//     role = "Parent",
//     type = "upcoming",
//     page = 1,
//     limit = 10,
//     currentDate,
//     currentTime,
//   } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;
//   const isSectionedRole =
//     role === "Parent" || role === "Student" || role === "Faculty";
//   if (isSectionedRole) {
//     let query = supabase
//       .from("finance_meetings_sections")
//       .select(
//         `
//                 financeMeetingSectionsId,
//                 college_education ( collegeEducationType ),
//                 college_branch ( collegeBranchCode, collegeBranchType ),
//                 college_academic_year ( collegeAcademicYear ),
//                 college_sections ( collegeSectionsId, collegeSections ),
//                 finance_meetings!inner (
//                     financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt, createdBy
//                 )
//             `,
//         { count: "exact" },
//       )
//       .eq("finance_meetings.createdBy", createdBy)
//       .eq("finance_meetings.isActive", true)
//       .is("finance_meetings.deletedAt", null)
//       .is("deletedAt", null)
//       .eq("finance_meetings.role", role);

//     if (type === "upcoming") {
//       query = query.or(
//         `date.gt.${currentDate},and(date.eq.${currentDate},toTime.gte.${currentTime})`,
//         { foreignTable: "finance_meetings" },
//       );
//     } else {
//       query = query.or(
//         `date.lt.${currentDate},and(date.eq.${currentDate},toTime.lt.${currentTime})`,
//         { foreignTable: "finance_meetings" },
//       );
//     }
//     const isAscending = type === "upcoming";
//     const { data, error, count } = await query
//       .order("date", {
//         foreignTable: "finance_meetings",
//         ascending: isAscending,
//       })
//       .order("fromTime", {
//         foreignTable: "finance_meetings",
//         ascending: isAscending,
//       })
//       .range(from, to);

//     if (error) throw error;
//     const formattedData = (data as any[]).map((row) => ({
//       id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
//       financeMeetingId: row.finance_meetings.financeMeetingId,
//       financeMeetingSectionsId: row.financeMeetingSectionsId,
//       title: row.finance_meetings.title,
//       timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
//       educationType: row.college_education?.collegeEducationType ?? "",
//       branch:
//         row.college_branch?.collegeBranchCode ??
//         row.college_branch?.collegeBranchType ??
//         "",
//       date: row.finance_meetings.date,
//       description: row.finance_meetings.description,
//       participants: 0,
//       year: row.college_academic_year?.collegeAcademicYear ?? "",
//       section: row.college_sections?.collegeSections ?? "",
//       tags: "",
//       category: role as any,
//       type: type as any,
//       meetingLink: row.finance_meetings.meetingLink ?? "",
//     }));
//     return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
//   } else {
//     let query = supabase
//       .from("finance_meetings")
//       .select("*", { count: "exact" })
//       .eq("createdBy", createdBy)
//       .eq("isActive", true)
//       .is("deletedAt", null)
//       .eq("role", role);

//     if (type === "upcoming") {
//       query = query.or(
//         `date.gt.${currentDate},and(date.eq.${currentDate},toTime.gte.${currentTime})`,
//       );
//     } else {
//       query = query.or(
//         `date.lt.${currentDate},and(date.eq.${currentDate},toTime.lt.${currentTime})`,
//       );
//     }
//     const isAscending = type === "upcoming";
//     const { data, error, count } = await query
//       .order("date", { ascending: isAscending })
//       .order("fromTime", { ascending: isAscending })
//       .range(from, to);

//     if (error) throw error;
//     const formattedData = (data as any[]).map((row) => ({
//       id: String(row.financeMeetingId),
//       financeMeetingId: row.financeMeetingId,
//       financeMeetingSectionsId: null,
//       title: row.title,
//       timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
//       educationType: "",
//       branch: "",
//       date: row.date,
//       description: row.description,
//       participants: 0,
//       year: "",
//       section: "",
//       tags: "",
//       category: role as any,
//       type: type as any,
//       meetingLink: row.meetingLink ?? "",
//     }));
//     return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
//   }
// }

// export async function fetchStudentFinanceMeetings(params: {
//   role?: string;
//   collegeBranchCode: string;
//   collegeSectionsId: number;
//   type?: "upcoming" | "previous";
//   page?: number;
//   limit?: number;
// }) {
//   const {
//     role = "Student",
//     collegeBranchCode,
//     collegeSectionsId,
//     type = "upcoming",
//     page = 1,
//     limit = 10,
//   } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const now = new Date();
//   const today = now.toISOString().split("T")[0];
//   const currentTime = now.toTimeString().split(" ")[0];

//   let query = supabase
//     .from("finance_meetings_sections")
//     .select(
//       `
//             financeMeetingSectionsId,
//             collegeAcademicYearId,
//             college_education!inner ( collegeEducationType ),
//             college_branch!inner ( collegeBranchCode ),
//             college_sections!inner ( collegeSectionsId, collegeSections ),
//             college_academic_year!inner ( collegeAcademicYear ),
//             finance_meetings!inner (
//                 financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt
//             )
//         `,
//       { count: "exact" },
//     )
//     .eq("finance_meetings.isActive", true)
//     .is("finance_meetings.deletedAt", null)
//     .is("deletedAt", null)
//     .eq("finance_meetings.role", role)
//     .eq("college_branch.collegeBranchCode", collegeBranchCode)
//     .eq("college_sections.collegeSectionsId", collegeSectionsId);

//   if (type === "upcoming") {
//     query = query.or(
//       `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   } else {
//     query = query.or(
//       `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   }

//   const { data, error, count } = await query
//     .order("date", {
//       foreignTable: "finance_meetings",
//       ascending: type === "upcoming",
//     })
//     .order("fromTime", { foreignTable: "finance_meetings", ascending: true })
//     .range(from, to);

//   if (error) throw error;
//   const formattedData = (data as any[]).map((row) => ({
//     id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
//     financeMeetingId: row.finance_meetings.financeMeetingId,
//     title: row.finance_meetings.title,
//     timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
//     educationType: row.college_education?.collegeEducationType ?? "",
//     branch: row.college_branch?.collegeBranchCode ?? "",
//     description: row.finance_meetings.description,
//     year: row.college_academic_year?.collegeAcademicYear ?? "",
//     date: row.finance_meetings.date,
//     participants: 0,
//     section: row.college_sections?.collegeSections ?? "",
//     category: role,
//     type: type,
//     meetingLink: row.finance_meetings.meetingLink ?? "",
//   }));

//   return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
// }

// export async function fetchAdminFinanceMeetings(params: {
//   role?: string;
//   type?: "upcoming" | "previous";
//   page?: number;
//   limit?: number;
// }) {
//   const { role = "Admin", type = "upcoming", page = 1, limit = 10 } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const now = new Date();
//   const today = now.toISOString().split("T")[0];
//   const currentTime = now.toTimeString().split(" ")[0];

//   let query = supabase
//     .from("finance_meetings")
//     .select(
//       `
//             financeMeetingId,
//             title,
//             description,
//             role,
//             date,
//             fromTime,
//             toTime,
//             meetingLink,
//             isActive,
//             deletedAt,
//             finance_meetings_sections (
//                 college_education ( collegeEducationType ),
//                 college_branch ( collegeBranchCode ),
//                 college_sections ( collegeSections )
//             )
//         `,
//       { count: "exact" },
//     )
//     .eq("isActive", true)
//     .is("deletedAt", null)
//     .eq("role", role);

//   if (type === "upcoming") {
//     query = query.or(
//       `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
//     );
//   } else {
//     query = query.or(
//       `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
//     );
//   }

//   const { data, error, count } = await query
//     .order("date", { ascending: type === "upcoming" })
//     .order("fromTime", { ascending: true })
//     .range(from, to);

//   if (error) {
//     console.error("Supabase Error:", error);
//     throw error;
//   }

//   const formattedData = (data as any[]).map((row) => {
//     const sectionNames =
//       row.finance_meetings_sections
//         ?.map((s: any) => s.college_sections?.collegeSections)
//         .filter(Boolean)
//         .join(", ") || "All Sections";

//     return {
//       id: row.financeMeetingId.toString(),
//       financeMeetingId: row.financeMeetingId,
//       title: row.title,
//       timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
//       educationType:
//         row.finance_meetings_sections?.[0]?.college_education
//           ?.collegeEducationType ?? "N/A",
//       branch:
//         row.finance_meetings_sections?.[0]?.college_branch?.collegeBranchCode ??
//         "N/A",
//       description: row.description || "",
//       date: row.date,
//       participants: 0,
//       section: sectionNames,
//       category: role,
//       type: type,
//       meetingLink: row.meetingLink ?? "",
//     };
//   });

//   return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
// }

// export async function fetchFacultyFinanceMeetings(params: {
//   role?: string;
//   type?: "upcoming" | "previous";
//   page?: number;
//   limit?: number;
//   collegeBranchId?: number;
//   sectionIds?: number[];
//   academicYearIds?: number[];
// }) {
//   const {
//     role = "Faculty",
//     type = "upcoming",
//     page = 1,
//     limit = 10,
//     collegeBranchId,
//     sectionIds,
//     academicYearIds,
//   } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const now = new Date();
//   const today = now.toISOString().split("T")[0];
//   const currentTime = now.toTimeString().split(" ")[0];

//   let query = supabase
//     .from("finance_meetings_sections")
//     .select(
//       `
//             financeMeetingSectionsId,
//             college_education ( collegeEducationType ),
//             college_branch ( collegeBranchCode ),
//             college_sections ( collegeSections ),
//             college_academic_year ( collegeAcademicYear ),
//             finance_meetings!inner (
//                 financeMeetingId,
//                 title,
//                 description,
//                 role,
//                 date,
//                 fromTime,
//                 toTime,
//                 meetingLink,
//                 isActive,
//                 deletedAt
//             )
//         `,
//       { count: "exact" },
//     )
//     .eq("finance_meetings.isActive", true)
//     .is("finance_meetings.deletedAt", null)
//     .is("deletedAt", null)
//     .eq("finance_meetings.role", role);

//   if (collegeBranchId) {
//     query = query.eq("collegeBranchId", collegeBranchId);
//   }
//   if (sectionIds && sectionIds.length > 0) {
//     query = query.in("collegeSectionsId", sectionIds);
//   }
//   if (academicYearIds && academicYearIds.length > 0) {
//     query = query.in("collegeAcademicYearId", academicYearIds);
//   }

//   if (type === "upcoming") {
//     query = query.or(
//       `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   } else {
//     query = query.or(
//       `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   }

//   const { data, error, count } = await query
//     .order("date", {
//       foreignTable: "finance_meetings",
//       ascending: type === "upcoming",
//     })
//     .order("fromTime", { foreignTable: "finance_meetings", ascending: true })
//     .range(from, to);

//   if (error) throw error;

//   const formattedData = (data as any[]).map((row) => ({
//     id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
//     financeMeetingId: row.finance_meetings.financeMeetingId,
//     title: row.finance_meetings.title,
//     timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
//     educationType: row.college_education?.collegeEducationType ?? "N/A",
//     branch: row.college_branch?.collegeBranchCode ?? "N/A",
//     description: row.finance_meetings.description ?? "",
//     year: row.college_academic_year?.collegeAcademicYear ?? "",
//     date: row.finance_meetings.date,
//     participants: 0,
//     section: row.college_sections?.collegeSections ?? "N/A",
//     category: role,
//     type: type,
//     meetingLink: row.finance_meetings.meetingLink ?? "",
//   }));

//   return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
// }

// export async function fetchParentFinanceMeetings(params: {
//   roles?: string[];
//   type?: "upcoming" | "previous";
//   page?: number;
//   limit?: number;
//   collegeBranchId?: number;
//   collegeSectionsId?: number;
//   collegeAcademicYearId?: number;
// }) {
//   const {
//     roles = ["Parent"],
//     type = "upcoming",
//     page = 1,
//     limit = 10,
//     collegeBranchId,
//     collegeSectionsId,
//     collegeAcademicYearId,
//   } = params;

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const now = new Date();
//   const today = now.toISOString().split("T")[0];
//   const currentTime = now.toTimeString().split(" ")[0];

//   let query = supabase
//     .from("finance_meetings_sections")
//     .select(
//       `
//             financeMeetingSectionsId,
//             college_education ( collegeEducationType ),
//             college_branch ( collegeBranchCode ),
//             college_sections ( collegeSections ),
//             college_academic_year ( collegeAcademicYear ),
//             finance_meetings!inner (
//                 financeMeetingId,
//                 title,
//                 role,
//                 date,
//                 fromTime,
//                 description,
//                 toTime,
//                 meetingLink,
//                 isActive,
//                 deletedAt
//             )
//         `,
//       { count: "exact" },
//     )
//     .eq("finance_meetings.isActive", true)
//     .is("finance_meetings.deletedAt", null)
//     .is("deletedAt", null)
//     .in("finance_meetings.role", roles); // 🟢 FIXED: Now accepts ["Parent", "Student"]

//   if (collegeBranchId) {
//     query = query.eq("collegeBranchId", collegeBranchId);
//   }
//   if (collegeSectionsId) {
//     query = query.eq("collegeSectionsId", collegeSectionsId);
//   }
//   if (collegeAcademicYearId) {
//     query = query.eq("collegeAcademicYearId", collegeAcademicYearId);
//   }

//   if (type === "upcoming") {
//     query = query.or(
//       `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   } else {
//     query = query.or(
//       `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
//       { foreignTable: "finance_meetings" },
//     );
//   }

//   const { data, error, count } = await query
//     .order("date", {
//       foreignTable: "finance_meetings",
//       ascending: type === "upcoming",
//     })
//     .order("fromTime", { foreignTable: "finance_meetings", ascending: true })
//     .range(from, to);

//   if (error) throw error;

//   const formattedData = (data as any[]).map((row) => ({
//     id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
//     financeMeetingId: row.finance_meetings.financeMeetingId,
//     title: row.finance_meetings.title,
//     timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
//     description: row.finance_meetings.description,
//     educationType: row.college_education?.collegeEducationType ?? "N/A",
//     branch: row.college_branch?.collegeBranchCode ?? "N/A",
//     year: row.college_academic_year?.collegeAcademicYear ?? "N/A",
//     date: row.finance_meetings.date,
//     participants: 0,
//     section: row.college_sections?.collegeSections ?? "N/A",
//     category: row.finance_meetings.role, // Set category dynamically based on the actual meeting role
//     type: type,
//     meetingLink: row.finance_meetings.meetingLink ?? "",
//   }));

//   return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
// }

export async function fetchFinanceMeetings(params: {
  createdBy: number;
  role?: string;
  type?: "upcoming" | "previous";
  page?: number;
  limit?: number;
  currentDate: string;
  currentTime: string;
}) {
  const {
    createdBy,
    role = "Parent",
    type = "upcoming",
    page = 1,
    limit = 10,
    currentDate,
    currentTime,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const isStaffRole = role === "Staff";
  const roleFilters = isStaffRole ? STAFF_MEETING_ROLES : [role];
  const isSectionedRole =
    role === "Parent" || role === "Student" || role === "Faculty";

  if (isSectionedRole) {
    let query = supabase
      .from("finance_meetings")
      .select(
        `
                financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt, createdBy,
                finance_meetings_sections!inner (
                    financeMeetingSectionsId,
                    college_education ( collegeEducationType ),
                    college_branch ( collegeBranchCode, collegeBranchType ),
                    college_academic_year ( collegeAcademicYear ),
                    college_sections ( collegeSectionsId, collegeSections )
                )
            `,
        { count: "exact" },
      )
      .eq("createdBy", createdBy)
      .eq("isActive", true)
      .is("deletedAt", null)
      .eq("role", role);

    if (type === "upcoming") {
      query = query.or(
        `date.gt.${currentDate},and(date.eq.${currentDate},toTime.gte.${currentTime})`,
      );
    } else {
      query = query.or(
        `date.lt.${currentDate},and(date.eq.${currentDate},toTime.lt.${currentTime})`,
      );
    }

    // 🟢 FIXED: Ascending for Upcoming (nearest future first), Descending for Previous (most recent past first)
    const isAscending = type === "upcoming";
    const { data, error, count } = await query
      .order("date", { ascending: isAscending })
      .order("fromTime", { ascending: isAscending })
      .range(from, to);

    if (error) throw error;
    const formattedData = (data as any[]).map((row) => {
      const sectionNames =
        row.finance_meetings_sections
          ?.map((s: any) => s.college_sections?.collegeSections)
          .filter(Boolean)
          .join(", ") || "";

      return {
        id: String(row.financeMeetingId),
        financeMeetingId: row.financeMeetingId,
        financeMeetingSectionsId:
          row.finance_meetings_sections?.[0]?.financeMeetingSectionsId ?? null,
        title: row.title,
        timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
        educationType:
          row.finance_meetings_sections?.[0]?.college_education
            ?.collegeEducationType ?? "",
        branch:
          row.finance_meetings_sections?.[0]?.college_branch
            ?.collegeBranchCode ??
          row.finance_meetings_sections?.[0]?.college_branch
            ?.collegeBranchType ??
          "",
        date: row.date,
        description: parseStaffRoleMetadata(row.description).description,
        participants: 0,
        year:
          row.finance_meetings_sections?.[0]?.college_academic_year
            ?.collegeAcademicYear ?? "",
        section: sectionNames,
        tags: "",
        category: role as any,
        type: type as any,
        meetingLink: row.meetingLink ?? "",
      };
    });
    return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
  } else {
    let query = supabase
      .from("finance_meetings")
      .select("*", { count: "exact" })
      .eq("createdBy", createdBy)
      .eq("isActive", true)
      .is("deletedAt", null);

    query =
      roleFilters.length === 1
        ? query.eq("role", roleFilters[0])
        : query.in("role", roleFilters);

    if (type === "upcoming") {
      query = query.or(
        `date.gt.${currentDate},and(date.eq.${currentDate},toTime.gte.${currentTime})`,
      );
    } else {
      query = query.or(
        `date.lt.${currentDate},and(date.eq.${currentDate},toTime.lt.${currentTime})`,
      );
    }

    const isAscending = type === "upcoming";
    const { data, error, count } = await query
      .order("date", { ascending: isAscending })
      .order("fromTime", { ascending: isAscending })
      .range(from, to);

    if (error) throw error;
    const formattedData = (data as any[]).map((row) => {
      const parsedDescription = parseStaffRoleMetadata(row.description);
      return {
        id: String(row.financeMeetingId),
        financeMeetingId: row.financeMeetingId,
        financeMeetingSectionsId: null,
        title: row.title,
        timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
        educationType: "",
        branch: "",
        date: row.date,
        description: parsedDescription.description,
        participants: 0,
        year: "",
        section: "",
        tags: "",
        category: (parsedDescription.staffRole ?? row.role) as any,
        type: type as any,
        meetingLink: row.meetingLink ?? "",
      };
    });
    return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
  }
}

export async function fetchStudentFinanceMeetings(params: {
  role?: string;
  collegeBranchCode: string;
  collegeSectionsId: number;
  type?: "upcoming" | "previous";
  page?: number;
  limit?: number;
}) {
  const {
    role = "Student",
    collegeSectionsId,
    type = "upcoming",
    page = 1,
    limit = 10,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0];

  let query = supabase
    .from("finance_meetings")
    .select(
      `
            financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt,
            finance_meetings_sections!inner (
                financeMeetingSectionsId,
                college_education ( collegeEducationType ),
                college_branch ( collegeBranchCode ),
                college_sections ( collegeSectionsId, collegeSections ),
                college_academic_year ( collegeAcademicYear )
            )
        `,
      { count: "exact" },
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("role", role)
    .eq("finance_meetings_sections.collegeSectionsId", collegeSectionsId);

  if (type === "upcoming") {
    query = query.or(
      `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
    );
  } else {
    query = query.or(
      `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
    );
  }

  // 🟢 FIXED: Ascending for Upcoming (nearest future first), Descending for Previous (most recent past first)
  const isAscending = type === "upcoming";
  const { data, error, count } = await query
    .order("date", { ascending: isAscending })
    .order("fromTime", { ascending: isAscending })
    .range(from, to);

  if (error) throw error;
  const formattedData = (data as any[]).map((row) => ({
    id: `${row.financeMeetingId}-${row.finance_meetings_sections[0]?.financeMeetingSectionsId}`,
    financeMeetingId: row.financeMeetingId,
    title: row.title,
    timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
    educationType:
      row.finance_meetings_sections[0]?.college_education
        ?.collegeEducationType ?? "",
    branch:
      row.finance_meetings_sections[0]?.college_branch?.collegeBranchCode ?? "",
    description: row.description,
    year:
      row.finance_meetings_sections[0]?.college_academic_year
        ?.collegeAcademicYear ?? "",
    date: row.date,
    participants: 0,
    section:
      row.finance_meetings_sections[0]?.college_sections?.collegeSections ?? "",
    category: role,
    type: type,
    meetingLink: row.meetingLink ?? "",
  }));

  return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function fetchAdminFinanceMeetings(params: {
  role?: string;
  type?: "upcoming" | "previous";
  page?: number;
  limit?: number;
}) {
  const { role = "Admin", type = "upcoming", page = 1, limit = 10 } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0];

  let query = supabase
    .from("finance_meetings")
    .select(
      `
            financeMeetingId,
            title,
            description,
            role,
            date,
            fromTime,
            toTime,
            meetingLink,
            isActive,
            deletedAt,
            finance_meetings_sections (
                college_education ( collegeEducationType ),
                college_branch ( collegeBranchCode ),
                college_sections ( collegeSections )
            )
        `,
      { count: "exact" },
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("role", role);

  if (type === "upcoming") {
    query = query.or(
      `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
    );
  } else {
    query = query.or(
      `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
    );
  }

  // 🟢 FIXED: Ascending for Upcoming (nearest future first), Descending for Previous (most recent past first)
  const isAscending = type === "upcoming";
  const { data, error, count } = await query
    .order("date", { ascending: isAscending })
    .order("fromTime", { ascending: isAscending })
    .range(from, to);

  if (error) {
    console.error("Supabase Error:", error);
    throw error;
  }

  const formattedData = (data as any[]).map((row) => {
    const sectionNames =
      row.finance_meetings_sections
        ?.map((s: any) => s.college_sections?.collegeSections)
        .filter(Boolean)
        .join(", ") || "All Sections";

    return {
      id: row.financeMeetingId.toString(),
      financeMeetingId: row.financeMeetingId,
      title: row.title,
      timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
      educationType:
        row.finance_meetings_sections?.[0]?.college_education
          ?.collegeEducationType ?? "N/A",
      branch:
        row.finance_meetings_sections?.[0]?.college_branch?.collegeBranchCode ??
        "N/A",
      description: row.description || "",
      date: row.date,
      participants: 0,
      section: sectionNames,
      category: role,
      type: type,
      meetingLink: row.meetingLink ?? "",
    };
  });

  return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function fetchFacultyFinanceMeetings(params: {
  role?: string;
  type?: "upcoming" | "previous";
  page?: number;
  limit?: number;
  collegeBranchId?: number;
  sectionIds?: number[];
  academicYearIds?: number[];
}) {
  const {
    role = "Faculty",
    type = "upcoming",
    page = 1,
    limit = 10,
    collegeBranchId,
    sectionIds,
    academicYearIds,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0];

  let query = supabase
    .from("finance_meetings")
    .select(
      `
            financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt,
            finance_meetings_sections!inner (
                financeMeetingSectionsId,
                college_education ( collegeEducationType ),
                college_branch ( collegeBranchCode ),
                college_sections ( collegeSectionsId, collegeSections ),
                college_academic_year ( collegeAcademicYear )
            )
        `,
      { count: "exact" },
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("role", role);

  if (collegeBranchId) {
    query = query.eq(
      "finance_meetings_sections.collegeBranchId",
      collegeBranchId,
    );
  }
  if (sectionIds && sectionIds.length > 0) {
    query = query.in("finance_meetings_sections.collegeSectionsId", sectionIds);
  }
  if (academicYearIds && academicYearIds.length > 0) {
    query = query.in(
      "finance_meetings_sections.collegeAcademicYearId",
      academicYearIds,
    );
  }

  if (type === "upcoming") {
    query = query.or(
      `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
    );
  } else {
    query = query.or(
      `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
    );
  }

  // 🟢 FIXED: Ascending for Upcoming (nearest future first), Descending for Previous (most recent past first)
  const isAscending = type === "upcoming";
  const { data, error, count } = await query
    .order("date", { ascending: isAscending })
    .order("fromTime", { ascending: isAscending })
    .range(from, to);

  if (error) throw error;

  const formattedData = (data as any[]).map((row) => {
    const sectionNames =
      row.finance_meetings_sections
        ?.map((s: any) => s.college_sections?.collegeSections)
        .filter(Boolean)
        .join(", ") || "N/A";

    return {
      id: String(row.financeMeetingId),
      financeMeetingId: row.financeMeetingId,
      title: row.title,
      timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
      educationType:
        row.finance_meetings_sections?.[0]?.college_education
          ?.collegeEducationType ?? "N/A",
      branch:
        row.finance_meetings_sections?.[0]?.college_branch?.collegeBranchCode ??
        "N/A",
      description: row.description ?? "",
      year:
        row.finance_meetings_sections?.[0]?.college_academic_year
          ?.collegeAcademicYear ?? "",
      date: row.date,
      participants: 0,
      section: sectionNames,
      category: role,
      type: type,
      meetingLink: row.meetingLink ?? "",
    };
  });

  return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function fetchParentFinanceMeetings(params: {
  roles?: string[];
  type?: "upcoming" | "previous";
  page?: number;
  limit?: number;
  collegeBranchId?: number;
  collegeSectionsId?: number;
  collegeAcademicYearId?: number;
}) {
  const {
    roles = ["Parent"],
    type = "upcoming",
    page = 1,
    limit = 10,
    collegeBranchId,
    collegeSectionsId,
    collegeAcademicYearId,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0];

  let query = supabase
    .from("finance_meetings")
    .select(
      `
            financeMeetingId, title, role, date, fromTime, description, toTime, meetingLink, isActive, deletedAt,
            finance_meetings_sections!inner (
                financeMeetingSectionsId,
                college_education ( collegeEducationType ),
                college_branch ( collegeBranchCode ),
                college_sections ( collegeSectionsId, collegeSections ),
                college_academic_year ( collegeAcademicYear )
            )
        `,
      { count: "exact" },
    )
    .eq("isActive", true)
    .is("deletedAt", null)
    .in("role", roles);

  if (collegeBranchId) {
    query = query.eq(
      "finance_meetings_sections.collegeBranchId",
      collegeBranchId,
    );
  }
  if (collegeSectionsId) {
    query = query.eq(
      "finance_meetings_sections.collegeSectionsId",
      collegeSectionsId,
    );
  }
  if (collegeAcademicYearId) {
    query = query.eq(
      "finance_meetings_sections.collegeAcademicYearId",
      collegeAcademicYearId,
    );
  }

  if (type === "upcoming") {
    query = query.or(
      `date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`,
    );
  } else {
    query = query.or(
      `date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`,
    );
  }

  // 🟢 FIXED: Ascending for Upcoming (nearest future first), Descending for Previous (most recent past first)
  const isAscending = type === "upcoming";
  const { data, error, count } = await query
    .order("date", { ascending: isAscending })
    .order("fromTime", { ascending: isAscending })
    .range(from, to);

  if (error) throw error;

  const formattedData = (data as any[]).map((row) => ({
    id: `${row.financeMeetingId}-${row.finance_meetings_sections[0]?.financeMeetingSectionsId}`,
    financeMeetingId: row.financeMeetingId,
    title: row.title,
    timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
    description: row.description,
    educationType:
      row.finance_meetings_sections[0]?.college_education
        ?.collegeEducationType ?? "N/A",
    branch:
      row.finance_meetings_sections[0]?.college_branch?.collegeBranchCode ??
      "N/A",
    year:
      row.finance_meetings_sections[0]?.college_academic_year
        ?.collegeAcademicYear ?? "N/A",
    date: row.date,
    participants: 0,
    section:
      row.finance_meetings_sections[0]?.college_sections?.collegeSections ??
      "N/A",
    category: row.role,
    type: type,
    meetingLink: row.meetingLink ?? "",
  }));

  return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function fetchFinanceMeetingById(financeMeetingId: number) {
  const { data, error } = await supabase
    .from("finance_meetings")
    .select("*")
    .eq("financeMeetingId", financeMeetingId)
    .is("deletedAt", null)
    .single();

  if (error) {
    throw error;
  }

  return data as FinanceMeetingRow;
}

export async function saveFinanceMeeting(
  payload: {
    id?: number;
    title: string;
    description: string;
    role: string;
    date: string;
    fromTime: string;
    toTime: string;
    meetingLink: string;
    inAppNotification?: boolean;
    emailNotification?: boolean;
    collegeId: number;
  },
  financeManagerId: number,
  userId: number,
) {
  const now = new Date().toISOString();
  const cleanDescription = parseStaffRoleMetadata(payload.description).description;

  if (payload.id) {
    const { data: oldMeeting } = await supabase
      .from("finance_meetings")
      .select("*")
      .eq("financeMeetingId", payload.id)
      .single();

    const { data, error } = await supabase
      .from("finance_meetings")
      .update({
        title: payload.title.trim(),
        description: payload.description.trim(),
        role: payload.role,
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink.trim(),
        inAppNotification: payload.inAppNotification ?? false,
        emailNotification: payload.emailNotification ?? false,
        updatedAt: now,
      })
      .eq("financeMeetingId", payload.id)
      .select("financeMeetingId")
      .single();

    if (error) return { success: false, error };

    if (oldMeeting) {
      const { error: colError } = await supabase
        .from("college_meetings")
        .update({
          title: payload.title.trim(),
          description: cleanDescription,
          date: payload.date,
          fromTime: payload.fromTime,
          toTime: payload.toTime,
          meetingLink: payload.meetingLink.trim(),
          updatedAt: now,
        })
        .match({
          meetingLink: oldMeeting.meetingLink,
          date: oldMeeting.date,
          fromTime: oldMeeting.fromTime,
        });

      if (colError) {
        console.error("Finance college_meetings update error:", colError);
      }
    }
    return { success: true, financeMeetingId: data.financeMeetingId };
  } else {
    const { data, error } = await supabase
      .from("finance_meetings")
      .insert({
        title: payload.title.trim(),
        description: payload.description.trim(),
        role: payload.role,
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink.trim(),
        inAppNotification: payload.inAppNotification ?? false,
        emailNotification: payload.emailNotification ?? false,
        createdBy: financeManagerId,
        createdAt: now,
        updatedAt: now,
      })
      .select("financeMeetingId")
      .single();

    if (error) return { success: false, error };

    if (userId) {
      const { error: colError } = await supabase.from("college_meetings").insert({
        collegeId: payload.collegeId,
        title: payload.title.trim(),
        description: cleanDescription,
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        meetingLink: payload.meetingLink.trim(),
        createdBy: userId,
        isActive: true,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      });

      if (colError) {
        console.error("Finance college_meetings insert error:", colError);
      }
    }

    return { success: true, financeMeetingId: data.financeMeetingId };
  }
}

async function ensureFinanceCollegeMeeting(financeMeetingId: number) {
  const { data: meeting, error: meetingError } = await supabase
    .from("finance_meetings")
    .select(
      `
        financeMeetingId,
        title,
        description,
        date,
        fromTime,
        toTime,
        meetingLink,
        createdBy
      `,
    )
    .eq("financeMeetingId", financeMeetingId)
    .maybeSingle();

  if (meetingError || !meeting) {
    return { data: null, error: meetingError ?? new Error("Meeting not found") };
  }

  const { data: existing, error: existingError } = await supabase
    .from("college_meetings")
    .select("collegeMeetingId")
    .match({
      meetingLink: meeting.meetingLink,
      date: meeting.date,
      fromTime: meeting.fromTime,
    })
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError || existing) {
    return { data: existing, error: existingError };
  }

  const { data: financeManager, error: financeManagerError } = await supabase
    .from("finance_manager")
    .select("collegeId, userId")
    .eq("financeManagerId", meeting.createdBy)
    .maybeSingle();

  if (financeManagerError || !financeManager?.collegeId || !financeManager?.userId) {
    return {
      data: null,
      error:
        financeManagerError ??
        new Error("Finance manager context not found for college meeting"),
    };
  }

  const now = new Date().toISOString();
  const cleanDescription = parseStaffRoleMetadata(meeting.description).description;
  const { data: created, error: createError } = await supabase
    .from("college_meetings")
    .insert({
      collegeId: financeManager.collegeId,
      title: meeting.title,
      description: cleanDescription,
      date: meeting.date,
      fromTime: meeting.fromTime,
      toTime: meeting.toTime,
      meetingLink: meeting.meetingLink,
      createdBy: financeManager.userId,
      isActive: true,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("collegeMeetingId")
    .single();

  return { data: created, error: createError };
}

export async function deactivateFinanceMeeting(financeMeetingId: number) {
  const now = new Date().toISOString();
  const { data: fmData, error } = await supabase
    .from("finance_meetings")
    .update({ isActive: false, deletedAt: now })
    .eq("financeMeetingId", financeMeetingId)
    .select("meetingLink, date, fromTime")
    .single();

  if (error) return { success: false };

  if (fmData) {
    await supabase
      .from("college_meetings")
      .update({ isActive: false, deletedAt: now, is_deleted: true })
      .match({
        meetingLink: fmData.meetingLink,
        date: fmData.date,
        fromTime: fmData.fromTime,
      });
  }
  return { success: true };
}

export async function scheduleFinanceMeetingReminder(
  financeMeetingId: number,
  meetingDate: string,
  fromTime24: string,
  reminderMinutes: number,
) {
  const meetingDateTime = new Date(`${meetingDate}T${fromTime24}`);
  const runAt = new Date(
    meetingDateTime.getTime() - reminderMinutes * 60000,
  ).toISOString();

  const { data: fmMeeting } = await supabase
    .from("finance_meetings")
    .select("meetingLink, date, fromTime")
    .eq("financeMeetingId", financeMeetingId)
    .maybeSingle();

  if (!fmMeeting) {
    console.error(" Schedule Reminder: Finance meeting not found.");
    return { success: false };
  }

  const { data: colMeeting, error: colError } =
    await ensureFinanceCollegeMeeting(financeMeetingId);
  if (colError || !colMeeting) {
    console.error(
      " Schedule Reminder: Universal college_meetings record unavailable.",
      colError,
    );
    return { success: false };
  }

  const { error: insertError } = await supabase
    .from("meeting_remainder_jobs")
    .insert({
      collegeMeetingId: colMeeting.collegeMeetingId,
      meetingType: "Finance",
      runAt,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  if (insertError) {
    console.error("❌ meeting_remainder_jobs INSERT ERROR:", insertError);
    return { success: false, error: insertError };
  }

  return { success: true };
}
export async function checkFinanceMeetingConflict(
  financeManagerId: number,
  date: string,
  fromTime: string,
  toTime: string,
  excludeMeetingId?: number,
) {
  let query = supabase
    .from("finance_meetings")
    .select("financeMeetingId, title, role, fromTime, toTime")
    .eq("createdBy", financeManagerId)
    .eq("date", date)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (excludeMeetingId) {
    query = query.neq("financeMeetingId", excludeMeetingId);
  }

  const { data, error } = await query;

  if (error) {
    return { hasConflict: false, conflictData: null };
  }

  for (const meeting of data) {
    if (fromTime < meeting.toTime && toTime > meeting.fromTime) {
      return {
        hasConflict: true,
        conflictData: {
          title: meeting.title,
          role: meeting.role,
          fromTime: meeting.fromTime,
          toTime: meeting.toTime,
        },
      };
    }
  }

  return { hasConflict: false, conflictData: null };
}
