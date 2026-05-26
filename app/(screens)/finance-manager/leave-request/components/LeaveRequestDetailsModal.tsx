"use client";

import {
  CalendarBlank,
  Checks,
  FilePdf,
  PaperPlaneRight,
  Paperclip,
  X,
} from "@phosphor-icons/react";
import type { FinanceLeaveRequest } from "../data";

const statusLabelMap: Record<FinanceLeaveRequest["status"], string> = {
  approved: "Accepted",
  pending: "Pending",
  rejected: "Rejected",
};

const statusClassMap: Record<FinanceLeaveRequest["status"], string> = {
  approved: "bg-[#E7F8EE] text-[#43C17A]",
  pending: "bg-[#FFF1DC] text-[#FF9F2E]",
  rejected: "bg-[#FFD7D7] text-[#FF2020]",
};

type LeaveRequestDetailsModalProps = {
  request: FinanceLeaveRequest | null;
  onClose: () => void;
};

export default function LeaveRequestDetailsModal({
  request,
  onClose,
}: LeaveRequestDetailsModalProps) {
  if (!request) return null;

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
            <Avatar image={request.photo} label={request.name} size="lg" />
            <h3 className="mt-2 w-full truncate text-center text-[13px] font-bold leading-tight text-[#282828]">
              {request.name}
            </h3>
            <span className="mb-2 text-[10px] font-bold text-[#43C17A]">
              ID: #{request.employeeId}
            </span>

            <div className="flex w-full flex-col gap-1 text-[11px]">
              <InfoRow label="Role" value={request.role} />
              <InfoRow label="Department" value="Finance" />
              <InfoRow label="Status" value={statusLabelMap[request.status]} />
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-gray-200 bg-[#10B9810F] p-3 shadow-sm">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#282828]">
              Leave Info
            </h4>

            <div className="flex flex-col gap-2 text-[11px]">
              <DetailLine label="Requested Date" value={request.requestedDate} />
              <DetailLine label="Leave Period" value={request.dateRange} />

              <div className="mt-0.5 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Leave Type
                  </span>
                  <span className="w-fit rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                    {request.leaveType}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[9px] uppercase tracking-wide text-gray-400">
                    Total Days
                  </span>
                  <span className="font-bold text-[#43C17A]">
                    {request.days} Days
                  </span>
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-0.5 border-t border-gray-100 pt-1.5">
                <span className="text-[9px] uppercase tracking-wide text-gray-400">
                  Reason
                </span>
                <p className="text-[10px] italic leading-snug text-gray-600">
                  &quot;{request.description}&quot;
                </p>
              </div>

              <div className="flex flex-col gap-1 border-t border-gray-100 pt-2">
                <span className="text-[9px] uppercase tracking-wide text-gray-400">
                  Attachment
                </span>
                {request.attachment ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#43C17A]">
                    <FilePdf size={13} weight="fill" />
                    {request.attachment}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500">No attachment</span>
                )}
              </div>

              <span
                className={`mt-1 inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold ${statusClassMap[request.status]}`}
              >
                {statusLabelMap[request.status]}
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
            {request.chat.map((message) => {
              const isMe = Boolean(message.isMe);

              return (
                <div
                  key={message.id}
                  className={`flex w-full max-w-[85%] gap-1.5 ${
                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <Avatar
                    image={isMe ? request.photo : undefined}
                    label={message.senderName}
                    size="sm"
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

function Avatar({
  label,
  image,
  size,
}: {
  label: string;
  image?: string;
  size: "sm" | "lg";
}) {
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = size === "lg" ? "h-12 w-12 text-sm" : "h-6 w-6 text-[10px]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DFF3E9] font-semibold text-[#43C17A] ${sizeClass}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
