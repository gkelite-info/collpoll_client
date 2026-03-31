// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { createPortal } from "react-dom";
// import { X, Plus } from "lucide-react";
// import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
// import EmailDetailModal, { EmailDetailItem } from "./EmailDetailModal";
// import ComposeEmailModal from "./ComposeEmailModal";
// import { useUser } from "@/app/utils/context/UserContext";
// import {
//   getUserEmails,
//   markEmailRead,
// } from "@/lib/helpers/notifications/emailsAPI";
// import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// function Portal({ children }: { children: React.ReactNode }) {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;
//   return createPortal(children, document.body);
// }

// export default function EmailModal({ isOpen, onClose }: Props) {
//   const { userId, collegeId, email: currentUserEmail } = useUser();
//   const [emails, setEmails] = useState<EmailDetailItem[]>([]);
//   const [selectedEmail, setSelectedEmail] = useState<EmailDetailItem | null>(
//     null,
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [isComposeOpen, setIsComposeOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState<"all" | "inbox" | "sent">("all");

//   const [replyData, setReplyData] = useState<{
//     to: string;
//     subject: string;
//     body: string;
//     senderName: string;
//     date: string;
//     time: string;
//   } | null>(null);

//   const handleReplyClick = (mail: EmailDetailItem) => {
//     setReplyData({
//       to: mail.email,
//       subject: mail.subject,
//       body: mail.body,
//       senderName: mail.sender,
//       date: mail.date,
//       time: mail.time,
//     });
//     setSelectedEmail(null);
//     setIsComposeOpen(true);
//   };

//   const loadEmails = useCallback(async () => {
//     if (!userId || !currentUserEmail) return;
//     setIsLoading(true);

//     const dbEmails = await getUserEmails(userId, currentUserEmail);
//     const filteredEmails = dbEmails.filter(
//       (mail: any) => mail.senderName !== null,
//     );

//     const groupedEmails: any[] = [];
//     const sentGroups = new Map();

//     filteredEmails.forEach((mail: any) => {
//       const isSentByMe = mail.senderAddress === currentUserEmail;

//       if (isSentByMe) {
//         const timeKey = new Date(mail.createdAt).toISOString().substring(0, 16);
//         const uniqueKey = `${mail.subject}-${timeKey}`;

//         if (sentGroups.has(uniqueKey)) {
//           sentGroups.get(uniqueKey).groupCount += 1;
//           // FIX: Add the email to the recipient list array
//           sentGroups.get(uniqueKey).recipientList.push(mail.email);
//         } else {
//           // FIX: Initialize the recipient list array
//           const enrichedMail = {
//             ...mail,
//             groupCount: 1,
//             recipientList: [mail.email],
//           };
//           sentGroups.set(uniqueKey, enrichedMail);
//           groupedEmails.push(enrichedMail);
//         }
//       } else {
//         groupedEmails.push(mail);
//       }
//     });

//     const formattedEmails: EmailDetailItem[] = groupedEmails.map(
//       (mail: any) => {
//         const dateObj = new Date(mail.createdAt);
//         const isSentByMe = mail.senderAddress === currentUserEmail;

//         const displaySenderName = isSentByMe ? "Me" : mail.senderName;
//         const displayEmail = isSentByMe
//           ? mail.groupCount > 1
//             ? `To: Multiple Recipients (${mail.groupCount})`
//             : `To: ${mail.email}`
//           : mail.senderAddress;

//         const initials = displaySenderName.substring(0, 2).toUpperCase();

//         return {
//           id: mail.emailQueueId,
//           isRead: mail.isRead,
//           initials: initials,
//           color: isSentByMe ? "#E5E7EB" : "#DCE2FF",
//           sender: displaySenderName,
//           email: displayEmail,
//           recipients: mail.recipientList || [mail.email], // Pass the array down to the detail modal
//           subject: mail.subject,
//           Subject: mail.subject,
//           desc: mail.body.replace(/<[^>]+>/g, "").substring(0, 50) + "...",
//           time: dateObj.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           date: dateObj.toLocaleDateString("en-GB", {
//             day: "numeric",
//             month: "short",
//             year: "numeric",
//           }),
//           body: mail.body,
//         };
//       },
//     );

//     setEmails(formattedEmails);
//     setIsLoading(false);
//   }, [userId, currentUserEmail]);

//   useEffect(() => {
//     if (isOpen) loadEmails();
//   }, [isOpen, loadEmails]);

//   const displayedEmails = emails.filter((mail) => {
//     const isSentByMe = mail.sender === "Me";
//     if (activeTab === "all") return true;
//     if (activeTab === "inbox") return !isSentByMe;
//     if (activeTab === "sent") return isSentByMe;
//   });

//   const handleEmailClick = async (mail: EmailDetailItem) => {
//     setSelectedEmail(mail);
//     if (!mail.isRead) {
//       setEmails((prev) =>
//         prev.map((e) => (e.id === mail.id ? { ...e, isRead: true } : e)),
//       );
//       await markEmailRead(mail.id);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <Portal>
//       <div
//         onClick={onClose}
//         className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px] cursor-pointer"
//       />
//       <div className="fixed bottom-10 right-10 z-[1000] top-20 translate-x-6 w-[400px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
//         <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-100">
//           <div className="flex items-center gap-2">
//             <EnvelopeSimpleIcon size={25} weight="fill" color="#43C17A" />
//             <h2 className="text-[16px] font-semibold text-[#282828]">Email</h2>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => {
//                 setReplyData(null);
//                 setIsComposeOpen(true);
//               }}
//               className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 text-[#282828] px-2 py-1 rounded-md text-sm font-medium transition-colors"
//             >
//               <Plus size={16} className="text-[#43C17A]" /> Compose
//             </button>
//             <button
//               onClick={onClose}
//               className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
//             >
//               <X size={18} className="text-[#6B7280]" />
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 px-5 pt-2 border-b border-gray-100 shrink-0">
//           {["all", "inbox", "sent"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab as any)}
//               className={`pb-2 text-[13px] font-semibold cursor-pointer capitalize transition-colors border-b-2 ${
//                 activeTab === tab
//                   ? "border-[#43C17A] text-[#43C17A]"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
//           {isLoading ? (
//             <div className="p-5 text-center text-sm text-gray-500">
//               <Loader />
//             </div>
//           ) : displayedEmails.length === 0 ? (
//             <div className="p-5 text-center text-sm text-gray-500">
//               No {activeTab} emails found.
//             </div>
//           ) : (
//             displayedEmails.map((mail) => (
//               <div
//                 key={mail.id}
//                 className={`flex gap-3 p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
//                   mail.isRead
//                     ? "bg-white hover:bg-gray-50"
//                     : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
//                 }`}
//                 onClick={() => handleEmailClick(mail)}
//               >
//                 <div
//                   className="flex items-center justify-center rounded-full text-[14px] font-medium text-[#080808] shrink-0"
//                   style={{ width: 36, height: 36, backgroundColor: mail.color }}
//                 >
//                   {mail.initials}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-center">
//                     <p
//                       className={`text-[13px] truncate pr-2 ${mail.isRead ? "text-[#414141] font-normal" : "text-blue-900 font-semibold"}`}
//                     >
//                       {mail.sender}
//                     </p>
//                     <span className="text-[10px] text-[#6B7280] shrink-0">
//                       {mail.time}
//                     </span>
//                   </div>
//                   <p
//                     className={`mt-[2px] text-[14px] truncate ${mail.isRead ? "font-medium text-[#111827]" : "font-bold text-gray-900"}`}
//                   >
//                     {mail.subject}
//                   </p>
//                   <p
//                     className={`mt-[2px] text-[12px] truncate ${mail.isRead ? "font-regular text-[#414141]" : "text-gray-700"}`}
//                   >
//                     {mail.desc}
//                   </p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {selectedEmail && (
//         <EmailDetailModal
//           mail={selectedEmail}
//           onClose={() => setSelectedEmail(null)}
//           onReply={handleReplyClick}
//         />
//       )}

//       <ComposeEmailModal
//         isOpen={isComposeOpen}
//         onClose={() => setIsComposeOpen(false)}
//         collegeId={collegeId!}
//         replyData={replyData}
//         onSuccess={loadEmails}
//       />
//     </Portal>
//   );
// }

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Plus } from "lucide-react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import EmailDetailModal, { EmailDetailItem } from "./EmailDetailModal";
import ComposeEmailModal from "./ComposeEmailModal";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchUserEmailsChunk,
  groupAndFormatEmails,
  markEmailRead,
} from "@/lib/helpers/notifications/emailsAPI";

