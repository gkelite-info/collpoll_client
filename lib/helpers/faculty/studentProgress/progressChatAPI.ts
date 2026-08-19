import { supabase } from "@/lib/supabaseClient";

export async function fetchProgressChatHistory(
  studentId: number,
  facultyId: number,
  page: number = 1,
  limit: number = 50,
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("student_progress_chats")
    .select(
      `
      *,
      senderUser:senderUserId ( fullName, user_profile(profileUrl) )
    `,
    )
    .eq("studentId", studentId)
    .eq("facultyId", facultyId)
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (data || []).reverse().map((msg: any) => formatProgressChatMessage(msg));
}

export async function fetchSingleProgressChatMessage(chatId: number) {
  const { data, error } = await supabase
    .from("student_progress_chats")
    .select(
      `
      *,
      senderUser:senderUserId ( fullName, user_profile(profileUrl) )
    `,
    )
    .eq("chatId", chatId)
    .single();

  if (error || !data) return null;
  return formatProgressChatMessage(data);
}

function formatProgressChatMessage(msg: any) {
  const userObj = Array.isArray(msg.senderUser) ? msg.senderUser[0] : msg.senderUser;
  const profileObj = Array.isArray(userObj?.user_profile)
    ? userObj.user_profile[0]
    : userObj?.user_profile;

  return {
    chatId: msg.chatId,
    message: msg.message,
    mediaUrl: msg.mediaUrl,
    mediaType: msg.mediaType,
    senderRole: msg.senderRole,
    senderUserId: msg.senderUserId,
    isRead: msg.isRead,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    senderName: userObj?.fullName || "User",
    senderAvatar: profileObj?.profileUrl || null,
  };
}

export async function sendProgressChatMessage(payload: {
  studentId: number;
  facultyId: number;
  collegeId: number;
  message?: string;
  file?: File;
  senderUserId: number;
  senderRole: "STUDENT" | "PARENT" | "FACULTY";
}) {
  if (!payload.senderUserId) throw new Error("Sender ID is missing");

  let mediaUrl = null;
  let mediaType = null;

  if (payload.file) {
    const fileExt = payload.file.name.split(".").pop()?.toLowerCase();
    mediaType = fileExt === "pdf" ? "pdf" : "image";

    const safeName = payload.file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${payload.studentId}_${payload.facultyId}/${Date.now()}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("progress_chat_attachments")
      .upload(fileName, payload.file, { upsert: true });

    if (uploadError)
      throw new Error(`Media upload failed: ${uploadError.message}`);

    // Save the path instead of publicUrl because it's a private bucket!
    mediaUrl = uploadData.path;
  }

  const now = new Date().toISOString();

  const insertData: any = {
    studentId: payload.studentId,
    facultyId: payload.facultyId,
    collegeId: payload.collegeId,
    message: payload.message?.trim() || null,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    senderRole: payload.senderRole,
    senderUserId: payload.senderUserId,
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from("student_progress_chats")
    .insert(insertData)
    .select("chatId")
    .single();

  if (error) throw new Error(error.message);

  return await fetchSingleProgressChatMessage(data.chatId);
}

export async function markProgressMessagesAsRead(
  studentId: number,
  facultyId: number,
  receiverRole: "STUDENT" | "PARENT" | "FACULTY",
) {
  // If I am a Faculty, I mark messages sent by STUDENT/PARENT as read.
  // If I am a STUDENT/PARENT, I mark messages sent by FACULTY as read.
  const senderRolesToMark =
    receiverRole === "FACULTY" ? ["STUDENT", "PARENT"] : ["FACULTY"];

  await supabase
    .from("student_progress_chats")
    .update({ isRead: true })
    .eq("studentId", studentId)
    .eq("facultyId", facultyId)
    .in("senderRole", senderRolesToMark)
    .eq("isRead", false);
}

export async function editProgressChatMessage(chatId: number, message: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_progress_chats")
    .update({
      message: message.trim(),
      updatedAt: now,
    })
    .eq("chatId", chatId)
    .select()
    .single();

  if (error) throw error;
  return formatProgressChatMessage(data);
}

export async function deleteProgressChatMessage(chatId: number) {
  const { error } = await supabase
    .from("student_progress_chats")
    .delete()
    .eq("chatId", chatId);

  if (error) throw error;
}

export async function deleteProgressChatMessages(chatIds: number[]) {
  const { error } = await supabase
    .from("student_progress_chats")
    .delete()
    .in("chatId", chatIds);

  if (error) throw error;
}
