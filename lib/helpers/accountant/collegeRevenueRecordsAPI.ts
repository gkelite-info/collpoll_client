import { supabase } from "@/lib/supabaseClient";
import {
  type AccountantEducationOption,
  fetchAccountantEducationOptions,
} from "./accountantRevenueAPI";

export const COLLEGE_REVENUE_ATTACHMENTS_BUCKET =
  "college-revenue-record-attachments";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "xls",
  "xlsx",
]);

export type CreateCollegeRevenueRecordInput = {
  revenueSource: string;
  revenueTitle: string;
  amount: number;
  dateReceived: string;
  paymentMethod: string;
  description?: string | null;
  collegeId: number;
  collegeEducationIds: number[];
  createdBy: number;
  attachments?: File[];
};

export type CollegeRevenueRecord = {
  collegeRevenueRecordsId: number;
  revenueSource: string;
  revenueTitle: string;
  amount: number;
  dateReceived: string;
  collegeEducationId: number | null;
  createdAt: string;
};

export type CollegeRevenueMetrics = {
  totalRevenue: number;
  transactionCount: number;
  monthlyRevenue: number[];
  sourceBreakdown: Array<{
    source: string;
    amount: number;
    transactionCount: number;
  }>;
  recentRecords: CollegeRevenueRecord[];
};

export function fetchCollegeRevenueEducationOptions(
  accountantId: number | null | undefined,
  collegeId: number | null | undefined,
): Promise<AccountantEducationOption[]> {
  return fetchAccountantEducationOptions(accountantId, collegeId);
}

function validateInput(input: CreateCollegeRevenueRecordInput) {
  if (!input.revenueSource.trim()) throw new Error("Select a revenue source.");
  if (input.revenueTitle.trim().length < 3) {
    throw new Error("Revenue title must contain at least 3 characters.");
  }
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be a positive whole number.");
  }
  if (!input.dateReceived || input.dateReceived > new Date().toISOString().split("T")[0]) {
    throw new Error("Date received cannot be in the future.");
  }
  if (!input.paymentMethod.trim()) throw new Error("Select a payment method.");
  if (!Number.isInteger(input.collegeId) || input.collegeId <= 0) {
    throw new Error("A valid college is required.");
  }
  if (
    input.collegeEducationIds.length === 0 ||
    input.collegeEducationIds.some(
      (educationId) => !Number.isInteger(educationId) || educationId <= 0,
    )
  ) {
    throw new Error("Select at least one education type.");
  }
  if (!Number.isInteger(input.createdBy) || input.createdBy <= 0) {
    throw new Error("A valid creator is required.");
  }
  if ((input.description?.trim().length ?? 0) > 255) {
    throw new Error("Description cannot exceed 255 characters.");
  }
}

function validateAttachments(files: File[]) {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`You can upload a maximum of ${MAX_ATTACHMENTS} attachments.`);
  }

  files.forEach((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(`${file.name}: unsupported file type.`);
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(`${file.name}: file size cannot exceed 10MB.`);
    }
  });
}

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "file";
  const baseName =
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "attachment";

  return `${baseName}-${crypto.randomUUID()}.${extension}`;
}

