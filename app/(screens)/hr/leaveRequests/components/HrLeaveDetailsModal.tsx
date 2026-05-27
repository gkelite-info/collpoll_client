"use client";

import {
  CalendarBlank,
  Checks,
  FilePdf,
  PaperPlaneRight,
  Paperclip,
  X,
} from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import type { HrLeaveRow } from "./types";

type HrLeaveDetailsModalProps = {
  leave: HrLeaveRow | null;
  onClose: () => void;
};

const statusClassMap: Record<HrLeaveRow["status"], string> = {
  approved: "bg-[#E7F8EE] text-[#43C17A]",
  pending: "bg-[#FFF1DC] text-[#FF9F2E]",
  rejected: "bg-[#FFD7D7] text-[#FF2020]",
};

export default function HrLeaveDetailsModal({
  leave,
  onClose,
}: HrLeaveDetailsModalProps) {
  if (!leave) return null;

  const messages = buildStaticMessages(leave);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-[850px] overflow-hidden rounded-xl bg-gray-50 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-50 cursor-pointer rounded-full bg-gray-100 p-1.5 text-gray-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
        >
          <X size={12} weight="bold" />
        </button>

        <aside className="custom-scrollbar flex w-[30%] min-w-[230px] flex-col gap-2.5 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-3">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-[#10B9810F] p-3 shadow-sm">
            <Avatar src={leave.photo ?? undefined} size={48} alt={leave.name} />
            <h3 className="mt-2 w-full truncate text-center text-[13px] font-bold leading-tight text-[#282828]">
              {leave.name}
            </h3>
            <span className="mb-2 text-[10px] font-bold text-[#43C17A]">
              ID: #{leave.employeeId}
            </span>

            <div className="flex w-full flex-col gap-1 text-[11px]">
              <InfoRow label="Role" value={leave.role} />
              <InfoRow label="Employee ID" value={leave.employeeId} />
              <InfoRow
                label="Status"
                value={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              />
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-gray-200 bg-[#10B9810F] p-3 shadow-sm">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#282828]">
              Leave Info
            </h4>

            <div className="flex flex-col gap-2 text-[11px]">
              <DetailLine label="Requested Date" value={leave.fromDate} />
              <DetailLine
                label="Leave Period"
                value={`${leave.fromDate} - ${leave.toDate}`}
              />

              <div className="mt-0.5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Leave Type
                  </span>
                  <span className="w-fit rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                    {leave.leaveType}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Total Days
                  </span>
                  <span className="font-bold text-[#43C17A]">
                    {leave.days} Days
                  </span>
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-0.5 border-t border-gray-100 pt-1.5">
                <span className="text-[9px] uppercase tracking-wide text-gray-400">
                  Reason
                </span>
                <p className="text-[10px] italic leading-snug text-gray-600">
                  &quot;{leave.description}&quot;
                </p>
              </div>

              <span
                className={`mt-1 inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold ${statusClassMap[leave.status]}`}
              >
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col bg-white">
          <header className="z-10 shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
            <h2 className="text-[14px] font-bold text-[#282828]">
              Communication History
            </h2>
          </header>

          <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((message) => {
              const isMe = message.senderRole === "HR";

              return (
                <div
                  key={message.id}
                  className={`flex w-full max-w-[85%] gap-1.5 ${
                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <Avatar
                    src={isMe ? undefined : leave.photo ?? undefined}
                    size={24}
                    alt=""
                  />

                  <div
                    className={`flex flex-col gap-0.5 ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-[#43C17A]">
                        {message.senderName}
                      </span>
                    )}

                    <div
                      className={`rounded-xl px-2.5 py-2 text-[12px] shadow-sm ${
                        isMe
                          ? "rounded-tr-sm bg-[#43C17A] text-white"
                          : "rounded-tl-sm border border-gray-200 bg-white text-[#282828]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-snug">
                        {message.message}
                      </p>
                      {message.hasAttachment && (
                        <div
                          className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 ${
                            isMe ? "bg-black/10" : "bg-gray-100"
                          }`}
                        >
                          <FilePdf size={14} weight="fill" />
                          <span className="text-[11px] font-medium underline">
                            leave_document.pdf
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1 px-0.5">
                      <span className="text-[9px] font-medium text-gray-400">
                        {message.time}
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
            })}
          </div>

          <form className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white p-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <Paperclip size={18} />
            </button>
            <input
              placeholder="Type your message here..."
              className="h-9 flex-1 rounded-full border border-gray-200 px-4 text-sm outline-none placeholder:text-gray-400 focus:border-[#43C17A]"
            />
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[#43C17A] px-4 text-sm font-semibold text-white hover:bg-[#34A565]"
            >
              Send
              <PaperPlaneRight size={15} weight="fill" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function buildStaticMessages(leave: HrLeaveRow) {
  return [
    {
      id: `${leave.id}-request`,
      senderName: leave.name,
      senderRole: leave.role,
      message: `I am requesting ${leave.days} days of ${leave.leaveType.toLowerCase()} leave from ${leave.fromDate} to ${leave.toDate}.`,
      time: "09:20 AM",
      hasAttachment: leave.leaveType === "Medical" || leave.leaveType === "Sick",
    },
    {
      id: `${leave.id}-hr-ack`,
      senderName: "HR Desk",
      senderRole: "HR",
      message:
        leave.status === "approved"
          ? "Your leave request has been reviewed and approved."
          : leave.status === "rejected"
            ? "This leave request cannot be approved for the selected dates."
            : "Thanks for sharing. We are checking team availability for these dates.",
      time: "10:05 AM",
      hasAttachment: false,
    },
    {
      id: `${leave.id}-followup`,
      senderName: leave.name,
      senderRole: leave.role,
      message:
        leave.status === "pending"
          ? "Please let me know if any additional detail is required."
          : "Thank you for the update.",
      time: "10:18 AM",
      hasAttachment: false,
    },
  ];
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[110px] truncate text-right font-semibold text-[#282828]">
        {value}
      </span>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-1 font-semibold text-[#282828]">
        <CalendarBlank size={12} className="text-gray-400" />
        {value}
      </div>
    </div>
  );
}
