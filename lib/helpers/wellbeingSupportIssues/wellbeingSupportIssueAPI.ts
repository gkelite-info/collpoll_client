import { supabase } from "@/lib/supabaseClient";
import type {
  CreateWellbeingSupportIssuePayload,
  StudentWellbeingIssueCounts,
  StudentWellbeingIssueListItem,
  StudentWellbeingIssueTab,
  UpdateWellbeingSupportIssuePayload,
  WellbeingExecutiveNewIssueCounts,
  WellbeingIssuePriority,
  WellbeingIssueRaisedRole,
  WellbeingIssueStatus,
  WellbeingIssueVisibilityRole,
} from "./types";
import type { AppliesToEnum } from "@/lib/helpers/wellbeingCategories/types";

const WELLBEING_ATTACHMENTS_BUCKET = "wellbeing-support-attachments";

type WellbeingSupportIssueAttachmentRow = {
  wellbeingSupportIssueAttachmentId: number;
  wellbeingSupportIssueId?: number;
  attachment: string;
  is_deleted: boolean | null;
  deletedAt: string | null;
};

type WellbeingSupportIssueCategoryLookupRow = {
  categoryId: number;
  categoryName: string;
};

type WellbeingSupportIssueSubCategoryLookupRow = {
  subCategoryId: number;
  subCategoryName: string;
};

