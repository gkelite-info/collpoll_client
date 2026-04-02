"use client";

import { useState, useEffect, useRef } from "react";
import { X, Reply, ChevronDown } from "lucide-react";
import DOMPurify from "dompurify";

export type EmailDetailItem = {
  id: number;
  isRead: boolean;
  initials: string;
  email: string;
  recipients?: string[];
  color: string;
  sender: string;
  subject: string;
  desc: string;
  time: string;
  date: string;
  body: string;
  Subject: string;
};

type Props = {
  mail: EmailDetailItem;
  onClose: () => void;
  onReply: (mail: EmailDetailItem) => void;
};

export default function EmailDetailModal({ mail, onClose, onReply }: Props) {
  const [showRecipients, setShowRecipients] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Ref to track the body content

  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }
  }, [mail.body]);

  return (
    <div className="fixed bottom-10 right-[430px] z-[1100] w-[418px] h-[430px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-0 relative">
        <button
          onClick={onClose}
          className="absolute cursor-pointer left-4 top-2 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
        >
          <X size={20} className="text-[#6B7280]" />
        </button>

        <button
          onClick={() => onReply(mail)}
          className="absolute cursor-pointer right-4 top-2 flex items-center gap-1.5 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors text-[#6B7280] hover:text-[#43C17A]"
          title="Reply"
        >
          <Reply size={16} />
          <span className="text-[13px] font-medium">Reply</span>
        </button>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3 ml-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] text-[#414141] font-semibold shadow-sm"
              style={{ backgroundColor: mail.color }}
            >
              {mail.initials}
            </div>
            <div className="flex flex-col relative">
              <p className="text-[17px] font-semibold text-[#111827]">
                {mail.sender}
              </p>

              {mail.recipients && mail.recipients.length > 1 ? (
                <div className="relative">
                  <p
                    onClick={() => setShowRecipients(!showRecipients)}
                    className="text-[13px] text-[#43C17A] cursor-pointer hover:underline flex items-center gap-1 font-medium select-none"
                  >
                    {mail.email}{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showRecipients ? "rotate-180" : ""}`}
                    />
                  </p>

                  {showRecipients && (
                    <div className="absolute top-full left-0 mt-1 w-[260px] max-h-[160px] overflow-y-auto custom-scrollbar bg-white border border-gray-200 shadow-xl rounded-md p-1.5 z-50">
                      {mail.recipients.map((rec, i) => (
                        <div
                          key={i}
                          className="text-[12px] text-gray-700 py-1.5 px-2 hover:bg-gray-50 rounded truncate transition-colors"
                        >
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[14px] text-[#6B7280]">{mail.email}</p>
              )}
            </div>
          </div>
          <p className="text-[12px] text-[#6B7280] whitespace-nowrap mr-2">
            {mail.time}, {mail.date}
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col h-full">
        <p className="text-[13px] text-[#111827] mb-3 leading-[100%]">
          <span className="font-medium">Subject :</span>
          <span className="font-normal ml-1">{mail.Subject}</span>
        </p>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
          <div
            ref={contentRef} // Attached the ref here
            className="text-[13px] text-[#414141] leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mail.body) }}
          />
        </div>
      </div>
    </div>
  );
}
