// "use client";

// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import { X } from "lucide-react";
// import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
// import EmailDetailModal from "./EmailDetailModal";
// import { EmailItem } from "../types/email";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getUserEmails } from "@/lib/helpers/notifications/emailsAPI";

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
//   const { userId } = useUser();
//   const [emails, setEmails] = useState<EmailItem[]>([]);
//   const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     async function loadEmails() {
//       if (!isOpen || !userId) return;
//       setIsLoading(true);

//       const dbEmails = await getUserEmails(userId);

//       const formattedEmails: EmailItem[] = dbEmails.map((mail: any) => {
//         const dateObj = new Date(mail.createdAt);
//         return {
//           initials: "SYS",
//           color: "#DCE2FF",
//           sender: "System Notifications",
//           email: mail.email,
//           subject: mail.subject,
//           Subject: mail.subject,
//           desc: "You have a new meeting reminder.",
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
//       });

//       setEmails(formattedEmails);
//       setIsLoading(false);
//     }

//     loadEmails();
//   }, [isOpen, userId]);

//   if (!isOpen) return null;

//   return (
//     <Portal>
//       <div
//         onClick={onClose}
//         className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px]"
//       />

//       <div className="fixed bottom-10 right-10 z-[1000] top-20 translate-x-6 w-[400px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
//         <div className="flex items-center justify-between px-5 py-4 shrink-0">
//           <div className="flex items-center gap-2">
//             <EnvelopeSimpleIcon size={25} weight="fill" color="#43C17A" />
//             <h2 className="text-[16px] font-semibold text-[#282828]">Email</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
//           >
//             <X size={18} className="text-[#6B7280]" />
//           </button>
//         </div>

//         <div className="overflow-y-auto flex-1 custom-scrollbar">
//           {isLoading ? (
//             <div className="p-5 text-center text-sm text-gray-500">
//               Loading emails...
//             </div>
//           ) : emails.length === 0 ? (
//             <div className="p-5 text-center text-sm text-gray-500">
//               No emails found.
//             </div>
//           ) : (
//             emails.map((mail, i) => (
//               <div key={i}>
//                 <div
//                   className="flex gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
//                   onClick={() => setSelectedEmail(mail)}
//                 >
//                   <div
//                     className="flex items-center justify-center rounded-full text-[14px] font-medium text-[#414141] shrink-0"
//                     style={{
//                       width: 36,
//                       height: 36,
//                       backgroundColor: mail.color,
//                     }}
//                   >
//                     {mail.initials}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-center">
//                       <p className="text-[13px] font-normal text-[#414141] truncate pr-2">
//                         {mail.sender}
//                       </p>
//                       <span className="text-[12px] text-[#6B7280] shrink-0">
//                         {mail.time}
//                       </span>
//                     </div>
//                     <p className="mt-[2px] text-[16.25px] font-medium text-[#111827] truncate">
//                       {mail.subject}
//                     </p>
//                     <p className="mt-[2px] text-[12.5px] font-regular text-[#414141] truncate">
//                       {mail.desc}
//                     </p>
//                   </div>
//                 </div>
//                 <hr className="w-[90%] ms-[5%] my-0 border-gray-200" />
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {selectedEmail && (
//         <EmailDetailModal
//           mail={selectedEmail}
//           onClose={() => setSelectedEmail(null)}
//         />
//       )}
//     </Portal>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import EmailDetailModal, { EmailDetailItem } from "./EmailDetailModal";
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
  const { userId } = useUser();
  const [emails, setEmails] = useState<EmailDetailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetailItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadEmails() {
      if (!isOpen || !userId) return;
      setIsLoading(true);

      const dbEmails = await getUserEmails(userId);

      const formattedEmails: EmailDetailItem[] = dbEmails.map((mail: any) => {
        const dateObj = new Date(mail.createdAt);
        return {
          id: mail.emailQueueId, // Pass ID to DB
          isRead: mail.isRead, // Track read state
          initials: "SYS",
          color: "#DCE2FF",
          sender: "System Notifications",
          email: mail.email,
          subject: mail.subject,
          Subject: mail.subject,
          desc: "You have a new meeting reminder.",
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
  }, [isOpen, userId]);

  const handleEmailClick = async (mail: EmailDetailItem) => {
    setSelectedEmail(mail);

    // Mark as read instantly in UI and DB if unread
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
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
          >
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-gray-500">
              <Loader />
            </div>
          ) : emails.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              No emails found.
            </div>
          ) : (
            emails.map((mail) => (
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
        />
      )}
    </Portal>
  );
}