type StudentWellbeingIssueRow = {
  wellbeingSupportIssueId: number;
  issueTitle: string;
  categoryId: number;
  subCategoryId: number;
  issueVisibilityRole: WellbeingIssueVisibilityRole;
  issueRaisedRole: WellbeingIssueRaisedRole;
  priority: WellbeingIssuePriority;
  IssueStatus: WellbeingIssueStatus;
  description: string;
  appliesTo: AppliesToEnum;
  createdAt: string | null;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function getAttachmentName(path: string) {
  const fileName = path.split("/").pop() || path;
  return fileName.replace(/^\d+_\d+_/, "");
}

function toUiStatus(status: WellbeingIssueStatus) {
  const statusMap: Record<WellbeingIssueStatus, "Pending" | "Resolved" | "Rejected"> = {
    pending: "Pending",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return statusMap[status] ?? "Pending";
}

async function uploadIssueAttachments(issueId: number, files: File[] = []) {
  const uploadedPaths: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const fileName = sanitizeFileName(file.name);
    const storagePath = `${issueId}/${Date.now()}_${index}_${fileName}`;

    const { data, error } = await supabase.storage
      .from(WELLBEING_ATTACHMENTS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Attachment upload failed: ${error.message}`);
    }

    uploadedPaths.push(data.path);
  }

  return uploadedPaths;
}

export async function createWellbeingSupportIssue(
  payload: CreateWellbeingSupportIssuePayload,
) {
  const now = new Date().toISOString();

  const { data: issueData, error: issueError } = await supabase
    .from("wellbeing_support_issues")
    .insert({
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      issueTitle: payload.issueTitle.trim(),
      issueVisibilityRole: payload.issueVisibilityRole,
      issueRaisedRole: payload.issueRaisedRole,
      categoryId: payload.categoryId,
      subCategoryId: payload.subCategoryId,
      appliesTo: payload.appliesTo,
      priority: payload.priority,
      description: payload.description.trim(),
      IssueStatus: "pending",
      isActive: true,
      createdBy: payload.createdBy,
      collegeId: payload.collegeId,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("wellbeingSupportIssueId")
    .single();

  if (issueError || !issueData) {
    if (issueError) {
      console.error("createWellbeingSupportIssue error:", {
        code: issueError.code,
        message: issueError.message,
        details: issueError.details,
        hint: issueError.hint,
      });
    }
    throw issueError ?? new Error("Failed to create wellbeing issue");
  }

  const issueId = issueData.wellbeingSupportIssueId;
  const attachmentPaths = await uploadIssueAttachments(issueId, payload.files);

  if (attachmentPaths.length > 0) {
    const { error: attachmentError } = await supabase
      .from("wellbeing_support_issue_attachments")
      .insert(
        attachmentPaths.map((attachment) => ({
          wellbeingSupportIssueId: issueId,
          attachment,
          is_deleted: false,
          createdAt: now,
          updatedAt: now,
        })),
      );

    if (attachmentError) {
      throw attachmentError;
    }
  }

  return { wellbeingSupportIssueId: issueId };
}

export async function updateWellbeingSupportIssue(
  payload: UpdateWellbeingSupportIssuePayload,
) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("wellbeing_support_issues")
    .update({
      issueTitle: payload.issueTitle.trim(),
      issueVisibilityRole: payload.issueVisibilityRole,
      categoryId: payload.categoryId,
      subCategoryId: payload.subCategoryId,
      appliesTo: payload.appliesTo,
      priority: payload.priority,
      description: payload.description.trim(),
      updatedAt: now,
    })
    .eq("wellbeingSupportIssueId", payload.wellbeingSupportIssueId)
    .eq("createdBy", payload.createdBy)
    .eq("collegeId", payload.collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (error) {
    console.error("updateWellbeingSupportIssue error:", error);
    throw error;
  }

  if (payload.attachmentIdsToRemove?.length) {
    const { error: attachmentRemoveError } = await supabase
      .from("wellbeing_support_issue_attachments")
      .update({
        is_deleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .eq("wellbeingSupportIssueId", payload.wellbeingSupportIssueId)
      .in("wellbeingSupportIssueAttachmentId", payload.attachmentIdsToRemove)
      .eq("is_deleted", false);

    if (attachmentRemoveError) {
      console.error("updateWellbeingSupportIssue remove attachments error:", attachmentRemoveError);
      throw attachmentRemoveError;
    }
  }

  const attachmentPaths = await uploadIssueAttachments(
    payload.wellbeingSupportIssueId,
    payload.filesToAdd,
  );

  if (attachmentPaths.length > 0) {
    const { error: attachmentInsertError } = await supabase
      .from("wellbeing_support_issue_attachments")
      .insert(
        attachmentPaths.map((attachment) => ({
          wellbeingSupportIssueId: payload.wellbeingSupportIssueId,
          attachment,
          is_deleted: false,
          createdAt: now,
          updatedAt: now,
        })),
      );

    if (attachmentInsertError) {
      console.error("updateWellbeingSupportIssue add attachments error:", attachmentInsertError);
      throw attachmentInsertError;
    }
  }

  return { success: true };
}

export async function deleteWellbeingSupportIssue({
  wellbeingSupportIssueId,
  createdBy,
  collegeId,
}: {
  wellbeingSupportIssueId: number;
  createdBy: number;
  collegeId: number;
}) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("wellbeing_support_issues")
    .update({
      isActive: false,
      is_deleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .eq("wellbeingSupportIssueId", wellbeingSupportIssueId)
    .eq("createdBy", createdBy)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (error) {
    console.error("deleteWellbeingSupportIssue error:", error);
    throw error;
  }

  const { error: attachmentError } = await supabase
    .from("wellbeing_support_issue_attachments")
    .update({
      is_deleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .eq("wellbeingSupportIssueId", wellbeingSupportIssueId)
    .eq("is_deleted", false);

  if (attachmentError) {
    console.error("deleteWellbeingSupportIssue attachments error:", attachmentError);
    throw attachmentError;
  }

  return { success: true };
}

export async function fetchStudentWellbeingIssueCounts(
  userId: number,
  collegeId: number,
): Promise<StudentWellbeingIssueCounts> {
  const { data, error } = await supabase
    .from("wellbeing_support_issues")
    .select("IssueStatus")
    .eq("createdBy", userId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (error) {
    console.error("fetchStudentWellbeingIssueCounts error:", error);
    throw error;
  }

  const rows = data ?? [];
  const pending = rows.filter((issue) => issue.IssueStatus === "pending").length;
  const resolved = rows.filter((issue) => issue.IssueStatus === "resolved").length;
  const rejected = rows.filter((issue) => issue.IssueStatus === "rejected").length;
  const raised = rows.length;

  return {
    raised,
    pending,
    resolved,
    rejected,
  };
}

export async function fetchWellbeingExecutiveNewIssueCounts(
  collegeId: number,
  categoryId?: number | null,
): Promise<WellbeingExecutiveNewIssueCounts> {
  const { data, error } = await supabase
    .from("wellbeing_support_issues")
    .select("categoryId, priority")
    .eq("collegeId", collegeId)
    .eq("IssueStatus", "pending")
    .eq("isActive", true)
    .eq("is_deleted", false)
    .in("issueVisibilityRole", ["wellbeingexecutive", "both"]);

  if (error) {
    console.error("fetchWellbeingExecutiveNewIssueCounts error:", error);
    throw error;
  }

  const rows = data ?? [];
  const myRows =
    categoryId !== undefined && categoryId !== null
      ? rows.filter((issue) => issue.categoryId === categoryId)
      : [];

  return {
    all: rows.length,
    my: myRows.length,
    urgent: rows.filter((issue) => issue.priority === "high").length,
  };
}

export async function fetchStudentWellbeingIssues({
  userId,
  collegeId,
  page,
  limit,
  tab,
}: {
  userId: number;
  collegeId: number;
  page: number;
  limit: number;
  tab: StudentWellbeingIssueTab;
}): Promise<{ data: StudentWellbeingIssueListItem[]; totalCount: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const clientStatusFilterByTab: Partial<Record<StudentWellbeingIssueTab, WellbeingIssueStatus>> = {
    resolved: "resolved",
    rejected: "rejected",
  };

  let query = supabase
    .from("wellbeing_support_issues")
    .select(
      `
      wellbeingSupportIssueId,
      issueTitle,
      categoryId,
      subCategoryId,
      issueVisibilityRole,
      issueRaisedRole,
      priority,
      IssueStatus,
      description,
      appliesTo,
      createdAt
    `,
      { count: "exact" },
    )
    .eq("createdBy", userId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false);

  if (tab === "pending") {
    query = query.eq("IssueStatus", "pending");
  }

  query = query.order("createdAt", { ascending: false });

  if (tab === "raised" || tab === "pending") {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("fetchStudentWellbeingIssues error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  const rawRows = (data ?? []) as StudentWellbeingIssueRow[];
  const clientStatusFilter = clientStatusFilterByTab[tab];
  const filteredRows = clientStatusFilter
    ? rawRows.filter((issue) => issue.IssueStatus === clientStatusFilter)
    : rawRows;
  const rows = clientStatusFilter
    ? filteredRows.slice(from, to + 1)
    : filteredRows;
  const categoryIds = Array.from(new Set(rows.map((issue) => issue.categoryId)));
  const subCategoryIds = Array.from(new Set(rows.map((issue) => issue.subCategoryId)));
  const issueIds = rows.map((issue) => issue.wellbeingSupportIssueId);

  const [categoriesRes, subCategoriesRes, attachmentsRes] = await Promise.all([
    categoryIds.length
      ? supabase
          .from("wellbeing_categories")
          .select("categoryId, categoryName")
          .in("categoryId", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    subCategoryIds.length
      ? supabase
          .from("wellbeing_sub_categories")
          .select("subCategoryId, subCategoryName")
          .in("subCategoryId", subCategoryIds)
      : Promise.resolve({ data: [], error: null }),
    issueIds.length
      ? supabase
          .from("wellbeing_support_issue_attachments")
          .select("wellbeingSupportIssueAttachmentId, wellbeingSupportIssueId, attachment, is_deleted, deletedAt")
          .in("wellbeingSupportIssueId", issueIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (categoriesRes.error) {
    console.error("fetchStudentWellbeingIssues categories error:", categoriesRes.error);
    throw categoriesRes.error;
  }
  if (subCategoriesRes.error) {
    console.error("fetchStudentWellbeingIssues subcategories error:", subCategoriesRes.error);
    throw subCategoriesRes.error;
  }
  if (attachmentsRes.error) {
    console.error("fetchStudentWellbeingIssues attachments error:", attachmentsRes.error);
    throw attachmentsRes.error;
  }

  const categoryById = new Map(
    ((categoriesRes.data ?? []) as WellbeingSupportIssueCategoryLookupRow[]).map((category) => [
      category.categoryId,
      category.categoryName,
    ]),
  );
  const subCategoryById = new Map(
    ((subCategoriesRes.data ?? []) as WellbeingSupportIssueSubCategoryLookupRow[]).map((subCategory) => [
      subCategory.subCategoryId,
      subCategory.subCategoryName,
    ]),
  );
  const attachmentsByIssueId = new Map<number, WellbeingSupportIssueAttachmentRow[]>();
  ((attachmentsRes.data ?? []) as WellbeingSupportIssueAttachmentRow[]).forEach((attachment) => {
    const issueId = attachment.wellbeingSupportIssueId;
    if (!issueId) return;
    const existing = attachmentsByIssueId.get(issueId) ?? [];
    existing.push(attachment);
    attachmentsByIssueId.set(issueId, existing);
  });

  const mappedData: StudentWellbeingIssueListItem[] = rows.map((issue) => {
    const attachments = (attachmentsByIssueId.get(issue.wellbeingSupportIssueId) ?? [])
      .filter((attachment) => !attachment.is_deleted && !attachment.deletedAt)
      .map((attachment) => ({
        id: attachment.wellbeingSupportIssueAttachmentId,
        name: getAttachmentName(attachment.attachment),
        size: "File",
      }));

    return {
      id: String(issue.wellbeingSupportIssueId),
      title: issue.issueTitle,
      categoryId: issue.categoryId,
      subCategoryId: issue.subCategoryId,
      issueVisibilityRole: issue.issueVisibilityRole,
      issueRaisedRole: issue.issueRaisedRole,
      priority: issue.priority,
      appliesTo: issue.appliesTo,
      subCategory: subCategoryById.get(issue.subCategoryId) || "Not specified",
      category: categoryById.get(issue.categoryId) || "Not specified",
      branch: issue.appliesTo || "Not specified",
      description: issue.description,
      dateReported: formatDate(issue.createdAt),
      status: toUiStatus(issue.IssueStatus),
      canModify: issue.IssueStatus === "pending",
      attachments,
    };
  });

  return {
    data: mappedData,
    totalCount: clientStatusFilter ? filteredRows.length : count ?? 0,
  };
}