export async function createCollegeRevenueRecord(
  input: CreateCollegeRevenueRecordInput,
) {
  validateInput(input);
  const files = input.attachments ?? [];
  validateAttachments(files);

  const { data: accountant, error: accountantError } = await supabase
    .from("accountants")
    .select("accountantId")
    .eq("userId", input.createdBy)
    .eq("collegeId", input.collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .maybeSingle();
  if (accountantError) throw accountantError;
  if (!accountant) throw new Error("An active accountant registration is required.");

  const assignedEducationTypes = await fetchCollegeRevenueEducationOptions(
    Number(accountant.accountantId),
    input.collegeId,
  );
  const assignedEducationIds = new Set(
    assignedEducationTypes.map((education) => education.collegeEducationId),
  );
  const uniqueEducationIds = Array.from(new Set(input.collegeEducationIds));
  if (
    uniqueEducationIds.some(
      (educationId) => !assignedEducationIds.has(educationId),
    )
  ) {
    throw new Error("Select only education types assigned to this accountant.");
  }

  const now = new Date().toISOString();
  const { data: records, error: recordError } = await supabase
    .from("college_revenue_records")
    .insert(
      uniqueEducationIds.map((collegeEducationId) => ({
        revenueSource: input.revenueSource.trim(),
        revenueTitle: input.revenueTitle.trim(),
        amount: input.amount,
        dateReceived: input.dateReceived,
        paymentMethod: input.paymentMethod.trim(),
        description: input.description?.trim() || null,
        collegeId: input.collegeId,
        collegeEducationId,
        createdBy: input.createdBy,
        isActive: true,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .select("collegeRevenueRecordsId");

  if (recordError) {
    if (recordError.code === "23505") {
      throw new Error("This revenue record already exists.");
    }
    throw recordError;
  }

  const recordIds = (records ?? []).map((record) =>
    Number(record.collegeRevenueRecordsId),
  );
  if (recordIds.length !== uniqueEducationIds.length) {
    throw new Error("Unable to create every education-type revenue record.");
  }
  const uploadedPaths: string[] = [];

  try {
    const attachmentRows = [];
    for (const recordId of recordIds) {
      for (const file of files) {
        const path = `college-${input.collegeId}/revenue-${recordId}/${safeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(COLLEGE_REVENUE_ATTACHMENTS_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        attachmentRows.push({
          collegeRevenueRecordsId: recordId,
          fileName: file.name,
          fileUrl: path,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          is_deleted: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (attachmentRows.length) {
      const { error: attachmentError } = await supabase
        .from("college_revenue_record_attachments")
        .insert(attachmentRows);
      if (attachmentError) throw attachmentError;
    }

    return recordIds;
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage
        .from(COLLEGE_REVENUE_ATTACHMENTS_BUCKET)
        .remove(uploadedPaths);
    }
    await supabase
      .from("college_revenue_records")
      .delete()
      .in("collegeRevenueRecordsId", recordIds);
    throw error;
  }
}

export async function fetchCollegeRevenueMetrics(
  collegeId: number | null | undefined,
  collegeEducationIds: number[],
): Promise<CollegeRevenueMetrics> {
  const emptyMetrics: CollegeRevenueMetrics = {
    totalRevenue: 0,
    transactionCount: 0,
    monthlyRevenue: Array<number>(12).fill(0),
    sourceBreakdown: [],
    recentRecords: [],
  };
  if (!collegeId || collegeEducationIds.length === 0) return emptyMetrics;

  const pageSize = 1_000;
  const rows: CollegeRevenueRecord[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("college_revenue_records")
      .select(
        "collegeRevenueRecordsId, revenueSource, revenueTitle, amount, dateReceived, collegeEducationId, createdAt",
      )
      .eq("collegeId", collegeId)
      .in("collegeEducationId", collegeEducationIds)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("dateReceived", { ascending: false })
      .order("createdAt", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const pageRows = (data ?? []).map((row) => ({
      ...row,
      amount: Number(row.amount) || 0,
    })) as CollegeRevenueRecord[];
    rows.push(...pageRows);
    if (pageRows.length < pageSize) break;
    from += pageSize;
  }

  const visibleRows =
    collegeEducationIds.length > 1
      ? Array.from(
          new Map(
            rows.map((row) => [
              [
                row.revenueSource.trim().toLocaleLowerCase("en-IN"),
                row.revenueTitle.trim().toLocaleLowerCase("en-IN"),
                row.amount,
                row.dateReceived,
                row.createdAt,
              ].join("|"),
              row,
            ]),
          ).values(),
        )
      : rows;
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array<number>(12).fill(0);
  const sources = new Map<string, { source: string; amount: number; transactionCount: number }>();

  visibleRows.forEach((row) => {
    const date = new Date(`${row.dateReceived}T00:00:00`);
    if (!Number.isNaN(date.getTime()) && date.getFullYear() === currentYear) {
      monthlyRevenue[date.getMonth()] += row.amount;
    }
    const key = row.revenueSource.trim().toLocaleLowerCase("en-IN");
    const current = sources.get(key);
    sources.set(key, {
      source: current?.source ?? row.revenueSource,
      amount: (current?.amount ?? 0) + row.amount,
      transactionCount: (current?.transactionCount ?? 0) + 1,
    });
  });

  return {
    totalRevenue: visibleRows.reduce((total, row) => total + row.amount, 0),
    transactionCount: visibleRows.length,
    monthlyRevenue,
    sourceBreakdown: Array.from(sources.values()).sort((a, b) => b.amount - a.amount),
    recentRecords: visibleRows.slice(0, 20),
  };
}
