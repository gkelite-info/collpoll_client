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
   FETCH ANNOUNCEMENTS (STRICT SEPARATION)
===================================================== */

export async function fetchCollegeAnnouncements({
  collegeId,
  userId,
  role,
  view = "others",
  page = 1,
  limit = 10,
}: {
  collegeId: number;
  userId: number | string;
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
  const numericUserId = Number(userId);

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
      { count: "exact" },
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("is_deleted", false)
    .eq("date", today);

  if (view === "my") {
    query = query.eq("createdBy", numericUserId);
  } else {
    query = query.neq("createdBy", numericUserId);
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const normalizeRoleForMatch = (r: string) => {
    if (!r) return "";
    const clean = r.toLowerCase().replace(/[^a-z]/g, "");
    if (clean === "hr") return "collegehr";
    return clean;
  };

  const targetContextRole = normalizeRoleForMatch(role);

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

      return item.targetRoles.some(
        (r: string) =>
          normalizeRoleForMatch(r) === targetContextRole ||
          normalizeRoleForMatch(r) === "all",
      );
    });

  return {
    data: formatted,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

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
  role: string,
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
      is_deleted: false,  
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .select("collegeAnnouncementId")
    .single();

  if (error) {
    console.error("saveCollegeAnnouncement error:", error);

    return {
      success: false,
      message: "Failed to create announcement",
    };
  }

  return {
    success: true,
    collegeAnnouncementId: data.collegeAnnouncementId,
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
    targetRoles: string[]; // ✅ added
  },
) {
  // ✅ Your existing update — unchanged
  const updatePayload = {
    announcementTitle: payload.announcementTitle.trim(),
    date: payload.date,
    type: payload.type,
    updatedAt: new Date().toISOString(),
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
      error,
    };
  }

  const { data: existingRoles, error: fetchError } = await supabase
    .from("college_announcements_roles")
    .select("collegeAnnouncementRolesId, role")
    .eq("collegeAnnouncementId", collegeAnnouncementId);

  if (fetchError) {
    console.error("fetch existing roles error:", fetchError);
    return { success: false, message: "Failed to fetch existing roles" };
  }

  const existingRoleNames = existingRoles.map((r: any) => r.role);
  const incomingRoles = payload.targetRoles;

  const rolesToDelete = existingRoles.filter(
    (r: any) => !incomingRoles.includes(r.role),
  );

  const rolesToInsert = incomingRoles.filter(
    (role) => !existingRoleNames.includes(role),
  );

  if (rolesToDelete.length > 0) {
    const idsToDelete = rolesToDelete.map(
      (r: any) => r.collegeAnnouncementRolesId,
    );

    const { error: deleteError } = await supabase
      .from("college_announcements_roles")
      .delete()
      .in("collegeAnnouncementRolesId", idsToDelete);

    if (deleteError) {
      console.error("delete roles error:", deleteError);
      return { success: false, message: "Failed to remove roles" };
    }
  }

  if (rolesToInsert.length > 0) {
    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from("college_announcements_roles")
      .insert(
        rolesToInsert.map((role) => ({
          collegeAnnouncementId,
          role,
          createdAt: now,
          updatedAt: now,
        })),
      );

    if (insertError) {
      console.error("insert roles error:", insertError);
      return { success: false, message: "Failed to add new roles" };
    }
  }

  return { success: true };
}

/* =====================================================
   SOFT DELETE ANNOUNCEMENT
===================================================== */

export async function deactivateCollegeAnnouncement(
  collegeAnnouncementId: number,
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

/* =====================================================
   FETCH FULL ANNOUNCEMENT DETAILS (FOR MODAL)
===================================================== */

export async function fetchAnnouncementDetails(announcementId: number) {
  const { data, error } = await supabase
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
            college_announcements_roles ( role ),
            users!college_announcements_createdBy_fkey (
                fullName,
                user_profile ( profileUrl )
            )
        `,
    )
    .eq("collegeAnnouncementId", announcementId)
    .single();

  if (error) {
    console.error("fetchAnnouncementDetails error:", error);
    throw error;
  }

  const targetRoles =
    data.college_announcements_roles?.map((r: any) => r.role) || [];

  const userObj = Array.isArray(data.users) ? data.users[0] : data.users;
  const creatorName = userObj?.fullName || "Unknown User";

  let profileUrl = null;
  const up = userObj?.user_profile;
  if (up) {
    profileUrl = Array.isArray(up)
      ? up[0]?.profileUrl
      : (up as any)?.profileUrl;
  }

  const creatorImage =
    profileUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=e2f6ea&color=43C17A&size=128&bold=true`;

  const formattedDate = new Date(data.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    id: data.collegeAnnouncementId,
    title: data.announcementTitle,
    date: data.date,
    formattedDate,
    type: data.type,
    createdAt: data.createdAt,
    creatorName,
    creatorRole: data.createdByRole,
    creatorImage,
    targetRoles,
  };
}
