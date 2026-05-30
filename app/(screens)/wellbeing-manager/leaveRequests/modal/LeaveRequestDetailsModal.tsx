"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Paperclip,
  PaperPlaneRight,
  Checks,
  Check,
  FilePdf,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
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

interface LeaveRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveData: any;
}

const LIMIT = 10;

export default function LeaveRequestDetailsModal({
  isOpen,
  onClose,
  leaveData,
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
  const [messageIdToDelete, setMessageIdToDelete] = useState<number | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [activeMessageActionsId, setActiveMessageActionsId] = useState<number | null>(null);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const requestId = leaveData?.employeeLeaveRequestId;
  const senderRole = "EMPLOYEE";

  useEffect(() => {
    if (!isOpen || !requestId) return;

    loadInitialHistory();
    setupRealtime();
    markEmployeeLeaveMessagesAsRead(requestId, senderRole);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, requestId]);

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
          if (payload.new.senderRole === senderRole) return;

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

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId || !userId || (!newMessage.trim() && !selectedFile)) return;

    const msgText = newMessage;
    const fileObj = selectedFile;
    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(true);
    setTimeout(scrollToBottom, 50);

    try {
      const savedMessage = await sendEmployeeLeaveChatMessage({
        employeeLeaveRequestId: requestId,
        message: msgText,
        file: fileObj || undefined,
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
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      setNewMessage(msgText);
      setSelectedFile(fileObj);
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

        if (deletedIds.length > 0) {
          setMessages((prev) =>
            prev.filter((message) => !deletedIds.includes(message.chatId))
          );
          if (editingMessageId && deletedIds.includes(editingMessageId)) {
            cancelEditingMessage();
          }
          toast.success(`Deleted ${deletedIds.length} message(s).`);
          const failedCount = selectedMessageIds.length - deletedIds.length;
          if (failedCount > 0) {
            toast.error(
              `Could not delete ${failedCount} message(s) because they may have been seen or already deleted.`
            );
          }
        } else {
          toast.error("Failed to delete selected messages.");
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

  const formatChatTime = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  if (!isOpen || !leaveData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-5">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0 relative">
          <h2 className="text-[15px] font-bold text-[#282828]">
            Leave Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 bg-gray-50 rounded-full p-1.5 transition-colors cursor-pointer absolute right-3 top-2.5"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Request Sent
            </span>
            <span className="font-bold text-[#282828] text-[12px]">
              {leaveData.requestedDate || leaveData.fromDate}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Duration
            </span>
            <span className="font-bold text-[#282828] text-[12px] whitespace-nowrap max-md:whitespace-normal">
              {leaveData.fromDate} - {leaveData.toDate}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Status
            </span>
            <span
              className={`text-[12px] font-bold capitalize ${leaveData.status === "approved" ? "text-[#43C17A]" : leaveData.status === "rejected" ? "text-red-500" : "text-orange-400"}`}
            >
              {leaveData.status}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Leave Type
            </span>
            <div className="flex items-center justify-center gap-1.5 font-bold text-[#282828] text-[12px]">
              <div className="w-2 h-2 rounded-full bg-[#43C17A]"></div>
              {leaveData.leaveType}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-2 text-[#282828] font-bold shrink-0 bg-gray-50 border-b border-gray-100 text-[13px] whitespace-nowrap overflow-hidden">
          <span>{isSelectionMode ? `${selectedMessageIds.length} Selected` : "Communication History"}</span>
          <div className="flex items-center gap-2.5">
            {isSelectionMode && selectedMessageIds.length > 0 && (
              <button
                type="button"
                onClick={initiateBulkDelete}
                className="text-[#FF4B4B] text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <Trash size={13} weight="bold" />
                Delete ({selectedMessageIds.length})
              </button>
            )}
            {(isSelectionMode || messages.some((msg) => msg.senderUserId === Number(userId) && !msg.isRead)) && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedMessageIds([]);
                }}
                className="text-[#43C17A] text-[11px] font-bold hover:underline cursor-pointer shrink-0 whitespace-nowrap"
              >
                {isSelectionMode ? "Cancel" : "Select Messages"}
              </button>
            )}
          </div>
        </div>

        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar"
        >
          {isInitialLoading ? (
            <div className="flex flex-col gap-3 animate-pulse w-full">
              <div className="flex gap-2 w-full max-w-[70%] mr-auto">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
              </div>
              <div className="flex gap-2 w-full max-w-[70%] ml-auto flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-8 w-full bg-[#43C17A]/30 rounded-xl rounded-tr-sm"></div>
              </div>
            </div>
          ) : (
            <>
              {isLoadingMore && (
                <div className="py-1 text-center text-[10px] text-gray-400">
                  Loading older messages...
                </div>
              )}

              {messages.length === 0 && !isSending ? (
                <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 italic">
                  No communication yet
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderUserId === Number(userId);
                  const showNewBadge = !isMe && !msg.isRead;
                  const canEdit = isMe && !msg.isRead && !!msg.message;
                  const canDelete = isMe && !msg.isRead;
                  const isEditing = editingMessageId === msg.chatId;

                  return (
                    <div
                      key={`${msg.chatId}-${idx}`}
                      onClick={() => {
                        if (isSelectionMode && canDelete) {
                          setSelectedMessageIds((prev) =>
                            prev.includes(msg.chatId)
                              ? prev.filter((id) => id !== msg.chatId)
                              : [...prev, msg.chatId]
                          );
                        }
                      }}
                      className={`group flex gap-1.5 w-full max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"} ${isSelectionMode && canDelete ? "cursor-pointer select-none" : ""}`}
                    >
                      {isSelectionMode && canDelete && (
                        <div className="flex items-center self-center px-1 mr-2 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedMessageIds.includes(msg.chatId)}
                            onChange={() => {}}
                            className="w-4 h-4 accent-[#43C17A] pointer-events-none"
                          />
                        </div>
                      )}
                      <div className="flex-shrink-0">
                        <Avatar src={msg.senderAvatar} size={24} alt="" />
                      </div>

                      <div className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <span className="text-[10px] font-bold text-[#43C17A]">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          onClick={(e) => {
                            if (isSelectionMode) {
                              // Selection click is handled at the row level
                              return;
                            }
                            if (canEdit) {
                              setActiveMessageActionsId(
                                activeMessageActionsId === msg.chatId ? null : msg.chatId
                              );
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-[12px] relative ${isMe
                              ? "bg-[#43C17A] text-white rounded-tr-sm shadow-sm"
                              : "bg-white text-[#282828] rounded-tl-sm border border-gray-200 shadow-sm"
                            } ${canEdit && !isSelectionMode ? "cursor-pointer select-none" : ""}`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-1.5">
                              {msg.mediaType === "image" ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="attachment"
                                  className="max-w-[150px] rounded-md cursor-pointer hover:opacity-90"
                                  onClick={(e) => {
                                    if (isSelectionMode) return; // let it bubble up to row click
                                    e.stopPropagation();
                                    window.open(msg.mediaUrl || "", "_blank");
                                  }}
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => {
                                    if (isSelectionMode) return; // let it bubble up to row click
                                    e.stopPropagation();
                                  }}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition ${isMe ? "bg-black/10 hover:bg-black/20" : "bg-gray-100 hover:bg-gray-200"}`}
                                >
                                  <FilePdf size={14} weight="fill" />
                                  <span className="text-[11px] underline font-medium">
                                    Document
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                          {isEditing ? (
                            <div
                              className="flex min-w-45 items-center gap-1"
                              onClick={(e) => e.stopPropagation()} // prevent toggle when editing
                            >
                              <input
                                value={editingText}
                                onChange={(event) =>
                                  setEditingText(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleUpdateMessage(msg.chatId);
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
                                  handleUpdateMessage(msg.chatId)
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
                          ) : msg.message ? (
                            <p className="leading-snug whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 px-0.5">
                          {canEdit && !isEditing && !isSelectionMode && (
                            <span
                              className={`flex items-center gap-0.5 transition-opacity ${activeMessageActionsId === msg.chatId
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                                }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingMessage(msg);
                                }}
                                className="cursor-pointer rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-[#43C17A] hover:bg-[#E7F8EE] transition-colors"
                                title="Edit message"
                              >
                                <PencilSimple size={12} weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateDeleteMessage(msg.chatId);
                                }}
                                className="cursor-pointer rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-[#FF4B4B] hover:bg-[#FFE5E5] transition-colors"
                                title="Delete message"
                              >
                                <Trash size={12} weight="bold" />
                              </button>
                            </span>
                          )}
                          <span className="text-[9px] text-gray-400 font-medium">
                            {formatChatTime(msg.createdAt)}
                          </span>
                          {showNewBadge && (
                            <span className="bg-[#D32F2F] text-white text-[8px] font-bold px-1 rounded uppercase">
                              New
                            </span>
                          )}
                          {isMe && (
                            <Checks
                              size={12}
                              weight="bold"
                              className={
                                msg.isRead
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
                <div className="flex gap-1.5 ml-auto flex-row-reverse w-full max-w-[85%] animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                  <div className="bg-[#43C17A]/70 text-white border border-[#43C17A]/10 px-2.5 py-1.5 rounded-xl rounded-tr-sm shadow-sm text-[11px] italic">
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
          className="p-3 bg-white border-t border-gray-100 shrink-0"
        >
          {selectedFile && (
            <div className="mb-2 flex items-center gap-1 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-200">
              <Paperclip size={10} className="text-gray-500" />
              <span className="text-[10px] font-medium text-gray-700 truncate max-w-[100px]">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 border border-gray-300 rounded-full pl-2 pr-1 py-1 focus-within:border-[#43C17A] focus-within:shadow-sm transition-all bg-[#F8F9FA]">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer shrink-0 p-1"
            >
              <Paperclip size={16} weight="bold" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message"
              className="flex-1 bg-transparent outline-none text-[13px] text-[#282828] placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isSending || (!newMessage.trim() && !selectedFile)}
              className="bg-[#43C17A] text-white p-2 rounded-full hover:bg-[#34a362] transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
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
        name={isBulkDelete ? `${selectedMessageIds.length} message(s)` : "message"}
        confirmText="Yes, Delete"
        actionType="remove"
      />
    </div>
  );
}
