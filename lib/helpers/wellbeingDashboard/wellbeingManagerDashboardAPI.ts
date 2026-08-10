import { supabase } from "@/lib/supabaseClient";

export type ManagerDashboardIssue = {
  id: string;
  kind: "college" | "hostel";
  student: string;
  meta: string;
  issue: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "resolved" | "rejected";
  studentImage: string;
  evidence: string;
  block?: string;
  room?: string;
};

export type ManagerDashboardData = {
  stats: { total: number; high: number; pending: number; resolved: number };
  statusBreakdown: Array<{ type: string; value: number; color: string }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
  collegeIssues: ManagerDashboardIssue[];
  hostelIssues: ManagerDashboardIssue[];
};

type IssueRow = {
  wellbeingSupportIssueId: number;
  fullName: string | null;
  issueTitle: string;
  description: string;
  categoryId: number;
  priority: string;
  IssueStatus: string;
  appliesTo: string;
  createdBy: number;
};

export type ManagerDashboardCategory = {
  id: number;
  name: string;
};

export async function fetchWellbeingManagerDashboardCategories(
  collegeId: number,
  registrationTypes: string[],
): Promise<ManagerDashboardCategory[]> {
  const normalizedTypes = new Set(registrationTypes.map((type) => type.toLowerCase()));
  const permitsCollege =
    normalizedTypes.size === 0 || normalizedTypes.has("college") || normalizedTypes.has("both");
  const permitsHostel =
    normalizedTypes.size === 0 || normalizedTypes.has("hostel") || normalizedTypes.has("both");

  let query = supabase
    .from("wellbeing_categories")
    .select("categoryId, categoryName, appliesTo")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("categoryName", { ascending: true });

  if (permitsCollege && !permitsHostel) {
    query = query.or("appliesTo.eq.college,appliesTo.eq.both");
  } else if (permitsHostel && !permitsCollege) {
    query = query.or("appliesTo.eq.hostel,appliesTo.eq.both");
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as Array<{ categoryId: number; categoryName: string }>).map((category) => ({
    id: category.categoryId,
    name: category.categoryName,
  }));
}

const monthRange = (date: Date) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
  end: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString(),
});

