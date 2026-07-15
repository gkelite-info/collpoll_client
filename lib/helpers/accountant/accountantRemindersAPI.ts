import { supabase } from "@/lib/supabaseClient";

export type AccountantReminder = {
  accountantReminderId: number;
  reminderTitle: string;
  type: string;
  category: string;
  amount: number;
  dueDate: string;
  repeat: string;
  notifyBefore: string;
  description: string | null;
  collegeId: number;
  createdBy: number;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountantReminderInput = {
  reminderTitle: string;
  type: string;
  category: string;
  amount: number;
  dueDate: string;
  repeat: string;
  notifyBefore: string;
  description?: string | null;
  collegeId: number;
  createdBy: number;
};

function validateReminder(input: CreateAccountantReminderInput) {
  if (input.reminderTitle.trim().length < 3) {
    throw new Error("Reminder title must contain at least 3 characters.");
  }
  if (input.type !== "To Pay") {
    throw new Error("Only To Pay reminders can be created from this screen.");
  }
  if (!input.category.trim()) {
    throw new Error("Select a category.");
  }
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be a positive whole number.");
  }
  if (!input.dueDate) {
    throw new Error("Select a due date.");
  }
  if (!input.repeat.trim()) {
    throw new Error("Select repeat frequency.");
  }
  if (!input.notifyBefore.trim()) {
    throw new Error("Select notify before.");
  }
  if (!Number.isInteger(input.collegeId) || input.collegeId <= 0) {
    throw new Error("A valid college is required.");
  }
  if (!Number.isInteger(input.createdBy) || input.createdBy <= 0) {
    throw new Error("A valid creator is required.");
  }
  if ((input.description?.trim().length ?? 0) > 255) {
    throw new Error("Description cannot exceed 255 characters.");
  }
}

export async function fetchAccountantReminders(
  collegeId: number,
  search?: string,
  category?: string,
  status?: string,
  date?: string,
) {
  let query = supabase
    .from("accountant_reminders")
    .select(
      "accountantReminderId, reminderTitle, type, category, amount, dueDate, repeat, notifyBefore, description, collegeId, createdBy, isActive, createdAt, updatedAt",
    )
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (search && search.trim() !== "") {
    query = query.ilike("reminderTitle", `%${search.trim()}%`);
  }

  if (category && category !== "All Categories") {
    query = query.eq("category", category);
  }

  if (status && status !== "All Statuses") {
    const today = new Date();
    // Use local date for YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    if (status === "COMPLETED") {
      query = query.eq("isActive", false);
    } else {
      query = query.eq("isActive", true);
      if (status === "DUE TODAY") {
        query = query.eq("dueDate", todayStr);
      } else if (status === "UPCOMING") {
        query = query.gt("dueDate", todayStr);
      } else if (status === "OVERDUE") {
        query = query.lt("dueDate", todayStr);
      }
    }
  }

  if (date) {
    query = query.eq("dueDate", date);
  }

  query = query.order("dueDate", { ascending: true }).order("createdAt", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount) || 0,
  })) as AccountantReminder[];
}

export async function createAccountantReminder(
  input: CreateAccountantReminderInput,
) {
  validateReminder(input);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("accountant_reminders")
    .insert({
      reminderTitle: input.reminderTitle.trim(),
      type: input.type,
      category: input.category.trim(),
      amount: input.amount,
      dueDate: input.dueDate,
      repeat: input.repeat,
      notifyBefore: input.notifyBefore,
      description: input.description?.trim() || null,
      collegeId: input.collegeId,
      createdBy: input.createdBy,
      isActive: true,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("accountantReminderId")
    .single();

  if (error) throw error;
  return data.accountantReminderId as number;
}

export async function updateAccountantReminderStatus(id: number, isActive: boolean) {
  const { error } = await supabase
    .from("accountant_reminders")
    .update({ isActive, updatedAt: new Date().toISOString() })
    .eq("accountantReminderId", id);

  if (error) throw error;
}

export async function updateAccountantReminder(id: number, input: Partial<CreateAccountantReminderInput>) {
  const now = new Date().toISOString();
  
  // Create an object to hold the fields we are actually updating
  const updates: any = { updatedAt: now };
  if (input.reminderTitle !== undefined) updates.reminderTitle = input.reminderTitle.trim();
  if (input.type !== undefined) updates.type = input.type;
  if (input.category !== undefined) updates.category = input.category.trim();
  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
  if (input.repeat !== undefined) updates.repeat = input.repeat;
  if (input.notifyBefore !== undefined) updates.notifyBefore = input.notifyBefore;
  if (input.description !== undefined) updates.description = input.description?.trim() || null;

  const { error } = await supabase
    .from("accountant_reminders")
    .update(updates)
    .eq("accountantReminderId", id);

  if (error) throw error;
}

export async function deleteAccountantReminder(id: number) {
  const { error } = await supabase
    .from("accountant_reminders")
    .update({ 
      is_deleted: true, 
      deletedAt: new Date().toISOString() 
    })
    .eq("accountantReminderId", id);

  if (error) throw error;
}
