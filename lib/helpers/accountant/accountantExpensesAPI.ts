import { supabase } from "@/lib/supabaseClient";
import { fetchAccountantEducationOptions } from "./accountantRevenueAPI";

export const ACCOUNTANT_EXPENSE_ATTACHMENTS_BUCKET =
  "accountant-expense-attachments";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg"]);
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/octet-stream",
  "image/jpeg",
  "image/jpg",
]);

export type AccountantExpenseAttachment = {
  accountantExpenseAttachmentId: number;
  accountantExpenseId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
};

export type AccountantExpense = {
  accountantExpenseId: number;
  expenseName: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  remarks: string | null;
  collegeId: number;
  createdBy: number;
  createdByName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  collegeEducationId: number | null;
  attachments: AccountantExpenseAttachment[];
};

export type CreateAccountantExpenseInput = {
  expenseName: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  remarks?: string | null;
  collegeId: number;
  createdBy: number;
  collegeEducationId: number;
  attachments?: File[];
};

export type UpdateAccountantExpenseInput = Omit<
  CreateAccountantExpenseInput,
  "attachments"
> & {
  accountantExpenseId: number;
  newAttachments?: File[];
};

export type FetchAccountantExpensesInput = {
  collegeId: number;
  page?: number;
  itemsPerPage?: number;
  category?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  collegeEducationIds?: number[];
};

export type AccountantExpenseSummary = {
  totalExpenses: number;
  transactionCount: number;
  topCategory: string;
  monthlyExpenses: number[];
  categoryBreakdown: Array<{ category: string; amount: number }>;
};

type AccountantExpenseRow = Omit<
  AccountantExpense,
  "attachments" | "createdByName"
> & {
  createdByUser:
    | { fullName: string | null }
    | { fullName: string | null }[]
    | null;
};

function validateExpense(input: CreateAccountantExpenseInput) {
  if (input.expenseName.trim().length < 3) {
    throw new Error("Expense name must contain at least 3 characters.");
  }
  if (!input.category.trim()) {
    throw new Error("Select an expense category.");
  }
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be a positive whole number.");
  }
  if (!input.expenseDate || input.expenseDate > new Date().toISOString().split("T")[0]) {
    throw new Error("Enter an expense date that is not in the future.");
  }
  if (!["UPI", "Cash", "Bank Transfer", "Cheque", "Card"].includes(input.paymentMethod)) {
    throw new Error("Select a valid payment method.");
  }
  if (!Number.isInteger(input.collegeId) || input.collegeId <= 0) {
    throw new Error("A valid college is required.");
  }
  if (!Number.isInteger(input.createdBy) || input.createdBy <= 0) {
    throw new Error("A valid creator is required.");
  }
  if (
    !Number.isInteger(input.collegeEducationId) ||
    input.collegeEducationId <= 0
  ) {
    throw new Error("Select an education type.");
  }
  if ((input.remarks?.trim().length ?? 0) > 255) {
    throw new Error("Remarks cannot exceed 255 characters.");
  }
}