export async function fetchWellbeingManagerDashboard(
  collegeId: number,
  date = new Date(),
  filters?: {
    registrationTypes?: string[];
    categoryId?: number | null;
  },
): Promise<ManagerDashboardData> {
  const { start, end } = monthRange(date);
  let query = supabase
    .from("wellbeing_support_issues")
    .select("wellbeingSupportIssueId, fullName, issueTitle, description, categoryId, priority, IssueStatus, appliesTo, createdBy")
    .eq("collegeId", collegeId)
    .in("issueVisibilityRole", ["wellbeingmanager", "both"])
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .gte("createdAt", start)
    .lt("createdAt", end)
    .order("createdAt", { ascending: false });

  if (filters?.categoryId) {
    query = query.eq("categoryId", filters.categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  const registrationTypes = new Set(
    (filters?.registrationTypes ?? []).map((type) => type.toLowerCase()),
  );
  const permitsCollege =
    registrationTypes.size === 0 ||
    registrationTypes.has("college") ||
    registrationTypes.has("both");
  const permitsHostel =
    registrationTypes.size === 0 ||
    registrationTypes.has("hostel") ||
    registrationTypes.has("both");
  const normalizedAppliesTo = (issue: IssueRow) => issue.appliesTo?.trim().toLowerCase();
  const issues = ((data ?? []) as IssueRow[]).filter((issue) => {
    const appliesTo = normalizedAppliesTo(issue);
    if (appliesTo === "both") return permitsCollege || permitsHostel;
    if (appliesTo === "college") return permitsCollege;
    if (appliesTo === "hostel") return permitsHostel;
    return false;
  });
  const issueIds = issues.map((issue) => issue.wellbeingSupportIssueId);
  const categoryIds = Array.from(new Set(issues.map((issue) => issue.categoryId)));
  const userIds = Array.from(new Set(issues.map((issue) => issue.createdBy)));

  const [jobsResult, categoriesResult, profilesResult, attachmentsResult] = await Promise.all([
    issueIds.length
      ? supabase
          .from("wellbeing_issue_jobs")
          .select("wellbeingSupportIssueId, status, updatedAt")
          .in("wellbeingSupportIssueId", issueIds)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .order("updatedAt", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length
      ? supabase.from("wellbeing_categories").select("categoryId, categoryName").in("categoryId", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? supabase.from("user_profile").select("userId, profileUrl").in("userId", userIds).eq("is_deleted", false).is("deletedAt", null)
      : Promise.resolve({ data: [], error: null }),
    issueIds.length
      ? supabase
          .from("wellbeing_support_issue_attachments")
          .select("wellbeingSupportIssueId, attachment, is_deleted, deletedAt")
          .in("wellbeingSupportIssueId", issueIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (jobsResult.error) throw jobsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (attachmentsResult.error) throw attachmentsResult.error;

  const latestJobByIssueId = new Map<number, string>();
  ((jobsResult.data ?? []) as Array<{ wellbeingSupportIssueId: number; status: string }>).forEach((job) => {
    if (!latestJobByIssueId.has(job.wellbeingSupportIssueId)) {
      latestJobByIssueId.set(job.wellbeingSupportIssueId, job.status);
    }
  });
  const categoryById = new Map(
    ((categoriesResult.data ?? []) as Array<{ categoryId: number; categoryName: string }>).map((item) => [item.categoryId, item.categoryName]),
  );
  const profileByUserId = new Map(
    ((profilesResult.data ?? []) as Array<{ userId: number; profileUrl: string | null }>).map((item) => [item.userId, item.profileUrl || ""]),
  );
  const evidenceByIssueId = new Map<number, string>();
  ((attachmentsResult.data ?? []) as Array<{ wellbeingSupportIssueId: number; attachment: string; is_deleted: boolean | null; deletedAt: string | null }>)
    .filter((item) => !item.is_deleted && !item.deletedAt)
    .forEach((item) => {
      if (!evidenceByIssueId.has(item.wellbeingSupportIssueId)) {
        evidenceByIssueId.set(item.wellbeingSupportIssueId, item.attachment);
      }
    });

  const effectiveStatus = (issue: IssueRow) => {
    const jobStatus = latestJobByIssueId.get(issue.wellbeingSupportIssueId)?.toLowerCase();
    const issueStatus = issue.IssueStatus?.toLowerCase();
    if (jobStatus === "completed" || jobStatus === "complete" || jobStatus === "resolved") return "resolved";
    if (jobStatus === "cancelled" || jobStatus === "rejected") return "rejected";
    if (issueStatus === "completed" || issueStatus === "complete") return "resolved";
    return issueStatus;
  };
  const categoryCounts = new Map<string, number>();
  issues.forEach((issue) => {
    const name = categoryById.get(issue.categoryId) || "Not specified";
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  });
  const toDashboardIssue = (issue: IssueRow, kind: "college" | "hostel"): ManagerDashboardIssue => ({
    id: String(issue.wellbeingSupportIssueId),
    kind,
    student: issue.fullName || "Unknown user",
    meta: "",
    issue: issue.issueTitle,
    description: issue.description,
    category: categoryById.get(issue.categoryId) || "Not specified",
    priority: issue.priority?.trim().toLowerCase() === "high" ? "High" : issue.priority?.trim().toLowerCase() === "low" ? "Low" : "Medium",
    status: effectiveStatus(issue) as "pending" | "resolved" | "rejected",
    studentImage: profileByUserId.get(issue.createdBy) || "",
    evidence: evidenceByIssueId.get(issue.wellbeingSupportIssueId) || "No attachment",
  });
  const resolved = issues.filter((issue) => effectiveStatus(issue) === "resolved").length;
  const rejected = issues.filter((issue) => effectiveStatus(issue) === "rejected").length;
  const pending = issues.length - resolved - rejected;

  return {
    stats: {
      total: issues.length,
      high: issues.filter((issue) => issue.priority?.trim().toLowerCase() === "high").length,
      pending,
      resolved,
    },
    statusBreakdown: [
      { type: "Pending", value: pending, color: "#FDBA74" },
      { type: "Resolved", value: resolved, color: "#43C17A" },
      { type: "Rejected", value: rejected, color: "#FF1F1F" },
    ],
    categoryBreakdown: Array.from(categoryCounts, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    collegeIssues: permitsCollege
      ? issues.filter((issue) => ["college", "both"].includes(normalizedAppliesTo(issue))).map((issue) => toDashboardIssue(issue, "college"))
      : [],
    hostelIssues: permitsHostel
      ? issues.filter((issue) => ["hostel", "both"].includes(normalizedAppliesTo(issue))).map((issue) => toDashboardIssue(issue, "hostel"))
      : [],
  };
}
