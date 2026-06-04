"use client";

import { Avatar } from "@/app/utils/Avatar";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import {
  deleteEmployeeLeaveChatMessage,
  deleteEmployeeLeaveChatMessages,
  fetchEmployeeLeaveChatHistory,
  fetchSingleEmployeeLeaveChatMessage,
  markEmployeeLeaveMessagesAsRead,
  sendEmployeeLeaveChatMessage,
  updateEmployeeLeaveChatMessage,
  type EmployeeLeaveChatMessage,
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveChatAPI";
import { supabase } from "@/lib/supabaseClient";
import {
  Checks,
  Check,
  FilePdf,
  PaperPlaneRight,
  Paperclip,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { FinanceLeaveRequest } from "../data";

const statusClassMap: Record<FinanceLeaveRequest["status"], string> = {
  approved: "text-[#43C17A]",
  pending: "text-orange-400",
  rejected: "text-red-500",
};

const LIMIT = 10;

type LeaveRequestDetailsModalProps = {
  request: FinanceLeaveRequest | null;
  onClose: () => void;
};

export default function LeaveRequestDetailsModal({
  request,
  onClose,
}: LeaveRequestDetailsModalProps) {
  const { userId } = useUser();
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState<number | null>(
    null,
  );
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const requestId = request?.employeeLeaveRequestId;
  const senderRole = "EMPLOYEE";

  useEffect(() => {
    if (!request || !requestId) return;

    loadInitialHistory();
    setupRealtime();
    markEmployeeLeaveMessagesAsRead(requestId, senderRole);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const loadInitialHistory = async () => {
    if (!requestId) return;

    setIsInitialLoading(true);
    try {
      const history = await fetchEmployeeLeaveChatHistory(requestId, 1, LIMIT);
      setMessages(history);
      setPage(1);
      setHasMore(history.length === LIMIT);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Employee leave chat history error:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!requestId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const container = chatContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const nextPage = page + 1;
      const olderMessages = await fetchEmployeeLeaveChatHistory(
        requestId,
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
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Employee leave older chat error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const setupRealtime = () => {
    if (!requestId) return;

    const channel = supabase.channel(`employee_leave_chat_${requestId}`);
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "employee_leave_request_chats",
          filter: `employeeLeaveRequestId=eq.${requestId}`,
        },
        async (payload) => {
          if (
            payload.new.senderRole === senderRole &&
            payload.new.senderUserId === userId
          ) {
            return;
          }

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
          markEmployeeLeaveMessagesAsRead(requestId, senderRole);
          setTimeout(scrollToBottom, 100);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "employee_leave_request_chats",
          filter: `employeeLeaveRequestId=eq.${requestId}`,
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
          filter: `employeeLeaveRequestId=eq.${requestId}`,
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
        if (payload.payload.role !== senderRole) {
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
      payload: { role: senderRole, isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: senderRole, isTyping: false },
      });
    }, 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestId || !userId || (!newMessage.trim() && !selectedFile)) return;

    const messageText = newMessage;
    const file = selectedFile;
    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(true);
    setTimeout(scrollToBottom, 50);

    try {
      const savedMessage = await sendEmployeeLeaveChatMessage({
        employeeLeaveRequestId: requestId,
        message: messageText,
        file: file || undefined,
        senderUserId: Number(userId),
        senderRole,
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
        payload: { role: senderRole, isTyping: false },
      });
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error("Employee leave send chat error:", error);
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
    if (!userId || !editingText.trim()) return;

    setIsUpdatingMessage(true);
    try {
      const updatedMessage = await updateEmployeeLeaveChatMessage({
        chatId,
        message: editingText,
        senderUserId: Number(userId),
        senderRole,
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

  const initiateDeleteMessage = (chatId: number) => {
    setMessageIdToDelete(chatId);
    setIsDeleteModalOpen(true);
  };

  const initiateBulkDelete = () => {
    setIsBulkDelete(true);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!userId) return;

    setIsDeletingMessage(true);
    try {
      if (isBulkDelete) {
        const deletedIds = await deleteEmployeeLeaveChatMessages({
          chatIds: selectedMessageIds,
          senderUserId: Number(userId),
          senderRole,
        });

        setMessages((prev) =>
          prev.filter((message) => !deletedIds.includes(message.chatId)),
        );
        if (editingMessageId && deletedIds.includes(editingMessageId)) {
          cancelEditingMessage();
        }

        if (deletedIds.length > 0) {
          toast.success(`Deleted ${deletedIds.length} message(s).`);
        }
        const failedCount = selectedMessageIds.length - deletedIds.length;
        if (failedCount > 0) {
          toast.error(
            `Could not delete ${failedCount} message(s) because they may have been seen or already deleted.`,
          );
        }

        setIsSelectionMode(false);
        setSelectedMessageIds([]);
        setIsBulkDelete(false);
      } else if (messageIdToDelete !== null) {
        const deletedChatId = await deleteEmployeeLeaveChatMessage({
          chatId: messageIdToDelete,
          senderUserId: Number(userId),
          senderRole,
        });
        setMessages((prev) =>
          prev.filter((message) => message.chatId !== deletedChatId),
        );
        if (editingMessageId === messageIdToDelete) cancelEditingMessage();
        setMessageIdToDelete(null);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete message",
      );
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const cancelDeleteMessage = () => {
    setIsDeleteModalOpen(false);
    setMessageIdToDelete(null);
    setIsBulkDelete(false);
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

  const formatRoleLabel = (role: string) =>
    role
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\bHr\b/g, "HR")
      .replace(/\bH R\b/g, "HR")
      .trim();

  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-[650px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-[15px] font-bold text-[#282828]">
            Leave Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-2.5 cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-400 transition-colors hover:text-red-500"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 border-b border-gray-100 bg-white p-4 md:grid-cols-4">
          <DetailStat label="Request Sent" value={request.requestedDate} />
          <DetailStat label="Duration" value={request.dateRange} />
          <DetailStat
            label="Status"
            value={request.status}
            valueClass={`capitalize ${statusClassMap[request.status]}`}
          />
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Leave Type
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#282828]">
              <div className="h-2 w-2 rounded-full bg-[#43C17A]" />
              {request.leaveType}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden whitespace-nowrap border-b border-gray-100 bg-gray-50 px-5 py-3 text-[13px] font-bold text-[#282828]">
          <span>
            {isSelectionMode
              ? `${selectedMessageIds.length} Selected`
              : "Communication History"}
          </span>
          <div className="flex items-center gap-2.5">
            {isSelectionMode && selectedMessageIds.length > 0 && (
              <button
                type="button"
                onClick={initiateBulkDelete}
                className="flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-bold text-[#FF4B4B] hover:underline"
              >
                <Trash size={13} weight="bold" />
                Delete ({selectedMessageIds.length})
              </button>
            )}
            {(isSelectionMode ||
              messages.some(
                (message) =>
                  message.senderUserId === Number(userId) && !message.isRead,
              )) && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode((current) => !current);
                  setSelectedMessageIds([]);
                }}
                className="shrink-0 cursor-pointer whitespace-nowrap text-[11px] font-bold text-[#43C17A] hover:underline"
              >
                {isSelectionMode ? "Cancel" : "Select Messages"}
              </button>
            )}
          </div>
        </div>

        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4"
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
                <div className="flex flex-1 items-center justify-center text-[11px] italic text-gray-400">
                  No communication yet
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.senderUserId === Number(userId);
                  const showNewBadge = !isMe && !message.isRead;
                  const canEdit = isMe && !message.isRead && !!message.message;
                  const canDelete = isMe && !message.isRead;
                  const isEditing = editingMessageId === message.chatId;

                  return (
                    <div
                      key={message.chatId}
                      onClick={() => {
                        if (isSelectionMode && canDelete) {
                          setSelectedMessageIds((prev) =>
                            prev.includes(message.chatId)
                              ? prev.filter((id) => id !== message.chatId)
                              : [...prev, message.chatId],
                          );
                        }
                      }}
                      className={`group flex w-full max-w-[85%] gap-1.5 ${
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      } ${isSelectionMode && canDelete ? "cursor-pointer select-none" : ""}`}
                    >
                      {isSelectionMode && canDelete && (
                        <div className="mr-2 flex shrink-0 items-center self-center px-1">
                          <input
                            type="checkbox"
                            checked={selectedMessageIds.includes(message.chatId)}
                            onChange={() => {}}
                            className="pointer-events-none h-4 w-4 accent-[#43C17A]"
                          />
                        </div>
                      )}
                      <Avatar
                        src={message.senderAvatar}
                        size={24}
                        alt={message.senderName}
                      />

                      <div
                        className={`flex flex-col gap-0.5 ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold ${
                            isMe ? "text-[#43C17A]" : "text-[#43C17A]"
                          }`}
                        >
                          {isMe ? "You" : message.senderName}
                          <span className="ml-1 text-gray-400">
                            • {formatRoleLabel(message.senderDisplayRole)}
                          </span>
                        </span>

                        <div
                          className={`relative rounded-xl px-3 py-2 text-[12px] shadow-sm ${
                            isMe
                              ? "rounded-tr-sm bg-[#43C17A] text-white"
                              : "rounded-tl-sm border border-gray-200 bg-white text-[#282828]"
                          }`}
                        >
                          {message.mediaUrl && (
                            <div className="mb-1.5">
                              {message.mediaType === "image" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={message.mediaUrl}
                                  alt="attachment"
                                  className="max-w-[160px] cursor-pointer rounded-md hover:opacity-90"
                                  onClick={() =>
                                    window.open(message.mediaUrl ?? "", "_blank")
                                  }
                                />
                              ) : (
                                <a
                                  href={message.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 transition ${
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
                            <div className="flex min-w-45 items-center gap-1">
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
                          {canEdit && !isEditing && !isSelectionMode && (
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
                                  initiateDeleteMessage(message.chatId)
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
                  <div className="rounded-xl rounded-tr-sm border border-[#43C17A]/10 bg-[#43C17A]/70 px-3 py-2 text-[11px] italic text-white shadow-sm">
                    Sending...
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="mr-auto flex animate-pulse items-center gap-1.5">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-1 rounded-xl rounded-tl-sm border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
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
          className="shrink-0 border-t border-gray-100 bg-white p-3"
        >
          {selectedFile && (
            <div className="mb-2 flex w-fit items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
              <Paperclip size={12} className="text-gray-500" />
              <span className="max-w-[120px] truncate text-[11px] font-medium text-gray-700">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 cursor-pointer text-red-500 hover:text-red-700"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#F8F9FA] py-1 pl-3 pr-1 transition-all focus-within:border-[#43C17A] focus-within:shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="shrink-0 cursor-pointer p-1 text-gray-400 transition hover:text-gray-600"
            >
              <Paperclip size={18} weight="bold" />
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
              placeholder="Type your message"
              disabled={isSending}
              className="flex-1 bg-transparent text-[13px] text-[#282828] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isSending || (!newMessage.trim() && !selectedFile)}
              className="shrink-0 cursor-pointer rounded-full bg-[#43C17A] p-2 text-white shadow-sm transition-colors hover:bg-[#34a362] disabled:opacity-50"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          </div>
        </form>
      </div>

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onConfirm={confirmDeleteMessage}
        onCancel={cancelDeleteMessage}
        isDeleting={isDeletingMessage}
        title="Delete"
        name={
          isBulkDelete ? `${selectedMessageIds.length} message(s)` : "message"
        }
        confirmText="Yes, Delete"
        actionType="remove"
      />
    </div>
  );
}

function ChatShimmer() {
  return (
    <div className="flex w-full flex-col gap-4 animate-pulse">
      <div className="mr-auto flex w-full max-w-[75%] gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
        <div className="h-10 w-full rounded-xl rounded-tl-sm bg-gray-200" />
      </div>
      <div className="ml-auto flex w-full max-w-[75%] flex-row-reverse gap-2">
        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
        <div className="h-10 w-full rounded-xl rounded-tr-sm bg-[#43C17A]/30" />
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  valueClass = "text-[#282828]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className={`text-[12px] font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}