function validateAttachments(files: File[]) {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`You can upload a maximum of ${MAX_ATTACHMENTS} attachments.`);
  }

  files.forEach((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (
      !ALLOWED_EXTENSIONS.has(extension) ||
      (file.type && !ALLOWED_FILE_TYPES.has(file.type))
    ) {
      throw new Error(`${file.name}: only PDF, JPG, and JPEG files are allowed.`);
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

async function uploadAttachments({
  accountantExpenseId,
  collegeId,
  createdBy,
  files,
}: {
  accountantExpenseId: number;
  collegeId: number;
  createdBy: number;
  files: File[];
}) {
  if (!files.length) return [];
  validateAttachments(files);

  const now = new Date().toISOString();
  const uploadedPaths: string[] = [];

  try {
    const attachmentRows = [];
    for (const file of files) {
      const path = `college-${collegeId}/user-${createdBy}/expense-${accountantExpenseId}/${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(ACCOUNTANT_EXPENSE_ATTACHMENTS_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      attachmentRows.push({
        accountantExpenseId,
        fileName: file.name,
        fileUrl: path,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    const { data, error } = await supabase
      .from("accountant_expense_attachments")
      .insert(attachmentRows)
      .select(
        "accountantExpenseAttachmentId, accountantExpenseId, fileName, fileUrl, fileType, fileSize, createdAt",
      );
    if (error) throw error;
    return (data ?? []) as AccountantExpenseAttachment[];
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage
        .from(ACCOUNTANT_EXPENSE_ATTACHMENTS_BUCKET)
        .remove(uploadedPaths);
    }
    throw error;
  }
}

async function fetchAttachments(expenseIds: number[]) {
  if (!expenseIds.length) return [];

  const { data, error } = await supabase
    .from("accountant_expense_attachments")
    .select(
      "accountantExpenseAttachmentId, accountantExpenseId, fileName, fileUrl, fileType, fileSize, createdAt",
    )
    .in("accountantExpenseId", expenseIds)
    .eq("is_deleted", false)
    .order("createdAt", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AccountantExpenseAttachment[];
}

async function validateAssignedEducationType(input: {
  collegeId: number;
  createdBy: number;
  collegeEducationId: number;
}) {
  const { data: accountant, error } = await supabase
    .from("accountants")
    .select("accountantId")
    .eq("userId", input.createdBy)
    .eq("collegeId", input.collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw error;
  if (!accountant) {
    throw new Error("An active accountant registration is required.");
  }

  const assignedOptions = await fetchAccountantEducationOptions(
    accountant.accountantId,
    input.collegeId,
  );
  const assignedIds = new Set(
    assignedOptions.map((education) => education.collegeEducationId),
  );

  if (!assignedIds.has(input.collegeEducationId)) {
    throw new Error("Select an education type assigned to this accountant.");
  }
}

function withAttachments(
  rows: AccountantExpenseRow[],
  attachments: AccountantExpenseAttachment[],
) {
  return rows.map((row) => {
    const { createdByUser, ...expense } = row;
    const creator = Array.isArray(createdByUser)
      ? createdByUser[0]
      : createdByUser;
    return {
      ...expense,
      amount: Number(row.amount),
      createdByName: creator?.fullName?.trim() || `User #${row.createdBy}`,
      attachments: attachments.filter(
        (attachment) => attachment.accountantExpenseId === row.accountantExpenseId,
      ),
    };
  });
}

export async function createAccountantExpense(
  input: CreateAccountantExpenseInput,
) {
  validateExpense(input);
  validateAttachments(input.attachments ?? []);
  await validateAssignedEducationType(input);

  const now = new Date().toISOString();
  let accountantExpenseId: number | null = null;

  try {
    const { data, error } = await supabase
      .from("accountant_expenses")
      .insert({
        expenseName: input.expenseName.trim(),
        category: input.category.trim(),
        amount: input.amount,
        expenseDate: input.expenseDate,
        paymentMethod: input.paymentMethod,
        remarks: input.remarks?.trim() || null,
        collegeId: input.collegeId,
        collegeEducationId: input.collegeEducationId,
        createdBy: input.createdBy,
        isActive: true,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      })
      .select("accountantExpenseId")
      .single();

    if (error) throw error;
    accountantExpenseId = Number(data.accountantExpenseId);

    const attachments = await uploadAttachments({
      accountantExpenseId,
      collegeId: input.collegeId,
      createdBy: input.createdBy,
      files: input.attachments ?? [],
    });

    return { accountantExpenseId, attachments };
  } catch (error) {
    if (accountantExpenseId) {
      await supabase
        .from("accountant_expenses")
        .delete()
        .eq("accountantExpenseId", accountantExpenseId);
    }
    throw error;
  }
}

export async function fetchAccountantExpenses({
  collegeId,
  page = 1,
  itemsPerPage = 10,
  category,
  search,
  fromDate,
  toDate,
  collegeEducationIds,
}: FetchAccountantExpensesInput) {
  const safePage = Math.max(1, Math.trunc(page));
  const safeItemsPerPage = Math.min(100, Math.max(1, Math.trunc(itemsPerPage)));
  const from = (safePage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage - 1;

  let query = supabase
    .from("accountant_expenses")
    .select(
      "accountantExpenseId, expenseName, category, amount, expenseDate, paymentMethod, remarks, collegeId, collegeEducationId, createdBy, isActive, createdAt, updatedAt, createdByUser:users!accountant_expenses_createdBy_fkey(fullName)",
      { count: "exact" },
    )
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (collegeEducationIds) {
    if (collegeEducationIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: safePage,
        itemsPerPage: safeItemsPerPage,
      };
    }
    query = query.in("collegeEducationId", collegeEducationIds);
  }
  if (category?.trim()) query = query.eq("category", category.trim());
  if (search?.trim()) query = query.ilike("expenseName", `%${search.trim()}%`);
  if (fromDate) query = query.gte("expenseDate", fromDate);
  if (toDate) query = query.lte("expenseDate", toDate);
  if (collegeEducationIds?.length) {
    query = query.in("collegeEducationId", collegeEducationIds);
  }

  const { data, error, count } = await query
    .order("expenseDate", { ascending: false })
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) throw error;
  const rows = (data ?? []) as AccountantExpenseRow[];
  const expenseIds = rows.map((row) => row.accountantExpenseId);
  const attachments = await fetchAttachments(expenseIds);

  return {
    data: withAttachments(rows, attachments),
    total: count ?? 0,
    page: safePage,
    itemsPerPage: safeItemsPerPage,
  };
}

export async function fetchAccountantExpenseSummary(
  collegeId: number | null | undefined,
  collegeEducationIds: number[],
): Promise<AccountantExpenseSummary> {
  if (!collegeId || collegeEducationIds.length === 0) {
    return {
      totalExpenses: 0,
      transactionCount: 0,
      topCategory: "-",
      monthlyExpenses: Array<number>(12).fill(0),
      categoryBreakdown: [],
    };
  }

  const pageSize = 1_000;
  let from = 0;
  let totalExpenses = 0;
  let transactionCount = 0;
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = Array<number>(12).fill(0);
  const categories = new Map<string, { label: string; amount: number }>();
  const seenExpenseRecords = new Set<string>();

  while (true) {
    const { data, error } = await supabase
      .from("accountant_expenses")
      .select(
        "expenseName, amount, category, expenseDate, paymentMethod, createdBy",
      )
      .eq("collegeId", collegeId)
      .in("collegeEducationId", collegeEducationIds)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const rows = data ?? [];

    rows.forEach((row) => {
      if (collegeEducationIds.length > 1) {
        const recordKey = [
          row.expenseName?.trim().toLocaleLowerCase("en-IN") ?? "",
          row.category?.trim().toLocaleLowerCase("en-IN") ?? "",
          Number(row.amount) || 0,
          row.expenseDate,
          row.paymentMethod?.trim().toLocaleLowerCase("en-IN") ?? "",
          row.createdBy,
        ].join("|");
        if (seenExpenseRecords.has(recordKey)) return;
        seenExpenseRecords.add(recordKey);
      }

      transactionCount += 1;
      const amount = Number(row.amount) || 0;
      const label = row.category?.trim() || "Uncategorized";
      const key = label.toLocaleLowerCase("en-IN");
      const current = categories.get(key);
      const [expenseYear, expenseMonth] = row.expenseDate
        .split("-")
        .map(Number);

      totalExpenses += amount;
      if (
        expenseYear === currentYear &&
        expenseMonth >= 1 &&
        expenseMonth <= 12
      ) {
        monthlyExpenses[expenseMonth - 1] += amount;
      }
      categories.set(key, {
        label: current?.label ?? label,
        amount: (current?.amount ?? 0) + amount,
      });
    });

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  const topCategory = Array.from(categories.values()).reduce<
    { label: string; amount: number } | null
  >(
    (highest, category) =>
      !highest || category.amount > highest.amount ? category : highest,
    null,
  );

  return {
    totalExpenses,
    transactionCount,
    topCategory: topCategory?.label ?? "-",
    monthlyExpenses,
    categoryBreakdown: Array.from(categories.values())
      .map((category) => ({
        category: category.label,
        amount: category.amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export async function fetchAccountantExpenseById(
  accountantExpenseId: number,
  collegeId: number,
) {
  const { data, error } = await supabase
    .from("accountant_expenses")
    .select(
      "accountantExpenseId, expenseName, category, amount, expenseDate, paymentMethod, remarks, collegeId, collegeEducationId, createdBy, isActive, createdAt, updatedAt, createdByUser:users!accountant_expenses_createdBy_fkey(fullName)",
    )
    .eq("accountantExpenseId", accountantExpenseId)
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const attachments = await fetchAttachments([accountantExpenseId]);
  return withAttachments([data as AccountantExpenseRow], attachments)[0];
}

export async function updateAccountantExpense(
  input: UpdateAccountantExpenseInput,
) {
  validateExpense(input);
  validateAttachments(input.newAttachments ?? []);
  await validateAssignedEducationType(input);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("accountant_expenses")
    .update({
      expenseName: input.expenseName.trim(),
      category: input.category.trim(),
      amount: input.amount,
      expenseDate: input.expenseDate,
      paymentMethod: input.paymentMethod,
      remarks: input.remarks?.trim() || null,
      collegeEducationId: input.collegeEducationId,
      updatedAt: now,
    })
    .eq("accountantExpenseId", input.accountantExpenseId)
    .eq("collegeId", input.collegeId)
    .eq("createdBy", input.createdBy)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .select("accountantExpenseId")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("The expense was not found or cannot be updated.");

  const attachments = await uploadAttachments({
    accountantExpenseId: input.accountantExpenseId,
    collegeId: input.collegeId,
    createdBy: input.createdBy,
    files: input.newAttachments ?? [],
  });

  return { accountantExpenseId: input.accountantExpenseId, attachments };
}

export async function deleteAccountantExpense(
  accountantExpenseId: number,
  collegeId: number,
  createdBy: number,
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("accountant_expenses")
    .update({
      isActive: false,
      is_deleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .eq("accountantExpenseId", accountantExpenseId)
    .eq("collegeId", collegeId)
    .eq("createdBy", createdBy)
    .eq("is_deleted", false)
    .select("accountantExpenseId")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("The expense was not found or cannot be deleted.");

  const { error: attachmentError } = await supabase
    .from("accountant_expense_attachments")
    .update({ is_deleted: true, updatedAt: now })
    .eq("accountantExpenseId", accountantExpenseId)
    .eq("is_deleted", false);
  if (attachmentError) throw attachmentError;

}

export async function getAccountantExpenseAttachmentSignedUrl(
  filePath: string,
) {
  const { data, error } = await supabase.storage
    .from(ACCOUNTANT_EXPENSE_ATTACHMENTS_BUCKET)
    .createSignedUrl(filePath, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
