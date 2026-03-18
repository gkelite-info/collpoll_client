import { supabase } from "@/lib/supabaseClient";

export type CollegeAnnouncementRow = {
    collegeAnnouncementId: number;
    collegeId: number;
    announcementTitle: string;
    date: string;
    type: string;
    createdBy: number;
    createdByRole: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    formattedDate?: string;
    targetRoles?: string[];
};


/* =====================================================
   FETCH ANNOUNCEMENTS
===================================================== */

export async function fetchCollegeAnnouncements({
    collegeId,
    userId,
    role,
    view = "my",
    page = 1,
    limit = 10,
}: {
    collegeId: number;
    userId: number;
    role: string;
    view?: "my" | "others";
    page?: number;
    limit?: number;
}): Promise<{
    data: any[];
    totalPages: number;
}> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    /* =====================================================
       1) Auto deactivate expired announcements
       ===================================================== */
    const { error: deactivateError } = await supabase
        .from("college_announcements")
        .update({
            isActive: false,
            updatedAt: now,
        })
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("is_deleted", false)
        .lt("date", today);

    if (deactivateError) {
        console.error("auto deactivate announcements error:", deactivateError);
    }

    /* =====================================================
       2) Fetch only today's active announcements
       ===================================================== */
    let query = supabase
        .from("college_announcements")
        .select(
            `
      collegeAnnouncementId,
      announcementTitle,
      date,
      type,
      createdBy,
      createdByRole,
      createdAt,
      college_announcements_roles (
        role
      )
    `,
            { count: "exact" }
        )
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("is_deleted", false)
        .eq("date", today);

    if (view === "my") {
        query = query.eq("createdBy", userId);
    } else {
        query = query.neq("createdBy", userId);
    }

    const { data, error, count } = await query
        .order("createdAt", { ascending: false })
        .range(from, to);

    if (error) throw error;

    const formatted = (data ?? [])
        .map((item: any) => {
            const targetRoles =
                 item.college_announcements_roles?.map((r: any) => r.role) || [];

            const formattedDate = new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            return {
                id: item.collegeAnnouncementId,
                collegeAnnouncementId: item.collegeAnnouncementId,
                title: item.announcementTitle,
                date: item.date,
                formattedDate,
                type: item.type,
                createdBy: item.createdBy,
                createdByRole: item.createdByRole,
                targetRoles,
                createdAt: item.createdAt,
            };
        })
        .filter((item: any) => {
            if (view === "my") return true;
            return item.targetRoles.includes(role);
        });

    return {
        data: formatted,
        totalPages: Math.ceil((count ?? 0) / limit),
    };
}

// export async function fetchCollegeAnnouncements({
//   collegeId,
//   page = 1,
//   limit = 10,
// }: {
//   collegeId: number;
//   page?: number;
//   limit?: number;
// }) {

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const { data, error, count } = await supabase
//     .from("college_announcements")
//     .select(`
//       collegeAnnouncementId,
//       announcementTitle,
//       date,
//        type,
//       createdBy,
//       createdByRole,
//       createdAt
//     `, { count: "exact" })
//     .eq("collegeId", collegeId)
//     .eq("isActive", true)
//     .is("is_deleted", false)
//     .order("date", { ascending: false })
//     .range(from, to);

//   if (error) throw error;

//   const formatted = (data ?? []).map((item: any) => ({
//     id: item.collegeAnnouncementId,
//     collegeAnnouncementId: item.collegeAnnouncementId,
//     title: item.announcementTitle,
//     date: item.date,
//      type: item.type,
//     createdBy: item.createdBy,
//     createdByRole: item.createdByRole,
//     createdAt: item.createdAt
//   }));

//   return {
//     data: formatted,
//     totalPages: Math.ceil((count ?? 0) / limit)
//   };
// }



/* =====================================================
   SAVE ANNOUNCEMENT
===================================================== */

export async function saveCollegeAnnouncement(
    payload: {
        announcementTitle: string;
        date: string;
        type: string;
        collegeId: number;
    },
    userId: number,
    role: string
) {

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_announcements")
        .insert({
            announcementTitle: payload.announcementTitle.trim(),
            date: payload.date,
            type: payload.type,
            collegeId: payload.collegeId,
            createdBy: userId,
            createdByRole: role,
            createdAt: now,
            updatedAt: now
        })
        .select("collegeAnnouncementId")
        .single();

    if (error) {
        console.error("saveCollegeAnnouncement error:", error);

        return {
            success: false,
            message: "Failed to create announcement"
        };
    }

    return {
        success: true,
        collegeAnnouncementId: data.collegeAnnouncementId
    };
}



/* =====================================================
   UPDATE ANNOUNCEMENT
===================================================== */

export async function updateCollegeAnnouncement(
    collegeAnnouncementId: number,
    payload: {
        announcementTitle: string;
        date: string;
        type: string;
    }
) {

    const updatePayload = {
        announcementTitle: payload.announcementTitle.trim(),
        date: payload.date,
        type: payload.type,
        updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from("college_announcements")
        .update(updatePayload)
        .eq("collegeAnnouncementId", collegeAnnouncementId)
        .select();

    if (error) {
        console.error("updateCollegeAnnouncement error:", error);

        return {
            success: false,
            message: "Failed to update announcement",
            error
        };
    }

    return { success: true };
}



/* =====================================================
   SOFT DELETE ANNOUNCEMENT
===================================================== */

export async function deactivateCollegeAnnouncement(
    collegeAnnouncementId: number
) {

    const { error } = await supabase
        .from("college_announcements")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeAnnouncementId", collegeAnnouncementId);

    if (error) {
        console.error("deactivateCollegeAnnouncement error:", error);
        return { success: false };
    }

    return { success: true };
}