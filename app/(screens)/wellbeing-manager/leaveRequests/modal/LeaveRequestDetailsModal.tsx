"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Paperclip,
  PaperPlaneRight,
  Checks,
} from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";

interface LeaveRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveData: any;
}

export default function LeaveRequestDetailsModal({
  isOpen,
  onClose,
  leaveData,
}: LeaveRequestDetailsModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && leaveData) {
      setMessages([
        {
          chatId: "1",
          senderRole: "STUDENT",
          senderName: "Rahul Kumar",
          senderAvatar: "",
          message: "Hi, I have submitted the leave request. Please approve it.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
        },
        {
          chatId: "2",
          senderRole: "MANAGER",
          senderName: "Approver",
          senderAvatar: "",
          message: "Sure, let me check the details.",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          isRead: true,
        }
      ]);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen, leaveData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      chatId: String(Date.now()),
      senderRole: "STUDENT",
      senderName: "Rahul Kumar",
      senderAvatar: "",
      message: newMessage,
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setTimeout(() => scrollToBottom(), 50);
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
              {leaveData.fromDate}
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

        <div className="px-5 py-3 flex items-center gap-1.5 text-[#282828] font-bold shrink-0 bg-gray-50 border-b border-gray-100 text-[13px]">
          Communication History
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 italic">
              No communication yet
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderRole === "STUDENT";

              return (
                <div
                  key={`${msg.chatId}-${idx}`}
                  className={`flex gap-1.5 w-full max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className="shrink-0">
                    <Avatar src={msg.senderAvatar} size={24} alt=""/>
                  </div>

                  <div className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-[#43C17A]">
                        {msg.senderName}
                      </span>
                    )}

                    <div
                      className={`px-3 py-2 rounded-xl text-[12px] relative ${isMe ? "bg-[#43C17A] text-white rounded-tr-sm shadow-sm" : "bg-white text-[#282828] rounded-tl-sm border border-gray-200 shadow-sm"}`}
                    >
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
                      {isMe && (
                        <Checks
                          size={12}
                          weight="bold"
                          className="text-[#34B7F1]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-gray-100 shrink-0"
        >
          <div className="flex items-center gap-1.5 border border-gray-300 rounded-full pl-3 pr-1 py-1 focus-within:border-[#43C17A] focus-within:shadow-sm transition-all bg-[#F8F9FA]">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              className="flex-1 bg-transparent outline-none text-[13px] text-[#282828] placeholder-gray-400"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
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
