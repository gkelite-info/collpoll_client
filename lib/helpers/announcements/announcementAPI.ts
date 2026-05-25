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

type AnnouncementRoleRelation = {
  role: string;
};

type CollegeAnnouncementListRow = {
  collegeAnnouncementId: number;
  announcementTitle: string;
  date: string;
  type: string;
  createdBy: number;
  createdByRole: string;
  createdAt: string;
  college_announcements_roles?: AnnouncementRoleRelation[] | null;
};

type FormattedCollegeAnnouncement = {
  id: number;
  collegeAnnouncementId: number;
  title: string;
  date: string;
  formattedDate: string;
  type: string;
  createdBy: number;
  createdByRole: string;
  targetRoles: string[];
  createdAt: string;
};

type ExistingAnnouncementRole = {
  collegeAnnouncementRolesId: number;
  role: string;
};

type AnnouncementCreatorProfile = {
  profileUrl?: string | null;
};

type AnnouncementCreatorUser = {
  fullName?: string | null;
  user_profile?: AnnouncementCreatorProfile | AnnouncementCreatorProfile[] | null;
};

type AnnouncementDetailsRow = {
  collegeAnnouncementId: number;
  announcementTitle: string;
  date: string;
  type: string;
  createdByRole: string;
  createdAt: string;
  college_announcements_roles?: AnnouncementRoleRelation[] | null;
  users?: AnnouncementCreatorUser | AnnouncementCreatorUser[] | null;
};

const normalizeAnnouncementCreatorRole = (role: string) => {
  return role;
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
  data: FormattedCollegeAnnouncement[];
  totalPages: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();
  const numericUserId = Number(userId);

  await supabase
    .from("college_announcements")
    .update({
      isActive: false,
      updatedAt: now,
    })
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("is_deleted", false)
    .lt("date", today);

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

  const rows = (data ?? []) as CollegeAnnouncementListRow[];

  const formatted = rows
    .map((item) => {
      const targetRoles =
        item.college_announcements_roles?.map((roleRow) => roleRow.role) || [];

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
    .filter((item) => {
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
      createdByRole: normalizeAnnouncementCreatorRole(role),
      is_deleted: false,  
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .select("collegeAnnouncementId")
    .single();

  if (error) {
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

  const { error } = await supabase
    .from("college_announcements")
    .update(updatePayload)
    .eq("collegeAnnouncementId", collegeAnnouncementId)
    .select();

  if (error) {
    return {
      success: false,
      message: "Failed to update announcement",
    };
  }

  const { data: existingRoles, error: fetchError } = await supabase
    .from("college_announcements_roles")
    .select("collegeAnnouncementRolesId, role")
    .eq("collegeAnnouncementId", collegeAnnouncementId);

  if (fetchError) {
    return { success: false, message: "Failed to fetch existing roles" };
  }

  const existingRoleRows = (existingRoles ?? []) as ExistingAnnouncementRole[];
  const existingRoleNames = existingRoleRows.map((roleRow) => roleRow.role);
  const incomingRoles = payload.targetRoles;

  const rolesToDelete = existingRoleRows.filter(
    (roleRow) => !incomingRoles.includes(roleRow.role),
  );

  const rolesToInsert = incomingRoles.filter(
    (role) => !existingRoleNames.includes(role),
  );

  if (rolesToDelete.length > 0) {
    const idsToDelete = rolesToDelete.map(
      (roleRow) => roleRow.collegeAnnouncementRolesId,
    );

    const { error: deleteError } = await supabase
      .from("college_announcements_roles")
      .delete()
      .in("collegeAnnouncementRolesId", idsToDelete);

    if (deleteError) {
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
    throw error;
  }

  const detail = data as unknown as AnnouncementDetailsRow;
  const targetRoles =
    detail.college_announcements_roles?.map((roleRow) => roleRow.role) || [];

  const userObj = Array.isArray(detail.users) ? detail.users[0] : detail.users;
  const creatorName = userObj?.fullName || "Unknown User";

  let profileUrl: string | null | undefined = null;
  const up = userObj?.user_profile;
  if (up) {
    profileUrl = Array.isArray(up) ? up[0]?.profileUrl : up.profileUrl;
  }

  const creatorImage =
    profileUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=e2f6ea&color=43C17A&size=128&bold=true`;

  const formattedDate = new Date(detail.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    id: detail.collegeAnnouncementId,
    title: detail.announcementTitle,
    date: detail.date,
    formattedDate,
    type: detail.type,
    createdAt: detail.createdAt,
    creatorName,
    creatorRole: detail.createdByRole,
    creatorImage,
    targetRoles,
  };
}
