import { supabase } from "@/lib/supabaseClient";
import type { Executive, Issue } from "./types";

type PerformanceIssueRow = {
  wellbeingSupportIssueId: number;
  issueTitle: string;
  categoryId: number;
  priority: string;
  description: string;
  createdAt: string | null;
};

type IssueAttachmentRow = {
  wellbeingSupportIssueId: number;
  attachment: string;
  is_deleted: boolean | null;
  deletedAt: string | null;
};

type IssueJobRow = {
  wellbeingSupportIssueId: number;
  status: string;
  updatedAt: string | null;
};

type FetchExecutivePerformanceParams = {
  wellBeingId: number;
  categoryId: number;
  collegeId: number;
  name: string;
  staffId: string;
  role: string;
  image: string;
  phone: string;
  email: string;
  fromDate: string;
  toDate: string;
  fallbackCategoryName?: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const formatPriority = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";

const getAttachmentName = (path: string) => {
  const fileName = path.split("/").pop() || path;
  return fileName.replace(/^\d+_\d+_/, "");
};

export async function fetchExecutivePerformance(
  params: FetchExecutivePerformanceParams,
): Promise<Executive> {
  const { data: categoryData, error: categoryError } = await supabase
    .from("wellbeing_categories")
    .select("categoryName")
    .eq("categoryId", params.categoryId)
    .eq("collegeId", params.collegeId)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }

  const categoryName =
    categoryData?.categoryName ?? params.fallbackCategoryName ?? "Assigned Category";

  const { data: issueData, error: issueError } = await supabase
    .from("wellbeing_support_issues")
    .select(
      "wellbeingSupportIssueId, issueTitle, categoryId, priority, description, createdAt",
    )
    .eq("collegeId", params.collegeId)
    .eq("categoryId", params.categoryId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .gte("createdAt", params.fromDate)
    .lte("createdAt", params.toDate)
    .order("createdAt", { ascending: false });

  if (issueError) {
    throw issueError;
  }

  const issues = (issueData ?? []) as PerformanceIssueRow[];
  const issueIds = issues.map((issue) => issue.wellbeingSupportIssueId);

  const [jobsResult, attachmentsResult] = await Promise.all([
    issueIds.length
      ? supabase
          .from("wellbeing_issue_jobs")
          .select("wellbeingSupportIssueId, status, updatedAt")
          .in("wellbeingSupportIssueId", issueIds)
          .eq("wellBeingId", params.wellBeingId)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .is("deletedAt", null)
          .order("updatedAt", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    issueIds.length
      ? supabase
          .from("wellbeing_support_issue_attachments")
          .select("wellbeingSupportIssueId, attachment, is_deleted, deletedAt")
          .in("wellbeingSupportIssueId", issueIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (jobsResult.error) {
    throw jobsResult.error;
  }

  if (attachmentsResult.error) {
    throw attachmentsResult.error;
  }

  const latestJobByIssueId = new Map<number, IssueJobRow>();
  ((jobsResult.data ?? []) as IssueJobRow[]).forEach((job) => {
    if (!latestJobByIssueId.has(job.wellbeingSupportIssueId)) {
      latestJobByIssueId.set(job.wellbeingSupportIssueId, job);
    }
  });

  const attachmentsByIssueId = new Map<number, Issue["attachments"]>();
  ((attachmentsResult.data ?? []) as IssueAttachmentRow[])
    .filter((attachment) => !attachment.is_deleted && !attachment.deletedAt)
    .forEach((attachment) => {
      const current = attachmentsByIssueId.get(attachment.wellbeingSupportIssueId) ?? [];
      current.push({
        name: getAttachmentName(attachment.attachment),
        size: "Attachment",
      });
      attachmentsByIssueId.set(attachment.wellbeingSupportIssueId, current);
    });

  const completedIssues = issues.filter(
    (issue) => latestJobByIssueId.get(issue.wellbeingSupportIssueId)?.status === "completed",
  );
  const resolvedIssues = completedIssues.length;
  const totalIssues = issues.length;
  const contribution = totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  return {
    id: params.wellBeingId,
    name: params.name,
    staffId: params.staffId,
    role: `${categoryName} Executive`,
    category: categoryName,
    image: params.image,
    phone: params.phone,
    email: params.email,
    status: "",
    totalIssues,
    resolvedIssues,
    contribution,
    issues: completedIssues.map((issue) => ({
      id: String(issue.wellbeingSupportIssueId),
      title: issue.issueTitle,
      category: categoryName,
      priority: formatPriority(issue.priority),
      date: formatDate(issue.createdAt),
      description: issue.description,
      attachments: attachmentsByIssueId.get(issue.wellbeingSupportIssueId) ?? [],
    })),
  };
}
