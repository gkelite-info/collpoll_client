import { supabase } from "@/lib/supabaseClient";

export type EmployeeLeaveChatSenderRole = "EMPLOYEE" | "COLLEGE_HR";

export type EmployeeLeaveChatMessage = {
  chatId: number;
  employeeLeaveRequestId: number;
  message: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  senderUserId: number | null;
  senderCollegeHrId: number | null;
  senderRole: string;
  isRead: boolean;
  is_deleted: boolean | null;
  createdAt: string;
  senderName: string;
  senderAvatar: string | null;
};

type UserProfileJoin = { profileUrl: string | null } | { profileUrl: string | null }[] | null;
type UserJoin = {
  fullName: string | null;
  user_profile?: UserProfileJoin;
} | null;
type HrJoin = {
  userId: number | null;
  users?: UserJoin | UserJoin[];
} | null;

type EmployeeLeaveChatRow = {
  employeeLeaveRequestChatId: number;
  employeeLeaveRequestId: number;
  message: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  senderUserId: number | null;
  senderCollegeHrId: number | null;
  senderRole: string;
  isRead: boolean;
  is_deleted: boolean | null;
  createdAt: string;
  senderUser?: UserJoin | UserJoin[];
  senderHr?: HrJoin | HrJoin[];
};

const firstRelation = <T>(value?: T | T[] | null) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const getProfileUrl = (user?: UserJoin | UserJoin[]) => {
  const userRow = firstRelation(user);
  const profile = firstRelation(userRow?.user_profile);
  return profile?.profileUrl ?? null;
};

const chatSelect = `
  employeeLeaveRequestChatId,
  employeeLeaveRequestId,
  message,
  mediaUrl,
  mediaType,
  senderUserId,
  senderCollegeHrId,
  senderRole,
  isRead,
  is_deleted,
  createdAt,
  senderUser:senderUserId (
    fullName,
    user_profile (
      profileUrl
    )
  ),
  senderHr:senderCollegeHrId (
    userId,
    users:userId (
      fullName,
      user_profile (
        profileUrl
      )
    )
  )
`;

function formatChatMessage(row: EmployeeLeaveChatRow): EmployeeLeaveChatMessage {
  const senderUser = firstRelation(row.senderUser);
  const senderHr = firstRelation(row.senderHr);
  const hrUser = firstRelation(senderHr?.users);
  const senderName =
    senderUser?.fullName ??
    hrUser?.fullName ??
    (row.senderRole === "COLLEGE_HR" ? "HR Desk" : "Employee");

  return {
    chatId: row.employeeLeaveRequestChatId,
    employeeLeaveRequestId: row.employeeLeaveRequestId,
    message: row.message,
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType,
    senderUserId: row.senderUserId,
    senderCollegeHrId: row.senderCollegeHrId,
    senderRole: row.senderRole,
    isRead: row.isRead,
    is_deleted: row.is_deleted,
    createdAt: row.createdAt,
    senderName,
    senderAvatar: getProfileUrl(senderUser) ?? getProfileUrl(hrUser),
  };
}

export async function fetchEmployeeLeaveChatHistory(
  employeeLeaveRequestId: number,
  page = 1,
  limit = 50,
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("employee_leave_request_chats")
    .select(chatSelect)
    .eq("employeeLeaveRequestId", employeeLeaveRequestId)
    .eq("is_deleted", false)
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return ((data ?? []) as unknown as EmployeeLeaveChatRow[])
    .reverse()
    .map(formatChatMessage);
}

export async function fetchSingleEmployeeLeaveChatMessage(chatId: number) {
  const { data, error } = await supabase
    .from("employee_leave_request_chats")
    .select(chatSelect)
    .eq("employeeLeaveRequestChatId", chatId)
    .eq("is_deleted", false)
    .single();

  if (error || !data) return null;

  return formatChatMessage(data as unknown as EmployeeLeaveChatRow);
}

