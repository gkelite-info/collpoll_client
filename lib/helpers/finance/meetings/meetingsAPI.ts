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

export async function fetchFinanceMeetings(params: {
    createdBy: number;
    role?: string;
    type?: "upcoming" | "previous";
    page?: number;
    limit?: number;
}) {
    const {
        createdBy,
        role = "Parent",
        type = "upcoming",
        page = 1,
        limit = 10,
    } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    const isSectionedRole = role === "Parent" || role === "Student" || role === "Faculty";

    if (isSectionedRole) {
        let query = supabase
            .from("finance_meetings_sections")
            .select(`
                financeMeetingSectionsId,
                college_education ( collegeEducationType ),
                college_branch ( collegeBranchCode, collegeBranchType ),
                college_academic_year ( collegeAcademicYear ),
                college_sections ( collegeSectionsId, collegeSections ),
                finance_meetings!inner (
                    financeMeetingId, title, description, role, date, fromTime, toTime, meetingLink, isActive, deletedAt, createdBy
                )
            `, { count: "exact" })
            .eq("finance_meetings.createdBy", createdBy)
            .eq("finance_meetings.isActive", true)
            .is("finance_meetings.deletedAt", null)
            .is("deletedAt", null)
            .eq("finance_meetings.role", role);

        if (type === "upcoming") {
            query = query.or(`date.gt.${today},and(date.eq.${today},toTime.gte."${currentTime}")`, { foreignTable: "finance_meetings" });
        } else {
            query = query.or(`date.lt.${today},and(date.eq.${today},toTime.lt."${currentTime}")`, { foreignTable: "finance_meetings" });
        }


        const { data, error, count } = await query
            .order("date", { foreignTable: "finance_meetings", ascending: type === "upcoming" })
            .order("fromTime", { foreignTable: "finance_meetings", ascending: true })
            .range(from, to);

        if (error) throw error;

        const formattedData = (data as any[]).map((row) => ({
            id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
            financeMeetingId: row.finance_meetings.financeMeetingId,
            financeMeetingSectionsId: row.financeMeetingSectionsId,
            title: row.finance_meetings.title,
            timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
            educationType: row.college_education?.collegeEducationType ?? '',
            branch: row.college_branch?.collegeBranchCode ?? row.college_branch?.collegeBranchType ?? '',
            date: row.finance_meetings.date,
            participants: 0,
            year: row.college_academic_year?.collegeAcademicYear ?? '',
            section: row.college_sections?.collegeSections ?? '',
            tags: '',
            category: role as any,
            type: type as any,
            meetingLink: row.finance_meetings.meetingLink ?? '',
        }));

        return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };

    } else {
        let query = supabase
            .from("finance_meetings")
            .select("*", { count: "exact" })
            .eq("createdBy", createdBy)
            .eq("isActive", true)
            .is("deletedAt", null)
            .eq("role", role);

        if (type === "upcoming") {
            query = query.or(`date.gt.${today},and(date.eq.${today},toTime.gte."${currentTime}")`);
        } else {
            query = query.or(`date.lt.${today},and(date.eq.${today},toTime.lt."${currentTime}")`);
        }

        const { data, error, count } = await query
            .order("date", { ascending: type === "upcoming" })
            .order("fromTime", { ascending: true })
            .range(from, to);

        if (error) throw error;

        const formattedData = (data as any[]).map((row) => ({
            id: String(row.financeMeetingId),
            financeMeetingId: row.financeMeetingId,
            financeMeetingSectionsId: null,
            title: row.title,
            timeRange: `${row.fromTime.slice(0, 5)} - ${row.toTime.slice(0, 5)}`,
            educationType: '',
            branch: '',
            date: row.date,
            participants: 0,
            year: '',
            section: '',
            tags: '',
            category: role as any,
            type: type as any,
            meetingLink: row.meetingLink ?? '',
        }));

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
        collegeBranchCode,
        collegeSectionsId,
        type = "upcoming",
        page = 1,
        limit = 10,
    } = params;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    let query = supabase
        .from("finance_meetings_sections")
        .select(`
            financeMeetingSectionsId,
            college_education!inner ( collegeEducationType ),
            college_branch!inner ( collegeBranchCode ),
            college_sections!inner ( collegeSectionsId, collegeSections ),
            finance_meetings!inner (
                financeMeetingId, title, role, date, fromTime, toTime, meetingLink, isActive, deletedAt
            )
        `, { count: "exact" })
        .eq("finance_meetings.isActive", true)
        .is("finance_meetings.deletedAt", null)
        .is("deletedAt", null)
        .eq("finance_meetings.role", role)
        .eq("college_branch.collegeBranchCode", collegeBranchCode)
        .eq("college_sections.collegeSectionsId", collegeSectionsId);

    if (type === "upcoming") {
        query = query.or(`date.gt.${today},and(date.eq.${today},toTime.gte.${currentTime})`, { foreignTable: "finance_meetings" });
    } else {
        query = query.or(`date.lt.${today},and(date.eq.${today},toTime.lt.${currentTime})`, { foreignTable: "finance_meetings" });
    }

    const { data, error, count } = await query
        .order("date", { foreignTable: "finance_meetings", ascending: type === "upcoming" })
        .order("fromTime", { foreignTable: "finance_meetings", ascending: true })
        .range(from, to);

    if (error) throw error;

    const formattedData = (data as any[]).map((row) => ({
        id: `${row.finance_meetings.financeMeetingId}-${row.financeMeetingSectionsId}`,
        financeMeetingId: row.finance_meetings.financeMeetingId,
        title: row.finance_meetings.title,
        timeRange: `${row.finance_meetings.fromTime.slice(0, 5)} - ${row.finance_meetings.toTime.slice(0, 5)}`,
        educationType: row.college_education?.collegeEducationType ?? '',
        branch: row.college_branch?.collegeBranchCode ?? '',
        date: row.finance_meetings.date,
        participants: 0,
        section: row.college_sections?.collegeSections ?? '',
        category: role,
        type: type,
        meetingLink: row.finance_meetings.meetingLink ?? '',
    }));

    return { data: formattedData, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function fetchFinanceMeetingById(
    financeMeetingId: number,
) {
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
    },
    financeManagerId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("finance_meetings")
        .upsert(
            {
                financeMeetingId: payload.id,
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
                createdAt: payload.id ? undefined : now,
                updatedAt: now,
            },
            {
                onConflict: "date, fromTime, toTime, createdBy",
            },
        )
        .select("financeMeetingId")
        .single();

    if (error) {
        console.error("saveFinanceMeeting error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        financeMeetingId: data.financeMeetingId,
    };
}


export async function deactivateFinanceMeeting(
    financeMeetingId: number,
) {
    const { error } = await supabase
        .from("finance_meetings")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("financeMeetingId", financeMeetingId);

    if (error) {
        console.error("deactivateFinanceMeeting error:", error);
        return { success: false };
    }

    return { success: true };
}
