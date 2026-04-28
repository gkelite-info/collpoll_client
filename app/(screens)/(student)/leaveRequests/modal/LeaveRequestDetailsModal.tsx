"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Paperclip,
  PaperPlaneRight,
  FilePdf,
  Checks,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchLeaveChatHistory,
  fetchSingleChatMessage,
  sendLeaveChatMessage,
  markMessagesAsRead,
} from "@/lib/helpers/student/leave request/leaveChatAPI";
import toast from "react-hot-toast";

interface StudentLeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveData: any;
  currentStudentId: number;
}

export default function StudentLeaveDetailsModal({
  isOpen,
  onClose,
  leaveData,
  currentStudentId,
}: StudentLeaveDetailsModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const LIMIT = 10;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && leaveData) {
      loadInitialHistory();
      setupRealtime();
      markMessagesAsRead(leaveData.id, "STUDENT");
    }
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [isOpen, leaveData]);

  const loadInitialHistory = async () => {
    setIsInitialLoading(true);
    try {
      const history = await fetchLeaveChatHistory(leaveData.id, 1, LIMIT);
      setMessages(history);
      setPage(1);
      setHasMore(history.length === LIMIT);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      toast.error("Failed to load chat history");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const container = chatContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const nextPage = page + 1;
      const olderMessages = await fetchLeaveChatHistory(
        leaveData.id,
        nextPage,
        LIMIT,
      );

      if (olderMessages.length > 0) {
        setMessages((prev) => {
          const newMsgs = olderMessages.filter(
            (o) => !prev.some((p) => p.chatId === o.chatId),
          );
          return [...newMsgs, ...prev];
        });
        setPage(nextPage);
        setHasMore(olderMessages.length === LIMIT);
        requestAnimationFrame(() => {
          if (container)
            container.scrollTop = container.scrollHeight - prevScrollHeight;
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current?.scrollTop === 0) loadMoreMessages();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtime = () => {
    const channel = supabase.channel(`leave_chat_${leaveData.id}`);
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leave_request_chats",
          filter: `studentLeaveId=eq.${leaveData.id}`,
        },
        async (payload) => {
          if (payload.new.senderRole !== "STUDENT") {
            const newMsg = await fetchSingleChatMessage(payload.new.chatId);
            if (newMsg) {
              setMessages((prev) => {
                if (prev.some((m) => m.chatId === newMsg.chatId)) return prev;
                return [...prev, newMsg];
              });
              markMessagesAsRead(leaveData.id, "STUDENT");
              setTimeout(() => scrollToBottom(), 100);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leave_request_chats",
          filter: `studentLeaveId=eq.${leaveData.id}`,
        },
        () => setMessages((prev) => prev.map((m) => ({ ...m, isRead: true }))),
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.role !== "STUDENT") {
          setIsTyping(payload.payload.isTyping);
          setTimeout(() => scrollToBottom(), 100);
        }
      })
      .subscribe();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { role: "STUDENT", isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: "STUDENT", isTyping: false },
      });
    }, 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const msgText = newMessage;
    const fileObj = selectedFile;
    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(true);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const savedMsg = await sendLeaveChatMessage({
        studentLeaveId: leaveData.id,
        message: msgText,
        file: fileObj || undefined,
        senderId: currentStudentId,
        senderRole: "STUDENT",
      });
      if (savedMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.chatId === savedMsg.chatId)) return prev;
          return [...prev, savedMsg];
        });
      }
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: "STUDENT", isTyping: false },
      });
      setTimeout(() => scrollToBottom(), 50);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      setNewMessage(msgText);
      setSelectedFile(fileObj);
    } finally {
      setIsSending(false);
    }
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* 🟢 INCREASED WIDTH: max-w-[650px] for better spacing */}
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
              {leaveData.fromDate}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Duration
            </span>
            <span className="font-bold text-[#282828] text-[12px] whitespace-nowrap">
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

        <div className="px-5 py-3 flex items-center gap-1.5 text-[#282828] font-bold shrink-0 bg-gray-50 border-b border-gray-100 text-[13px]">
          Communication History
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {isInitialLoading ? (
            <div className="flex flex-col gap-4 animate-pulse w-full">
              <div className="flex gap-2 w-full max-w-[75%] mr-auto">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
              </div>
              <div className="flex gap-2 w-full max-w-[75%] ml-auto flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-10 w-full bg-[#43C17A]/30 rounded-xl rounded-tr-sm"></div>
              </div>
              <div className="flex gap-2 w-full max-w-[75%] mr-auto">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
              </div>
              <div className="flex gap-2 w-full max-w-[75%] ml-auto flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-10 w-full bg-[#43C17A]/30 rounded-xl rounded-tr-sm"></div>
              </div>
            </div>
          ) : (
            <>
              {isLoadingMore && (
                <div className="text-center text-[10px] text-gray-400 py-1">
                  Loading older messages...
                </div>
              )}

              {messages.length === 0 && !isSending ? (
                <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 italic">
                  No communication yet.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderRole === "STUDENT";
                  const showNewBadge = !isMe && !msg.isRead;

                  return (
                    <div
                      key={`${msg.chatId}-${idx}`}
                      className={`flex gap-1.5 w-full max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <img
                        src={
                          msg.senderAvatar ||
                          `https://ui-avatars.com/api/?name=${msg.senderName}&background=random&color=fff`
                        }
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shadow-sm shrink-0 border border-white"
                      />

                      <div
                        className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-[#43C17A]">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          className={`px-3 py-2 rounded-xl text-[12px] relative ${isMe ? "bg-[#43C17A] text-white rounded-tr-sm shadow-sm" : "bg-white text-[#282828] rounded-tl-sm border border-gray-200 shadow-sm"}`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-1.5">
                              {msg.mediaType === "image" ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="attachment"
                                  className="max-w-[160px] rounded-md cursor-pointer hover:opacity-90"
                                  onClick={() =>
                                    window.open(msg.mediaUrl, "_blank")
                                  }
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition ${isMe ? "bg-black/10 hover:bg-black/20" : "bg-gray-100 hover:bg-gray-200"}`}
                                >
                                  <FilePdf size={14} weight="fill" />
                                  <span className="text-[11px] underline font-medium">
                                    Document
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.message && (
                            <p className="leading-snug whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 px-0.5">
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
                                msg.isRead ? "text-[#34B7F1]" : "text-gray-300"
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
                  <div className="bg-[#43C17A]/70 text-white border border-[#43C17A]/10 px-3 py-2 rounded-xl rounded-tr-sm shadow-sm text-[11px] italic">
                    Sending...
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex gap-1.5 mr-auto items-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded-xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
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
            <div className="mb-2 flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1.5 rounded-md border border-gray-200">
              <Paperclip size={12} className="text-gray-500" />
              <span className="text-[11px] font-medium text-gray-700 truncate max-w-[120px]">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 border border-gray-300 rounded-full pl-3 pr-1 py-1 focus-within:border-[#43C17A] focus-within:shadow-sm transition-all bg-[#F8F9FA]">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer shrink-0 p-1"
            >
              <Paperclip size={18} weight="bold" />
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
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#282828] placeholder-gray-400"
              disabled={isSending}
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
    </div>
  );
}
