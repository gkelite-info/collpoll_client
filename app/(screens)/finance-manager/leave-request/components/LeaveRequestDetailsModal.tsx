"use client";

import {
  Checks,
  FilePdf,
  PaperPlaneRight,
  Paperclip,
  X,
} from "@phosphor-icons/react";
import type { FinanceLeaveRequest } from "../data";

const statusClassMap: Record<FinanceLeaveRequest["status"], string> = {
  approved: "text-[#43C17A]",
  pending: "text-orange-400",
  rejected: "text-red-500",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-[650px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-[15px] font-bold text-[#282828]">
            Leave Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-2.5 cursor-pointer rounded-full bg-gray-50 p-1.5 text-gray-400 transition-colors hover:text-red-500"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 border-b border-gray-100 bg-white p-4 md:grid-cols-4">
          <DetailStat label="Request Sent" value={request.requestedDate} />
          <DetailStat label="Duration" value={request.dateRange} />
          <DetailStat
            label="Status"
            value={request.status}
            valueClass={`capitalize ${statusClassMap[request.status]}`}
          />
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Leave Type
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#282828]">
              <div className="h-2 w-2 rounded-full bg-[#43C17A]" />
              {request.leaveType}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 border-b border-gray-100 bg-white px-5 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Employee
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#282828]">
              {request.name}
            </p>
            <p className="text-[11px] font-semibold text-[#43C17A]">
              ID: {request.employeeId}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Reason
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] font-medium text-[#525252]">
              {request.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-5 py-3 text-[13px] font-bold text-[#282828]">
          Communication History
        </div>

        <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4">
          {request.chat.map((message) => {
            const isMe = Boolean(message.isMe);

            return (
              <div
                key={message.id}
                className={`flex w-full max-w-[85%] gap-1.5 ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <Avatar label={message.senderName} image={isMe ? request.photo : undefined} />

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
                    className={`rounded-xl px-3 py-2 text-[12px] shadow-sm ${
                      isMe
                        ? "rounded-tr-sm bg-[#43C17A] text-white"
                        : "rounded-tl-sm border border-gray-200 bg-white text-[#282828]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-snug">
                      {message.message}
                    </p>
                    {request.attachment && message.id.endsWith("-1") && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                          isMe ? "bg-black/10" : "bg-gray-100"
                        }`}
                      >
                        <FilePdf size={14} weight="fill" />
                        <span className="text-[11px] font-medium underline">
                          {request.attachment}
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

        <form className="shrink-0 border-t border-gray-100 bg-white p-3">
          <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#F8F9FA] py-1 pl-3 pr-1 transition-all focus-within:border-[#43C17A] focus-within:shadow-sm">
            <button
              type="button"
              className="shrink-0 cursor-pointer p-1 text-gray-400 transition hover:text-gray-600"
            >
              <Paperclip size={18} weight="bold" />
            </button>
            <input
              type="text"
              placeholder="Type your message"
              className="flex-1 bg-transparent text-[13px] text-[#282828] outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              className="shrink-0 cursor-pointer rounded-full bg-[#43C17A] p-2 text-white shadow-sm transition-colors hover:bg-[#34a362]"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  valueClass = "text-[#282828]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className={`text-[12px] font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function Avatar({ label, image }: { label: string; image?: string }) {
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DFF3E9] text-[10px] font-semibold text-[#43C17A]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
