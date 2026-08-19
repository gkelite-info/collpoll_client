import { useState, useEffect, useRef, useMemo } from "react";
import {
  CaretLeft,
  Smiley,
  PaperPlaneRight,
  ChatCircleDots,
  Paperclip,
  X,
  FilePdf,
  Checks,
  PencilSimple,
  Trash,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import { Parent } from "./parentsList";
import { useQueryClient, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchProgressChatHistory,
  fetchSingleProgressChatMessage,
  sendProgressChatMessage,
  markProgressMessagesAsRead,
  editProgressChatMessage,
  deleteProgressChatMessage,
  deleteProgressChatMessages,
} from "@/lib/helpers/faculty/studentProgress/progressChatAPI";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { Avatar } from "@/app/utils/Avatar";

interface ChatWindowProps {
  parent: Parent;
  studentId: number;
  facultyId: number;
  collegeId: number;
  facultyUserId: number;
  onClose: () => void;
}

export default function ChatWindow({
  parent,
  studentId,
  facultyId,
  collegeId,
  facultyUserId,
  onClose,
}: ChatWindowProps) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Edit/Delete states
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

  // Bulk select states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const LIMIT = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  const {
    data: chatHistoryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInitialLoading,
  } = useInfiniteQuery({
    queryKey: ["progressChat", studentId, facultyId],
    queryFn: ({ pageParam = 1 }) => fetchProgressChatHistory(studentId, facultyId, pageParam, LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length >= LIMIT ? allPages.length + 1 : undefined),
    staleTime: 0,
  });

  const messages = useMemo(() => {
    if (!chatHistoryData) return [];
    const flattened = [...chatHistoryData.pages].reverse().flat();
    const seen = new Set();
    const uniqueMessages = [];
    for (const msg of flattened) {
      if (!seen.has(msg.chatId)) {
        seen.add(msg.chatId);
        uniqueMessages.push(msg);
      }
    }
    return uniqueMessages;
  }, [chatHistoryData]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && chatHistoryData?.pages.length === 1) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [chatHistoryData]);

  useEffect(() => {
    setupRealtime();
    markProgressMessagesAsRead(studentId, facultyId, "FACULTY").then(() => {
      // Broadcast read receipt
      channelRef.current?.send({
        type: "broadcast",
        event: "read_receipt",
        payload: { readerRole: "FACULTY", readerId: facultyUserId },
      });
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [studentId, facultyId]);

  const handleScroll = () => {
    if (chatContainerRef.current?.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      const container = chatContainerRef.current;
      const prevScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - prevScrollHeight;
          }
        });
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtime = () => {
    const channel = supabase.channel(`progress_chat_${studentId}_${facultyId}`);
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "student_progress_chats",
          filter: `studentId=eq.${studentId}`,
        },
        async (payload) => {
          if (payload.new.facultyId !== facultyId) return;
          if (payload.new.senderRole !== "FACULTY") {
            const newMsg = await fetchSingleProgressChatMessage(payload.new.chatId);
            if (newMsg) {
              queryClient.setQueryData(["progressChat", studentId, facultyId], (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
                const newPages = [...oldData.pages];
                if (newPages[0].some((m: any) => m.chatId === newMsg.chatId)) return oldData;
                newPages[0] = [...newPages[0], newMsg];
                return { ...oldData, pages: newPages };
              });
              await markProgressMessagesAsRead(studentId, facultyId, "FACULTY");
              channelRef.current?.send({
                type: "broadcast",
                event: "read_receipt",
                payload: { readerRole: "FACULTY", readerId: facultyUserId },
              });
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
          table: "student_progress_chats",
          filter: `studentId=eq.${studentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["progressChat", studentId, facultyId] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "student_progress_chats",
          filter: `studentId=eq.${studentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["progressChat", studentId, facultyId] });
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.role !== "FACULTY") {
          setIsTyping(payload.payload.isTyping);
          setTimeout(() => scrollToBottom(), 100);
        }
      })
      .on("broadcast", { event: "read_receipt" }, (payload) => {
        if (payload.payload.readerRole !== "FACULTY") {
          queryClient.setQueryData(["progressChat", studentId, facultyId], (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any[]) =>
                page.map((m: any) => (m.senderRole === "FACULTY" && !m.isRead ? { ...m, isRead: true } : m)),
              ),
            };
          });
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      const isSizeValid = file.size <= 5 * 1024 * 1024;
      if (!isSizeValid) toast.error(`${file.name} exceeds 5MB limit.`);
      return isSizeValid;
    });

    setSelectedFiles((prev) => {
      const newFiles = [...prev, ...validFiles];
      if (newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return newFiles.slice(0, 5);
      }
      return newFiles;
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = newMessage.trim();
    if (!msgText && selectedFiles.length === 0) return;

    setIsSending(true);
    try {
      if (selectedFiles.length > 0) {
        // Send files
        for (let i = 0; i < selectedFiles.length; i++) {
          const fileObj = selectedFiles[i];
          const textToAttach = i === 0 ? msgText : undefined;
          
          const savedMsg = await sendProgressChatMessage({
            studentId,
            facultyId,
            collegeId,
            message: textToAttach,
            file: fileObj,
            senderUserId: facultyUserId,
            senderRole: "FACULTY",
          });
          
          if (savedMsg) {
            queryClient.setQueryData(["progressChat", studentId, facultyId], (oldData: any) => {
              if (!oldData || !oldData.pages) return oldData;
              const newPages = [...oldData.pages];
              if (newPages[0].some((m: any) => m.chatId === savedMsg.chatId)) return oldData;
              newPages[0] = [...newPages[0], savedMsg];
              return { ...oldData, pages: newPages };
            });
          }
        }
      } else if (msgText) {
        // Send text only
        const savedMsg = await sendProgressChatMessage({
          studentId,
          facultyId,
          collegeId,
          message: msgText,
          senderUserId: facultyUserId,
          senderRole: "FACULTY",
        });
        
        if (savedMsg) {
          queryClient.setQueryData(["progressChat", studentId, facultyId], (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;
            const newPages = [...oldData.pages];
            if (newPages[0].some((m: any) => m.chatId === savedMsg.chatId)) return oldData;
            newPages[0] = [...newPages[0], savedMsg];
            return { ...oldData, pages: newPages };
          });
        }
      }

      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { role: "FACULTY", isTyping: false },
      });
      setTimeout(() => scrollToBottom(), 50);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message.");
      setNewMessage(msgText);
    } finally {
      setIsSending(false);
      setTimeout(() => messageInputRef.current?.focus(), 50);
    }
  };

  // ----- Edit and Delete logic -----
  const startEditingMessage = (msg: any) => {
    setEditingMessageId(msg.chatId);
    setEditingText(msg.message || "");
    setActiveMenuId(null);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleUpdateMessage = async (chatId: number) => {
    if (!editingText.trim()) return;
    setIsUpdatingMessage(true);
    try {
      await editProgressChatMessage(chatId, editingText);
      cancelEditingMessage();
    } catch (err) {
      toast.error("Failed to update message.");
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const handleDeleteMessage = async (chatId: number) => {
    setActiveMenuId(null);
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteProgressChatMessage(chatId);
    } catch (err) {
      toast.error("Failed to delete message.");
    }
  };

  const handleToggleSelectMessage = (chatId: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId],
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedMessageIds.length) return;
    if (!confirm(`Delete ${selectedMessageIds.length} selected messages?`)) return;

    setIsDeletingBulk(true);
    try {
      await deleteProgressChatMessages(selectedMessageIds);
      setIsSelectionMode(false);
      setSelectedMessageIds([]);
    } catch (error) {
      toast.error("Failed to delete messages");
    } finally {
      setIsDeletingBulk(false);
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

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0 relative">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-[#282828]">Chat</h2>
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 bg-gray-50 rounded-full p-1.5 transition-colors cursor-pointer absolute right-3 top-2.5"
        >
          <X size={16} weight="bold" />
        </button>

        {isSelectionMode ? (
          <div className="flex items-center gap-2 mt-2 px-5 pb-3">
            <span className="text-xs font-semibold text-gray-600">
              {selectedMessageIds.length} Selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk || selectedMessageIds.length === 0}
              className="px-2 py-1 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMessageIds([]);
              }}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="px-5 py-2">
            <button
              onClick={() => setIsSelectionMode(true)}
              className="text-gray-500 hover:text-gray-700 text-xs font-semibold transition cursor-pointer"
            >
              Select Messages
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#E8F6E2] rounded-2xl md:rounded-[24px] p-3 md:p-4 flex items-center justify-between mb-4 md:mb-6 shadow-sm shrink-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Avatar src={parent.avatar} size={50} alt={parent.name} />
          <div className="min-w-0">
            <h3 className="text-[15px] md:text-lg font-bold text-[#1a1a1a] truncate">{parent.name}</h3>
            <p className="text-xs md:text-sm font-medium text-[#555] truncate">{parent.relation}</p>
          </div>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#95D078] rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ml-2">
          <ChatCircleDots size={20} className="md:w-[24px] md:h-[24px]" weight="fill" />
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-4 md:gap-6 pr-2 mb-4 md:mb-6 custom-scrollbar"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {isInitialLoading ? (
          <div className="flex flex-col gap-3 animate-pulse w-full">
            <div className="h-10 w-2/3 bg-gray-200 rounded-xl mr-auto" />
            <div className="h-10 w-2/3 bg-[#43C17A]/30 rounded-xl ml-auto" />
            <div className="h-10 w-2/3 bg-gray-200 rounded-xl mr-auto" />
          </div>
        ) : (
          <>
            {isFetchingNextPage && <div className="text-center text-[10px] text-gray-400 py-1">Loading...</div>}

            {messages.length === 0 && !isSending ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
                No communication yet.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderRole === "FACULTY";
                const isRead = msg.isRead;
                const canEditDelete = isMe && !isRead;
                const isSelected = selectedMessageIds.includes(msg.chatId);

                return (
                  <div
                    key={`${msg.chatId}-${idx}`}
                    className={`flex items-start gap-2 w-full max-w-[85%] ${
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {isSelectionMode && isMe && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectMessage(msg.chatId)}
                        className="mt-3 cursor-pointer w-4 h-4 accent-[#43C17A]"
                        disabled={!canEditDelete} // Cannot bulk delete read messages
                      />
                    )}

                    {!isMe && <Avatar src={msg.senderAvatar} size={28} alt="" />}

                    <div className={`flex flex-col relative group ${isMe ? "items-end" : "items-start"}`}>
                      {editingMessageId === msg.chatId ? (
                        <div className="w-[250px] md:w-[350px] bg-white border border-[#43C17A] rounded-xl p-2 shadow-md">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm p-1"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={cancelEditingMessage}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateMessage(msg.chatId)}
                              disabled={isUpdatingMessage || !editingText.trim()}
                              className="text-xs bg-[#43C17A] text-white px-3 py-1 rounded font-medium disabled:opacity-50"
                            >
                              {isUpdatingMessage ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-[13px] md:text-[15px] leading-relaxed relative shadow-sm font-medium
                          ${
                            isMe
                              ? "bg-[#95D078] text-white rounded-tr-none"
                              : "bg-[#EFF8E9] text-[#2d3a2f] rounded-tl-none"
                          }`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-2">
                              {msg.mediaType === "image" ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="attachment"
                                  className="max-w-[150px] rounded-md cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(msg.mediaUrl, "_blank")}
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition ${
                                    isMe ? "bg-black/10 hover:bg-black/20" : "bg-gray-100 hover:bg-gray-200 text-[#282828]"
                                  }`}
                                >
                                  <FilePdf size={16} weight="fill" />
                                  <span className="text-[12px] underline font-medium">Document</span>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}

                          <div
                            className={`flex items-center gap-1 mt-1.5 justify-end ${
                              isMe ? "text-white/80" : "text-[#888]"
                            }`}
                          >
                            <span className="text-[10px] md:text-[11px]">{formatChatTime(msg.createdAt)}</span>
                            {msg.updatedAt !== msg.createdAt && (
                              <span className="text-[9px] italic ml-1">(edited)</span>
                            )}
                            {isMe && (
                              <Checks
                                size={14}
                                weight="bold"
                                className={msg.isRead ? "text-[#34B7F1]" : "text-white/60"}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* MESSAGE OPTIONS MENU (Edit/Delete) */}
                      {isMe && canEditDelete && editingMessageId !== msg.chatId && !isSelectionMode && (
                        <div className={`absolute top-1 -left-8 transition-opacity ${activeMenuId === msg.chatId ? 'opacity-100 z-[60]' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button
                            onClick={(e) => {
                              if (activeMenuId === msg.chatId) {
                                setActiveMenuId(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                setMenuPosition(spaceBelow < 120 ? "top" : "bottom");
                                setActiveMenuId(msg.chatId);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm cursor-pointer"
                          >
                            <DotsThreeVertical size={16} weight="bold" />
                          </button>

                          {activeMenuId === msg.chatId && (
                            <div className={`absolute right-0 ${menuPosition === "top" ? "bottom-8" : "top-8"} bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-50 w-28 text-sm`}>
                              <button
                                onClick={() => startEditingMessage(msg)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                              >
                                <PencilSimple size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.chatId)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex gap-1.5 ml-auto flex-row-reverse w-full max-w-[85%] animate-pulse">
                <div className="bg-[#95D078]/70 text-white px-3 py-2 rounded-2xl rounded-tr-none shadow-sm text-[12px] italic">
                  Sending...
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex gap-1.5 mr-auto items-center animate-pulse">
                <div className="bg-[#EFF8E9] px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* INPUT AREA */}
      <form onSubmit={handleSend} className="bg-[#E4F6E6] mx-4 mb-4 rounded-xl px-2 py-2 flex items-center gap-2 relative">
        {selectedFiles.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2 w-full p-2 z-10">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm max-w-[200px]">
                <Paperclip size={14} className="text-gray-500 shrink-0" />
                <span className="text-xs font-medium text-gray-700 truncate">{file.name}</span>
                <button type="button" onClick={() => handleRemoveFile(idx)} className="ml-1 text-red-500 hover:text-red-700 cursor-pointer shrink-0">
                  <X size={12} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            fileInputRef.current?.click();
          }}
          className="p-2 text-[#555] hover:text-[#333] transition-colors shrink-0 cursor-pointer"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf, .jpg, .jpeg, .png"
          multiple
          onChange={handleFileChange}
        />

        <input
          type="text"
          ref={messageInputRef}
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          disabled={isSending || isSelectionMode}
          className="flex-1 bg-transparent outline-none text-[13px] md:text-[15px] text-[#333] placeholder-[#888] font-medium min-w-0"
        />

        <button
          type="submit"
          disabled={isSending || (!newMessage.trim() && selectedFiles.length === 0) || isSelectionMode}
          className="w-10 h-10 md:w-10 md:h-10 bg-[#2ECC71] rounded-full flex items-center justify-center text-white hover:bg-[#27ae60] transition-transform active:scale-95 shadow-md shrink-0 disabled:opacity-50"
        >
          <PaperPlaneRight size={18} weight="fill" />
        </button>
      </form>

      {/* Click outside to close menu */}
      {activeMenuId && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => setActiveMenuId(null)}
        />
      )}
    </div>
  );
}