type Props = { isOpen: boolean; onClose: () => void };

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Nice UI Skeleton Shimmer for loading states
function EmailShimmer() {
  return (
    <div className="flex gap-3 p-3 mb-1 rounded-lg bg-white border border-gray-100 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex justify-between items-center mb-1.5">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-200 rounded w-8" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
        <div className="h-2 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function EmailModal({ isOpen, onClose }: Props) {
  const { userId, collegeId, email: currentUserEmail } = useUser();

  const [activeTab, setActiveTab] = useState<"all" | "inbox" | "sent">("all");
  const [rawEmails, setRawEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetailItem | null>(
    null,
  );
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [replyData, setReplyData] = useState<any>(null);

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

  // 1. Load the first 10 items (Triggered on Open, Tab Change, or Auto-refresh)
  const loadInitialEmails = useCallback(async () => {
    if (!userId || !currentUserEmail) return;
    setIsLoadingInitial(true);
    setPage(0);
    setHasMore(true);

    const data = await fetchUserEmailsChunk(
      userId,
      currentUserEmail,
      activeTab,
      0,
      10,
    );

    setRawEmails(data);
    setHasMore(data.length === 10);
    setIsLoadingInitial(false);
  }, [userId, currentUserEmail, activeTab]);

  const loadMoreEmails = async () => {
    if (!userId || !currentUserEmail || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    const data = await fetchUserEmailsChunk(
      userId,
      currentUserEmail,
      activeTab,
      nextPage,
      10,
    );

    setRawEmails((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length === 10);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (isOpen) loadInitialEmails();
  }, [isOpen, activeTab, loadInitialEmails]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (!isLoadingMore && hasMore) loadMoreEmails();
    }
  };

  const handleEmailClick = async (mail: EmailDetailItem) => {
    setSelectedEmail(mail);
    if (!mail.isRead) {
      setRawEmails((prev) =>
        prev.map((e) =>
          e.emailQueueId === mail.id ? { ...e, isRead: true } : e,
        ),
      );
      await markEmailRead(mail.id);
    }
  };

  const displayedEmails = useMemo(() => {
    if (!currentUserEmail) return [];
    return groupAndFormatEmails(rawEmails, currentUserEmail);
  }, [rawEmails, currentUserEmail]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px] cursor-pointer"
      />
      <div className="fixed bottom-10 right-10 z-[1000] top-20 translate-x-6 w-[400px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
        {/* HEADER */}
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

        {/* TABS */}
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

        <div
          className="overflow-y-auto flex-1 custom-scrollbar p-2"
          onScroll={handleScroll}
        >
          {isLoadingInitial ? (
            [...Array(6)].map((_, i) => <EmailShimmer key={i} />)
          ) : displayedEmails.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              No {activeTab} emails found.
            </div>
          ) : (
            <>
              {displayedEmails.map((mail) => (
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
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: mail.color,
                    }}
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
              ))}

              {isLoadingMore && (
                <div className="mt-2 space-y-1">
                  {[...Array(2)].map((_, i) => (
                    <EmailShimmer key={`more-${i}`} />
                  ))}
                </div>
              )}
            </>
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
        onSuccess={loadInitialEmails}
      />
    </Portal>
  );
}
