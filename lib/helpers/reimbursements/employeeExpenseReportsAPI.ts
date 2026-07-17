import { supabase } from "@/lib/supabaseClient";

export const EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET =
  "employee-expense-attachments";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/octet-stream",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export type CreateEmployeeExpenseReportInput = {
  userId: number;
  collegeId: number;
  expenseTitle: string;
  expenseCategory: string;
  expenseDate: string;
  amountSpent: number;
  description: string;
  paymentBank: string;
  accountNumber: string;
  ifscCode: string;
  attachments: File[];
};

export type UpdateEmployeeExpenseReportInput = Omit<
  CreateEmployeeExpenseReportInput,
  "attachments"
> & {
  employeeExpenseReportId: number;
  newAttachments: File[];
};

type InsertedExpenseReport = {
  employeeExpenseReportId: number;
};

export type EmployeeExpenseAttachment = {
  expenseAttachmentId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
};

export type EmployeeExpenseReport = {
  employeeExpenseReportId: number;
  expenseTitle: string;
  expenseCategory: string;
  expenseDate: string;
  amountSpent: number;
  description: string;
  paymentBank: string;
  accountNumber: string;
  ifscCode: string;
  status: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  attachments: EmployeeExpenseAttachment[];
};

function validateAttachments(files: File[]) {
  if (!files.length) {
    throw new Error("Attach at least one receipt or supporting document.");
  }
  if (files.length > MAX_FILES) {
    throw new Error(`You can upload a maximum of ${MAX_FILES} files.`);
  }

  files.forEach((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const hasAllowedExtension = ["pdf", "jpg", "jpeg", "png"].includes(extension ?? "");
    const hasAllowedType = !file.type || ALLOWED_FILE_TYPES.has(file.type);
    if (!hasAllowedExtension || !hasAllowedType) {
      throw new Error(`${file.name}: only PDF, JPG, JPEG, and PNG files are allowed.`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name}: file size must not exceed 5MB.`);
    }
  });
}

async function getEmployeeIdPk(userId: number, collegeId: number) {
  const { data, error } = await supabase
    .from("employee_ids")
    .select("employeeIdPk")
    .eq("userId", userId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw error;
  if (!data?.employeeIdPk) {
    throw new Error("An active employee ID was not found for this user.");
  }

  return data.employeeIdPk as number;
}

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "file";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "attachment";

  return `${baseName}-${crypto.randomUUID()}.${extension}`;
}

export async function createEmployeeExpenseReport(
  input: CreateEmployeeExpenseReportInput,
) {
  validateAttachments(input.attachments);

  if (input.expenseTitle.trim().length < 3) {
    throw new Error("Expense title must contain at least 3 characters.");
  }
  if (!input.expenseDate || input.expenseDate > new Date().toISOString().split("T")[0]) {
    throw new Error("Enter a valid expense date that is not in the future.");
  }
  if (input.description.trim().length < 10) {
    throw new Error("Expense description must contain at least 10 characters.");
  }

  if (!Number.isFinite(input.amountSpent) || input.amountSpent <= 0) {
    throw new Error("Amount spent must be greater than zero.");
  }
  if (input.amountSpent > 99999999.99) {
    throw new Error("Amount exceeds the supported limit.");
  }
  if (!/^\d{6,30}$/.test(input.accountNumber.replace(/\s+/g, ""))) {
    throw new Error("Account number must contain 6 to 30 digits.");
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.ifscCode.trim().toUpperCase())) {
    throw new Error("Enter a valid IFSC code.");
  }

  const employeeId = await getEmployeeIdPk(input.userId, input.collegeId);
  const now = new Date().toISOString();
  const uploadedPaths: string[] = [];
  let reportId: number | null = null;

  try {
    const { data: report, error: reportError } = await supabase
      .from("employee_expense_reports")
      .insert({
        employeeId,
        collegeId: input.collegeId,
        expenseTitle: input.expenseTitle.trim(),
        expenseCategory: input.expenseCategory,
        expenseDate: input.expenseDate,
        amountSpent: input.amountSpent,
        description: input.description.trim(),
        paymentBank: input.paymentBank.trim(),
        accountNumber: input.accountNumber.replace(/\s+/g, ""),
        ifscCode: input.ifscCode.trim().toUpperCase(),
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .select("employeeExpenseReportId")
      .single<InsertedExpenseReport>();

    if (reportError) throw reportError;
    reportId = report.employeeExpenseReportId;

    const attachmentRows = [];
    for (const file of input.attachments) {
      const path = `college-${input.collegeId}/employee-${employeeId}/report-${reportId}/${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      attachmentRows.push({
        employeeExpenseReportId: reportId,
        fileName: file.name,
        fileUrl: path,
        fileType: file.type,
        fileSize: file.size,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (attachmentRows.length) {
      const { error: attachmentError } = await supabase
        .from("employee_expense_attachments")
        .insert(attachmentRows);
      if (attachmentError) throw attachmentError;
    }

    return { employeeExpenseReportId: reportId };
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage
        .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
        .remove(uploadedPaths);
    }
    if (reportId) {
      await supabase
        .from("employee_expense_reports")
        .delete()
        .eq("employeeExpenseReportId", reportId);
    }
    throw error;
  }
}

export async function fetchEmployeeExpenseReports(
  userId: number,
  collegeId: number,
): Promise<EmployeeExpenseReport[]> {
  const employeeId = await getEmployeeIdPk(userId, collegeId);
  const { data: reports, error } = await supabase
    .from("employee_expense_reports")
    .select("employeeExpenseReportId, expenseTitle, expenseCategory, expenseDate, amountSpent, description, paymentBank, accountNumber, ifscCode, status, approvedAt, rejectedAt, createdAt")
    .eq("employeeId", employeeId)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  const reportRows = (reports ?? []) as Omit<EmployeeExpenseReport, "attachments">[];
  if (!reportRows.length) return [];

  const reportIds = reportRows.map((report) => report.employeeExpenseReportId);
  const { data: attachments, error: attachmentError } = await supabase
    .from("employee_expense_attachments")
    .select("expenseAttachmentId, employeeExpenseReportId, fileName, fileUrl, fileType, fileSize")
    .in("employeeExpenseReportId", reportIds)
    .order("createdAt", { ascending: true });

  if (attachmentError) throw attachmentError;
  const attachmentRows = (attachments ?? []) as (EmployeeExpenseAttachment & { employeeExpenseReportId: number })[];

  return reportRows.map((report) => ({
    ...report,
    amountSpent: Number(report.amountSpent),
    attachments: attachmentRows.filter(
      (attachment) => attachment.employeeExpenseReportId === report.employeeExpenseReportId,
    ),
  }));
}

export async function getExpenseAttachmentSignedUrl(filePath: string, downloadFileName?: string) {
  const normalizedPath = normalizeExpenseAttachmentPath(filePath);
  const { data, error } = await supabase.storage
    .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
    .createSignedUrl(normalizedPath, 60 * 10, downloadFileName ? { download: downloadFileName } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

function normalizeExpenseAttachmentPath(filePath: string) {
  const trimmedPath = filePath.trim();
  const bucketSegment = `/${EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET}/`;

  try {
    const url = new URL(trimmedPath);
    const bucketIndex = url.pathname.indexOf(bucketSegment);
    if (bucketIndex >= 0) {
      return decodeURIComponent(url.pathname.slice(bucketIndex + bucketSegment.length));
    }
  } catch {
    // Stored attachment paths are usually plain storage keys, not absolute URLs.
  }

  const pathWithoutQuery = trimmedPath.split("?")[0].replace(/^\/+/, "");
  const prefixedBucket = `${EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET}/`;
  const storageObjectPrefix = `storage/v1/object/public/${prefixedBucket}`;
  const signedObjectPrefix = `storage/v1/object/sign/${prefixedBucket}`;

  if (pathWithoutQuery.startsWith(prefixedBucket)) {
    return decodeURIComponent(pathWithoutQuery.slice(prefixedBucket.length));
  }
  if (pathWithoutQuery.startsWith(storageObjectPrefix)) {
    return decodeURIComponent(pathWithoutQuery.slice(storageObjectPrefix.length));
  }
  if (pathWithoutQuery.startsWith(signedObjectPrefix)) {
    return decodeURIComponent(pathWithoutQuery.slice(signedObjectPrefix.length));
  }

  return decodeURIComponent(pathWithoutQuery);
}

export async function updateEmployeeExpenseReport(
  input: UpdateEmployeeExpenseReportInput,
) {
  if (input.newAttachments.length) validateAttachments(input.newAttachments);
  const employeeId = await getEmployeeIdPk(input.userId, input.collegeId);
  const now = new Date().toISOString();

  const { data: updatedReport, error: updateError } = await supabase
    .from("employee_expense_reports")
    .update({
      expenseTitle: input.expenseTitle.trim(),
      expenseCategory: input.expenseCategory,
      expenseDate: input.expenseDate,
      amountSpent: input.amountSpent,
      description: input.description.trim(),
      paymentBank: input.paymentBank.trim(),
      accountNumber: input.accountNumber.replace(/\s+/g, ""),
      ifscCode: input.ifscCode.trim().toUpperCase(),
      updatedAt: now,
    })
    .eq("employeeExpenseReportId", input.employeeExpenseReportId)
    .eq("employeeId", employeeId)
    .eq("collegeId", input.collegeId)
    .eq("status", "pending")
    .is("deletedAt", null)
    .select("employeeExpenseReportId")
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updatedReport) {
    throw new Error("Only your pending reimbursement requests can be updated.");
  }
  if (!input.newAttachments.length) return;

  const uploadedPaths: string[] = [];
  try {
    const attachmentRows = [];
    for (const file of input.newAttachments) {
      const path = `college-${input.collegeId}/employee-${employeeId}/report-${input.employeeExpenseReportId}/${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      attachmentRows.push({
        employeeExpenseReportId: input.employeeExpenseReportId,
        fileName: file.name,
        fileUrl: path,
        fileType: file.type,
        fileSize: file.size,
        createdAt: now,
        updatedAt: now,
      });
    }
    const { error } = await supabase
      .from("employee_expense_attachments")
      .insert(attachmentRows);
    if (error) throw error;
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage
        .from(EMPLOYEE_EXPENSE_ATTACHMENTS_BUCKET)
        .remove(uploadedPaths);
    }
    throw error;
  }
}

export async function deleteEmployeeExpenseReport(
  employeeExpenseReportId: number,
  userId: number,
  collegeId: number,
) {
  const employeeId = await getEmployeeIdPk(userId, collegeId);
  const now = new Date().toISOString();
  const { data: deletedReport, error } = await supabase
    .from("employee_expense_reports")
    .update({ deletedAt: now, updatedAt: now })
    .eq("employeeExpenseReportId", employeeExpenseReportId)
    .eq("employeeId", employeeId)
    .eq("collegeId", collegeId)
    .eq("status", "pending")
    .is("deletedAt", null)
    .select("employeeExpenseReportId")
    .maybeSingle();
  if (error) throw error;
  if (!deletedReport) {
    throw new Error("Only your pending reimbursement requests can be deleted.");
  }
}
