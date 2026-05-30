"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarBlank,
  Check,
  Checks,
  FilePdf,
  PaperPlaneRight,
  Paperclip,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { Avatar } from "@/app/utils/Avatar";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import {
  deleteEmployeeLeaveChatMessage,
  fetchEmployeeLeaveChatHistory,
  fetchSingleEmployeeLeaveChatMessage,
  markEmployeeLeaveMessagesAsRead,
  sendEmployeeLeaveChatMessage,
  updateEmployeeLeaveChatMessage,
  type EmployeeLeaveChatMessage,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveChatAPI";
import { supabase } from "@/lib/supabaseClient";
import type { HrLeaveRow } from "./types";

type HrLeaveDetailsModalProps = {
  leave: HrLeaveRow | null;
  onClose: () => void;
};

const statusClassMap: Record<HrLeaveRow["status"], string> = {
  approved: "bg-[#E7F8EE] text-[#43C17A]",
  pending: "bg-[#FFF1DC] text-[#FF9F2E]",
  rejected: "bg-[#FFD7D7] text-[#FF2020]",
};

const LIMIT = 10;
const SENDER_ROLE = "COLLEGE_HR";

export default function HrLeaveDetailsModal({
  leave,
  onClose,
}: HrLeaveDetailsModalProps) {
  const { collegeHrId } = useCollegeHr();
  const [messages, setMessages] = useState<EmployeeLeaveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!leave) return;

    loadInitialHistory();
    setupRealtime();
    markEmployeeLeaveMessagesAsRead(leave.id, SENDER_ROLE);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leave?.id]);

  const loadInitialHistory = async () => {
    if (!leave) return;

    setIsInitialLoading(true);
    try {
      const history = await fetchEmployeeLeaveChatHistory(leave.id, 1, LIMIT);
      setMessages(history);
      setPage(1);
      setHasMore(history.length === LIMIT);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("HR employee leave chat history error:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!leave || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const container = chatContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;
      const nextPage = page + 1;
      const olderMessages = await fetchEmployeeLeaveChatHistory(
        leave.id,
        nextPage,
        LIMIT,
      );

      if (olderMessages.length > 0) {
        setMessages((prev) => {
          const nextMessages = olderMessages.filter(
            (message) => !prev.some((item) => item.chatId === message.chatId),
          );
          return [...nextMessages, ...prev];
        });
        setPage(nextPage);
        setHasMore(olderMessages.length === LIMIT);
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("HR employee leave older chat error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const setupRealtime = () => {
    if (!leave) return;

    const channel = supabase.channel(`employee_leave_chat_${leave.id}`);
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "employee_leave_request_chats",
          filter: `employeeLeaveRequestId=eq.${leave.id}`,
        },
        async (payload) => {
          if (payload.new.senderRole === SENDER_ROLE) return;

          const newMsg = await fetchSingleEmployeeLeaveChatMessage(
            payload.new.employeeLeaveRequestChatId,
          );
          if (!newMsg) return;

          setMessages((prev) => {
            if (prev.some((message) => message.chatId === newMsg.chatId)) {
              return prev;
            }
            return [...prev, newMsg];
          });
          markEmployeeLeaveMessagesAsRead(leave.id, SENDER_ROLE);
          setTimeout(scrollToBottom, 100);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "employee_leave_request_chats",
          filter: `employeeLeaveRequestId=eq.${leave.id}`,
        },
        async (payload) => {
          if (payload.new.is_deleted) {
            setMessages((prev) =>
              prev.filter(
                (message) =>
                  message.chatId !== payload.new.employeeLeaveRequestChatId,
              ),
            );
            return;
          }

          const updatedMsg = await fetchSingleEmployeeLeaveChatMessage(
            payload.new.employeeLeaveRequestChatId,
          );

          setMessages((prev) =>
            prev.map((message) =>
              message.chatId === payload.new.employeeLeaveRequestChatId
                ? updatedMsg ?? { ...message, isRead: true }
                : message,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "employee_leave_request_chats",
          filter: `employeeLeaveRequestId=eq.${leave.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter(
              (message) =>
                message.chatId !== payload.old.employeeLeaveRequestChatId,
            ),
          );
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.role !== SENDER_ROLE) {
          setIsTyping(payload.payload.isTyping);
          setTimeout(scrollToBottom, 100);
        }
      })
      .subscribe();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (chatContainerRef.current?.scrollTop === 0) loadMoreMessages();
  };

  const handleTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { role: SENDER_ROLE, isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: SENDER_ROLE, isTyping: false },
      });
    }, 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!leave || !collegeHrId || (!newMessage.trim() && !selectedFile)) return;

    const messageText = newMessage;
    const file = selectedFile;
    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(true);
    setTimeout(scrollToBottom, 50);

    try {
      const savedMessage = await sendEmployeeLeaveChatMessage({
        employeeLeaveRequestId: leave.id,
        message: messageText,
        file: file || undefined,
        senderCollegeHrId: collegeHrId,
        senderRole: SENDER_ROLE,
      });

      if (savedMessage) {
        setMessages((prev) => {
          if (prev.some((message) => message.chatId === savedMessage.chatId)) {
            return prev;
          }
          return [...prev, savedMessage];
        });
      }

      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: SENDER_ROLE, isTyping: false },
      });
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error("HR employee leave send chat error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
      setNewMessage(messageText);
      setSelectedFile(file);
    } finally {
      setIsSending(false);
    }
  };

  const startEditingMessage = (message: EmployeeLeaveChatMessage) => {
    setEditingMessageId(message.chatId);
    setEditingText(message.message ?? "");
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleUpdateMessage = async (chatId: number) => {
    if (!collegeHrId || !editingText.trim()) return;

    setIsUpdatingMessage(true);
    try {
      const updatedMessage = await updateEmployeeLeaveChatMessage({
        chatId,
        message: editingText,
        senderCollegeHrId: collegeHrId,
        senderRole: SENDER_ROLE,
      });

      if (updatedMessage) {
        setMessages((prev) =>
          prev.map((message) =>
            message.chatId === chatId ? updatedMessage : message,
          ),
        );
      }
      cancelEditingMessage();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to edit message",
      );
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const handleDeleteMessage = async (chatId: number) => {
    if (!collegeHrId) return;

    try {
      const deletedChatId = await deleteEmployeeLeaveChatMessage({
        chatId,
        senderCollegeHrId: collegeHrId,
        senderRole: SENDER_ROLE,
      });
      setMessages((prev) =>
        prev.filter((message) => message.chatId !== deletedChatId),
      );
      if (editingMessageId === chatId) cancelEditingMessage();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete message",
      );
    }
  };

  const formatChatTime = (date: string) =>
    new Date(date)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");

  if (!leave) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-[850px] overflow-hidden rounded-xl bg-gray-50 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-50 cursor-pointer rounded-full bg-gray-100 p-1.5 text-gray-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
        >
          <X size={12} weight="bold" />
        </button>

        <aside className="custom-scrollbar flex w-[30%] min-w-[230px] flex-col gap-2.5 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-3">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-[#10B9810F] p-3 shadow-sm">
            <Avatar src={leave.photo ?? undefined} size={48} alt={leave.name} />
            <h3 className="mt-2 w-full truncate text-center text-[13px] font-bold leading-tight text-[#282828]">
              {leave.name}
            </h3>
            <span className="mb-2 text-[10px] font-bold text-[#43C17A]">
              ID: #{leave.employeeId}
            </span>

            <div className="flex w-full flex-col gap-1 text-[11px]">
              <InfoRow label="Role" value={leave.role} />
              <InfoRow label="Employee ID" value={leave.employeeId} />
              <InfoRow
                label="Status"
                value={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              />
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-gray-200 bg-[#10B9810F] p-3 shadow-sm">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#282828]">
              Leave Info
            </h4>

            <div className="flex flex-col gap-2 text-[11px]">
              <DetailLine label="Requested Date" value={leave.fromDate} />
              <DetailLine
                label="Leave Period"
                value={`${leave.fromDate} - ${leave.toDate}`}
              />

              <div className="mt-0.5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Leave Type
                  </span>
                  <span className="w-fit rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                    {leave.leaveType}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Total Days
                  </span>
                  <span className="font-bold text-[#43C17A]">
                    {leave.days} Days
                  </span>
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-0.5 border-t border-gray-100 pt-1.5">
                <span className="text-[9px] uppercase tracking-wide text-gray-400">
                  Reason
                </span>
                <p className="text-[10px] italic leading-snug text-gray-600">
                  &quot;{leave.description}&quot;
                </p>
              </div>

              <span
                className={`mt-1 inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold ${statusClassMap[leave.status]}`}
              >
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col bg-white">
          <header className="z-10 shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
            <h2 className="text-[14px] font-bold text-[#282828]">
              Communication History
            </h2>
          </header>

          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          >
            {isInitialLoading ? (
              <ChatShimmer />
            ) : (
              <>
                {isLoadingMore && (
                  <div className="py-1 text-center text-[10px] text-gray-400">
                    Loading older messages...
                  </div>
                )}

                {messages.length === 0 && !isSending ? (
                  <div className="flex flex-1 items-center justify-center text-xs italic text-gray-400">
                    No communication yet.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderRole === SENDER_ROLE;
                    const showNewBadge = !isMe && !message.isRead;
                    const canEdit = isMe && !message.isRead && !!message.message;
                    const isEditing = editingMessageId === message.chatId;

                    return (
                      <div
                        key={message.chatId}
                        className={`group flex w-full max-w-[85%] gap-1.5 ${
                          isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <Avatar
                          src={isMe ? message.senderAvatar : leave.photo}
                          size={24}
                          alt={message.senderName}
                        />

                        <div
                          className={`flex flex-col gap-0.5 ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-bold text-[#43C17A]">
                              {message.senderName}
                            </span>
                          )}

                          <div
                            className={`rounded-xl px-2.5 py-2 text-[12px] shadow-sm ${
                              isMe
                                ? "rounded-tr-sm bg-[#43C17A] text-white"
                                : "rounded-tl-sm border border-gray-200 bg-white text-[#282828]"
                            }`}
                          >
                            {message.mediaUrl && (
                              <div className="mb-1">
                                {message.mediaType === "image" ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={message.mediaUrl}
                                    alt="attachment"
                                    className="max-w-[150px] cursor-pointer rounded-md hover:opacity-90"
                                    onClick={() =>
                                      window.open(
                                        message.mediaUrl ?? "",
                                        "_blank",
                                      )
                                    }
                                  />
                                ) : (
                                  <a
                                    href={message.mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition ${
                                      isMe
                                        ? "bg-black/10 hover:bg-black/20"
                                        : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                                  >
                                    <FilePdf size={14} weight="fill" />
                                    <span className="text-[11px] font-medium underline">
                                      Document
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}
                            {isEditing ? (
                              <div className="flex min-w-[180px] items-center gap-1">
                                <input
                                  value={editingText}
                                  onChange={(event) =>
                                    setEditingText(event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      handleUpdateMessage(message.chatId);
                                    }
                                    if (event.key === "Escape") {
                                      event.preventDefault();
                                      cancelEditingMessage();
                                    }
                                  }}
                                  disabled={isUpdatingMessage}
                                  className="h-8 flex-1 rounded-md border border-white/40 bg-white px-2 text-[12px] text-[#282828] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateMessage(message.chatId)
                                  }
                                  disabled={
                                    isUpdatingMessage || !editingText.trim()
                                  }
                                  className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30 disabled:opacity-50"
                                  title="Save edit"
                                >
                                  <Check size={12} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingMessage}
                                  disabled={isUpdatingMessage}
                                  className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30 disabled:opacity-50"
                                  title="Cancel edit"
                                >
                                  <X size={12} weight="bold" />
                                </button>
                              </div>
                            ) : message.message ? (
                              <p className="whitespace-pre-wrap leading-snug">
                                {message.message}
                              </p>
                            ) : null}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1 px-0.5">
                            {canEdit && !isEditing && (
                              <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => startEditingMessage(message)}
                                  className="cursor-pointer rounded px-1 text-[9px] font-semibold text-[#43C17A] hover:bg-[#E7F8EE]"
                                  title="Edit message"
                                >
                                  <PencilSimple size={10} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteMessage(message.chatId)
                                  }
                                  className="cursor-pointer rounded px-1 text-[9px] font-semibold text-[#FF4B4B] hover:bg-[#FFE5E5]"
                                  title="Delete message"
                                >
                                  <Trash size={10} weight="bold" />
                                </button>
                              </span>
                            )}
                            <span className="text-[9px] font-medium text-gray-400">
                              {formatChatTime(message.createdAt)}
                            </span>
                            {showNewBadge && (
                              <span className="rounded bg-[#D32F2F] px-1 text-[8px] font-bold uppercase text-white">
                                New
                              </span>
                            )}
                            {isMe && (
                              <Checks
                                size={12}
                                weight="bold"
                                className={
                                  message.isRead
                                    ? "text-[#34B7F1]"
                                    : "text-gray-300"
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isSending && (
                  <div className="ml-auto flex w-full max-w-[85%] animate-pulse flex-row-reverse gap-1.5">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                    <div className="rounded-xl rounded-tr-sm border border-[#43C17A]/10 bg-[#43C17A]/70 px-2.5 py-1.5 text-[11px] italic text-white shadow-sm">
                      Sending...
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="mr-auto flex animate-pulse items-center gap-1.5">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                    <div className="flex items-center gap-1 rounded-xl rounded-tl-sm border border-gray-200 bg-white px-2.5 py-2 shadow-sm">
                      <div className="h-1 w-1 animate-bounce rounded-full bg-gray-400" />
                      <div
                        className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="shrink-0 border-t border-gray-100 bg-white p-2.5"
          >
            {selectedFile && (
              <div className="mb-2 flex w-fit items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
                <Paperclip size={10} className="text-gray-500" />
                <span className="max-w-[100px] truncate text-[10px] font-medium text-gray-700">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-1 cursor-pointer text-red-500 hover:text-red-700"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#F8F9FA] py-1 pl-2 pr-1 transition-all focus-within:border-[#43C17A] focus-within:shadow-sm">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  fileInputRef.current?.click();
                }}
                className="shrink-0 cursor-pointer p-1 text-gray-400 transition hover:text-gray-600"
              >
                <Paperclip size={16} weight="bold" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 bg-transparent text-[12px] text-[#282828] outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={isSending || (!newMessage.trim() && !selectedFile)}
                className="shrink-0 cursor-pointer rounded-full bg-[#43C17A] p-1.5 text-white shadow-sm transition-colors hover:bg-[#34a362] disabled:opacity-50"
              >
                <PaperPlaneRight size={14} weight="fill" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[110px] truncate text-right font-semibold text-[#282828]">
        {value}
      </span>
    </div>
  );
}

function ChatShimmer() {
  return (
    <div className="flex w-full flex-col gap-3 animate-pulse">
      <div className="mr-auto flex w-full max-w-[70%] gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
        <div className="h-10 w-full rounded-xl rounded-tl-sm bg-gray-200" />
      </div>
      <div className="ml-auto flex w-full max-w-[70%] flex-row-reverse gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
        <div className="h-8 w-full rounded-xl rounded-tr-sm bg-[#43C17A]/30" />
      </div>
      <div className="mr-auto flex w-full max-w-[70%] gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
        <div className="h-10 w-full rounded-xl rounded-tl-sm bg-gray-200" />
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-1 font-semibold text-[#282828]">
        <CalendarBlank size={12} className="text-gray-400" />
        {value}
      </div>
    </div>
  );
}