export async function sendEmployeeLeaveChatMessage(payload: {
  employeeLeaveRequestId: number;
  message?: string;
  file?: File;
  senderUserId?: number | null;
  senderCollegeHrId?: number | null;
  senderRole: EmployeeLeaveChatSenderRole;
}) {
  if (!payload.senderUserId && !payload.senderCollegeHrId) {
    throw new Error("Sender is missing.");
  }

  let mediaUrl: string | null = null;
  let mediaType: string | null = null;

  if (payload.file) {
    const fileExt = payload.file.name.split(".").pop()?.toLowerCase();
    mediaType = fileExt === "pdf" ? "pdf" : "image";
    const safeName = payload.file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${payload.employeeLeaveRequestId}/${Date.now()}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("employee_leave_request_chat_attachments")
      .upload(fileName, payload.file, { upsert: true });

    if (uploadError) {
      throw new Error(`Media upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("employee_leave_request_chat_attachments")
      .getPublicUrl(uploadData.path);

    mediaUrl = urlData.publicUrl;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("employee_leave_request_chats")
    .insert({
      employeeLeaveRequestId: payload.employeeLeaveRequestId,
      message: payload.message?.trim() || null,
      mediaUrl,
      mediaType,
      senderUserId: payload.senderUserId ?? null,
      senderCollegeHrId: payload.senderCollegeHrId ?? null,
      senderRole: payload.senderRole,
      isRead: false,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("employeeLeaveRequestChatId")
    .single();

  if (error) throw new Error(error.message);

  return fetchSingleEmployeeLeaveChatMessage(data.employeeLeaveRequestChatId);
}

export async function updateEmployeeLeaveChatMessage(payload: {
  chatId: number;
  message: string;
  senderUserId?: number | null;
  senderCollegeHrId?: number | null;
  senderRole: EmployeeLeaveChatSenderRole;
}) {
  const trimmedMessage = payload.message.trim();

  if (!trimmedMessage) {
    throw new Error("Message cannot be empty.");
  }

  if (!payload.senderUserId && !payload.senderCollegeHrId) {
    throw new Error("Sender is missing.");
  }

  let query = supabase
    .from("employee_leave_request_chats")
    .update({ message: trimmedMessage, updatedAt: new Date().toISOString() })
    .eq("employeeLeaveRequestChatId", payload.chatId)
    .eq("senderRole", payload.senderRole)
    .eq("is_deleted", false)
    .eq("isRead", false);

  query =
    payload.senderRole === "EMPLOYEE"
      ? query.eq("senderUserId", payload.senderUserId)
      : query.eq("senderCollegeHrId", payload.senderCollegeHrId);

  const { data, error } = await query
    .select("employeeLeaveRequestChatId")
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    throw new Error("Message cannot be edited after it is seen.");
  }

  return fetchSingleEmployeeLeaveChatMessage(data.employeeLeaveRequestChatId);
}

export async function deleteEmployeeLeaveChatMessage(payload: {
  chatId: number;
  senderUserId?: number | null;
  senderCollegeHrId?: number | null;
  senderRole: EmployeeLeaveChatSenderRole;
}) {
  if (!payload.senderUserId && !payload.senderCollegeHrId) {
    throw new Error("Sender is missing.");
  }

  let query = supabase
    .from("employee_leave_request_chats")
    .update({ is_deleted: true, updatedAt: new Date().toISOString() })
    .eq("employeeLeaveRequestChatId", payload.chatId)
    .eq("senderRole", payload.senderRole)
    .eq("is_deleted", false)
    .eq("isRead", false);

  query =
    payload.senderRole === "EMPLOYEE"
      ? query.eq("senderUserId", payload.senderUserId)
      : query.eq("senderCollegeHrId", payload.senderCollegeHrId);

  const { data, error } = await query
    .select("employeeLeaveRequestChatId")
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    throw new Error("Message cannot be deleted after it is seen.");
  }

  return data.employeeLeaveRequestChatId as number;
}

export async function deleteEmployeeLeaveChatMessages(payload: {
  chatIds: number[];
  senderUserId?: number | null;
  senderCollegeHrId?: number | null;
  senderRole: EmployeeLeaveChatSenderRole;
}) {
  if (!payload.senderUserId && !payload.senderCollegeHrId) {
    throw new Error("Sender is missing.");
  }
  if (payload.chatIds.length === 0) return [];

  let query = supabase
    .from("employee_leave_request_chats")
    .update({ is_deleted: true, updatedAt: new Date().toISOString() })
    .in("employeeLeaveRequestChatId", payload.chatIds)
    .eq("senderRole", payload.senderRole)
    .eq("is_deleted", false)
    .eq("isRead", false);

  query =
    payload.senderRole === "EMPLOYEE"
      ? query.eq("senderUserId", payload.senderUserId)
      : query.eq("senderCollegeHrId", payload.senderCollegeHrId);

  const { data, error } = await query
    .select("employeeLeaveRequestChatId");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.employeeLeaveRequestChatId as number);
}

export async function markEmployeeLeaveMessagesAsRead(
  employeeLeaveRequestId: number,
  receiverRole: EmployeeLeaveChatSenderRole,
) {
  await supabase
    .from("employee_leave_request_chats")
    .update({ isRead: true, updatedAt: new Date().toISOString() })
    .eq("employeeLeaveRequestId", employeeLeaveRequestId)
    .eq("is_deleted", false)
    .neq("senderRole", receiverRole)
    .eq("isRead", false);
}
