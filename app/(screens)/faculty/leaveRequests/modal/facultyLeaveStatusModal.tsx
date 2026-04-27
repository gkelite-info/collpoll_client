"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Paperclip,
  PaperPlaneRight,
  CalendarBlank,
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

interface FacultyLeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveData: any;
  currentFacultyId: number;
}

export default function FacultyLeaveDetailsModal({
  isOpen,
  onClose,
  leaveData,
  currentFacultyId,
}: FacultyLeaveDetailsModalProps) {
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
      markMessagesAsRead(leaveData.id, "FACULTY");
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
          if (payload.new.senderRole !== "FACULTY") {
            const newMsg = await fetchSingleChatMessage(payload.new.chatId);
            if (newMsg) {
              setMessages((prev) => {
                if (prev.some((m) => m.chatId === newMsg.chatId)) return prev;
                return [...prev, newMsg];
              });
              markMessagesAsRead(leaveData.id, "FACULTY");
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
        if (payload.payload.role !== "FACULTY") {
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
      payload: { role: "FACULTY", isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: "FACULTY", isTyping: false },
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
        senderId: currentFacultyId,
        senderRole: "FACULTY",
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
        payload: { role: "FACULTY", isTyping: false },
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
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-[850px] h-[80vh] flex overflow-hidden animate-in fade-in duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 text-gray-500 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full p-1.5 shadow-sm transition-all cursor-pointer"
        >
          <X size={12} weight="bold" />
        </button>

        <div className="w-[30%] min-w-[220px] bg-gray-50/50 border-r border-gray-200 p-3 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar">
          <div className="bg-[#10B9810F] border border-gray-200 rounded-lg p-3 flex flex-col items-center shadow-sm">
            <img
              src={leaveData.photo}
              alt="Student"
              className="w-12 h-12 rounded-full object-cover shadow-sm mb-1.5 border border-gray-100"
            />
            <h3 className="font-bold text-[#282828] text-[13px] text-center leading-tight truncate w-full">
              {leaveData.name}
            </h3>
            <span className="text-[#43C17A] font-bold text-[10px] mb-2">
              ID: #{leaveData.rollNo}
            </span>

            <div className="w-full flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Education</span>
                <span className="font-semibold text-[#282828]">B.Tech</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Branch</span>
                <span className="font-semibold text-[#282828] truncate max-w-[80px] text-right">
                  {leaveData.branch}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Semester</span>
                <span className="font-semibold text-[#282828]">
                  {leaveData.semester}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#10B9810F] border border-gray-200 rounded-lg p-3 flex flex-col shadow-sm">
            <h4 className="font-bold text-[#282828] text-[10px] uppercase tracking-wider mb-2">
              Leave Info
            </h4>

            <div className="flex flex-col gap-2 text-[11px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 text-[9px] uppercase tracking-wide">
                  Requested Date
                </span>
                <div className="flex items-center gap-1 font-semibold text-[#282828]">
                  <CalendarBlank size={12} className="text-gray-400" />
                  {leaveData.fromDate}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 text-[9px] uppercase tracking-wide">
                  Leave Period
                </span>
                <div className="flex items-center gap-1 font-semibold text-[#282828]">
                  <CalendarBlank size={12} className="text-gray-400" />
                  {leaveData.fromDate} - {leaveData.toDate}
                </div>
              </div>

              <div className="flex justify-between items-center mt-0.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wide">
                    Leave Type
                  </span>
                  <span className="bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded text-[9px] w-fit">
                    {leaveData.leaveType}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wide">
                    Total Days
                  </span>
                  <span className="text-[#43C17A] font-bold">
                    {leaveData.days} Days
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 mt-1 border-t border-gray-100 pt-1.5">
                <span className="text-gray-400 text-[9px] uppercase tracking-wide">
                  Reason
                </span>
                <p className="text-gray-600 italic text-[10px] leading-snug line-clamp-3 hover:line-clamp-none">
                  "{leaveData.description}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="px-4 py-2.5 bg-white z-10 shrink-0 shadow-sm border-b border-gray-100">
            <h2 className="font-bold text-[#282828] text-[14px]">
              Communication History
            </h2>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar"
            ref={chatContainerRef}
            onScroll={handleScroll}
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
                <div className="flex gap-2 w-full max-w-[70%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
                </div>
                <div className="flex gap-2 w-full max-w-[70%] ml-auto flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="h-8 w-full bg-[#43C17A]/30 rounded-xl rounded-tr-sm"></div>
                </div>
                <div className="flex gap-2 w-full max-w-[70%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
                </div>
                <div className="flex gap-2 w-full max-w-[70%] ml-auto flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="h-8 w-full bg-[#43C17A]/30 rounded-xl rounded-tr-sm"></div>
                </div>
                <div className="flex gap-2 w-full max-w-[70%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-xl rounded-tl-sm"></div>
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
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
                    No communication yet.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderRole === "FACULTY";
                    const showNewBadge = !isMe && !msg.isRead; // 🟢 NEW Badge Logic

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
                          className="w-6 h-6 rounded-full object-cover shadow-sm shrink-0 border border-gray-100"
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
                            className={`px-2.5 py-2 rounded-xl text-[12px] relative ${isMe ? "bg-[#43C17A] text-white rounded-tr-sm shadow-sm" : "bg-white text-[#282828] rounded-tl-sm border border-gray-200 shadow-sm"}`}
                          >
                            {msg.mediaUrl && (
                              <div className="mb-1">
                                {msg.mediaType === "image" ? (
                                  <img
                                    src={msg.mediaUrl}
                                    alt="attachment"
                                    className="max-w-[150px] rounded-md cursor-pointer hover:opacity-90"
                                    onClick={() =>
                                      window.open(msg.mediaUrl, "_blank")
                                    }
                                  />
                                ) : (
                                  <a
                                    href={msg.mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
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
                  <div className="flex gap-1.5 mr-auto items-center animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                    <div className="bg-white border border-gray-200 px-2.5 py-2 rounded-xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
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
            className="p-2.5 bg-white border-t border-gray-100 shrink-0"
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
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none text-[12px] text-[#282828] placeholder-gray-400"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || (!newMessage.trim() && !selectedFile)}
                className="bg-[#43C17A] text-white p-1.5 rounded-full hover:bg-[#34a362] transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
              >
                <PaperPlaneRight size={14} weight="fill" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
