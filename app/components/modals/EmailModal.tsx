"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus } from "lucide-react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import EmailDetailModal, { EmailDetailItem } from "./EmailDetailModal";
import ComposeEmailModal from "./ComposeEmailModal";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getUserEmails,
  markEmailRead,
} from "@/lib/helpers/notifications/emailsAPI";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function EmailModal({ isOpen, onClose }: Props) {
  const { userId, collegeId, email: currentUserEmail } = useUser();
  const [emails, setEmails] = useState<EmailDetailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetailItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [replyData, setReplyData] = useState<{
    to: string;
    subject: string;
    body: string;
    senderName: string;
    date: string;
    time: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "inbox" | "sent">("all");

  const handleReplyClick = (mail: EmailDetailItem) => {
    setReplyData({
      to: mail.email,
      subject: mail.subject,
      body: mail.body,
      senderName: mail.sender,
      date: mail.date,
      time: mail.time,
    });
    setSelectedEmail(null);
    setIsComposeOpen(true);
  };

  useEffect(() => {
    async function loadEmails() {
      if (!isOpen || !userId || !currentUserEmail) return;
      setIsLoading(true);

      const dbEmails = await getUserEmails(userId, currentUserEmail);

      const formattedEmails: EmailDetailItem[] = dbEmails.map((mail: any) => {
        const dateObj = new Date(mail.createdAt);
        const isSentByMe = mail.senderAddress === currentUserEmail;

        const displaySenderName = isSentByMe
          ? "Me"
          : mail.senderName || "System Notifications";
        const displayEmail = isSentByMe
          ? `To: ${mail.email}`
          : mail.senderAddress || "noreply@tektoncampus.edu";
        const initials = displaySenderName.substring(0, 2).toUpperCase();

        return {
          id: mail.emailQueueId,
          isRead: mail.isRead,
          initials: initials,
          color: isSentByMe ? "#E5E7EB" : "#DCE2FF",
          sender: displaySenderName,
          email: displayEmail,
          subject: mail.subject,
          Subject: mail.subject,
          desc: mail.body.replace(/<[^>]+>/g, "").substring(0, 50) + "...",
          time: dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: dateObj.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          body: mail.body,
        };
      });

      setEmails(formattedEmails);
      setIsLoading(false);
    }
    loadEmails();
  }, [isOpen, userId, currentUserEmail]);

  const displayedEmails = emails.filter((mail) => {
    const isSentByMe = mail.sender === "Me";
    if (activeTab === "all") return true;
    if (activeTab === "inbox") return !isSentByMe;
    if (activeTab === "sent") return isSentByMe;
  });

  const handleEmailClick = async (mail: EmailDetailItem) => {
    setSelectedEmail(mail);

    if (!mail.isRead) {
      setEmails((prev) =>
        prev.map((e) => (e.id === mail.id ? { ...e, isRead: true } : e)),
      );
      await markEmailRead(mail.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px]"
      />
      <div className="fixed bottom-10 right-10 z-[1000] top-20 translate-x-6 w-[400px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <EnvelopeSimpleIcon size={25} weight="fill" color="#43C17A" />
            <h2 className="text-[16px] font-semibold text-[#282828]">Email</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplyData(null);
                setIsComposeOpen(true);
              }}
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 text-[#282828] px-2 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <Plus size={16} className="text-[#43C17A]" /> Compose
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
            >
              <X size={18} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 pt-2 border-b border-gray-100 shrink-0">
          {["all", "inbox", "sent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 text-[13px] font-semibold cursor-pointer capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#43C17A] text-[#43C17A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-gray-500">
              <Loader />
            </div>
          ) : displayedEmails.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              No {activeTab} emails found.
            </div>
          ) : (
            displayedEmails.map((mail) => (
              <div
                key={mail.id}
                className={`flex gap-3 p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                  mail.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
                }`}
                onClick={() => handleEmailClick(mail)}
              >
                <div
                  className="flex items-center justify-center rounded-full text-[14px] font-medium text-[#080808] shrink-0"
                  style={{ width: 36, height: 36, backgroundColor: mail.color }}
                >
                  {mail.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-[13px] truncate pr-2 ${mail.isRead ? "text-[#414141] font-normal" : "text-blue-900 font-semibold"}`}
                    >
                      {mail.sender}
                    </p>
                    <span className="text-[10px] text-[#6B7280] shrink-0">
                      {mail.time}
                    </span>
                  </div>
                  <p
                    className={`mt-[2px] text-[14px] truncate ${mail.isRead ? "font-medium text-[#111827]" : "font-bold text-gray-900"}`}
                  >
                    {mail.subject}
                  </p>
                  <p
                    className={`mt-[2px] text-[12px] truncate ${mail.isRead ? "font-regular text-[#414141]" : "text-gray-700"}`}
                  >
                    {mail.desc}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEmail && (
        <EmailDetailModal
          mail={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onReply={handleReplyClick}
        />
      )}

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        collegeId={collegeId!}
        replyData={replyData}
      />
    </Portal>
  );
}
