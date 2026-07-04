"use client";

import Image from "next/image";
import {
  CalendarBlank,
  CalendarPlus,
  CaretLeft,
  Clock,
  CloudArrowUp,
  FileText,
  Plus,
  Trash,
  UserPlus,
  Users,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { scheduleParticipants } from "./calendarData";

export function ScheduleMeetingScreen({ onBack }: { onBack: () => void }) {
  const inputClass =
    "h-10 rounded-md border border-[#BFCDBE] bg-white px-3 text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#A8AEB7] focus:border-[#237333]";

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <section
        className="ml-0 mr-auto flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        style={{ width: "1040px", maxWidth: "100%" }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#DDE3EA] bg-[#F5F5F5] px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              aria-label="Back to calendar"
              onClick={onBack}
              className="mt-1 flex h-7 w-5 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#DDF8E9] text-[#237333]">
              <CalendarPlus size={15} weight="bold" />
            </span>
            <div>
              <h2 className="text-[19px] font-bold leading-tight text-[#17213D]">
                Schedule Meeting
              </h2>
              <p className="mt-1 text-[11px] font-medium text-[#282828]">
                Create a new institutional budget review session
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Back to calendar"
            onClick={onBack}
            className="cursor-pointer text-[#282828]"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
          <form className="px-4 py-4">
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#282828]">
                Meeting Title
              </span>
              <input
                type="text"
                placeholder="e.g., Q3 Budget Review & Vendor Analysis"
                className={inputClass}
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#282828]">Date</span>
                <div className="flex h-10 items-center gap-2 rounded-md border border-[#BFCDBE] bg-white px-3 focus-within:border-[#237333]">
                  <CalendarBlank size={14} weight="bold" className="text-[#525252]" />
                  <input
                    type="date"
                    className="w-full bg-transparent text-[12px] font-medium text-[#17213D] outline-none"
                    style={{ colorScheme: "light" }}
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#282828]">
                  Time Range
                </span>
                <div className="flex h-10 items-center gap-2 rounded-md border border-[#BFCDBE] bg-white px-3">
                  <Clock size={14} weight="bold" className="text-[#525252]" />
                  <span className="text-[12px] font-medium text-[#6B7280]">
                    10:00 AM -11:30 AM
                  </span>
                </div>
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#282828]">
                Meeting Link
              </span>
              <input
                type="url"
                placeholder="Paste meeting URL"
                className={inputClass}
              />
            </label>

            <div className="mt-4">
              <p className="text-[12px] font-bold text-[#282828]">Meeting Type</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-[#237333] bg-[#F8FFFB] text-[12px] font-semibold text-[#237333]"
                >
                  <VideoCamera size={14} weight="fill" />
                  Online
                </button>
                <button
                  type="button"
                  className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#BFCDBE] bg-white text-[12px] font-semibold text-[#525252]"
                >
                  <Users size={14} weight="bold" />
                  Offline
                </button>
              </div>
            </div>

            <label className="mt-4 flex flex-col gap-2">
              <span className="text-[12px] font-bold text-[#282828]">
                Description &amp; Agenda
              </span>
              <textarea
                placeholder="Briefly describe the purpose of the meeting and list key agenda items..."
                className="min-h-[82px] resize-none rounded-md border border-[#BFCDBE] bg-white px-3 py-2 text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#6B7280] focus:border-[#237333]"
              />
            </label>
          </form>

          <aside className="border-l border-[#E6E8EB] px-4 py-4">
            <section className="rounded-lg border border-[#BFCDBE] bg-white p-3.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#282828]">
                  <UserPlus size={15} weight="bold" className="text-[#237333]" />
                  Participants
                </h3>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-[#237333]"
                >
                  <Plus size={13} weight="bold" />
                  Add
                </button>
              </div>
              <div className="space-y-4">
                {scheduleParticipants.map((participant) => (
                  <div key={participant.name} className="flex items-center gap-3">
                    <Image
                      src={participant.avatar}
                      alt={participant.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover shadow-[0_2px_5px_rgba(15,23,42,0.12)]"
                    />
                    <p className="text-[12px] font-medium text-[#282828]">
                      {participant.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-[#ECECEC] pt-4 text-center">
                <button
                  type="button"
                  className="cursor-pointer text-[13px] font-semibold text-[#237333]"
                >
                  + 5 more participants
                </button>
              </div>
            </section>

            <section className="mt-4">
              <h3 className="text-[13px] font-bold text-[#282828]">Attachments</h3>
              <label className="mt-3 flex min-h-[94px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#9FB49F] bg-white px-3 text-center">
                <input
                  type="file"
                  accept=".xlsx,.pdf,.doc,.docx"
                  className="hidden"
                />
                <CloudArrowUp size={20} weight="bold" className="text-[#237333]" />
                <span className="mt-2 text-[11px] font-medium text-[#282828]">
                  Click to upload or drag and drop
                </span>
                <span className="mt-1 text-[10px] font-medium text-[#525252]">
                  XLSX, PDF, or DOC (Max 10MB)
                </span>
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#DDE3EA] bg-[#F8F8F8] px-3 py-2">
                <FileText size={16} weight="bold" className="text-[#237333]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[#282828]">
                    Q2_Final_Report.pdf
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium text-[#6B7280]">
                    1.2 MB
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove Q2 final report"
                  className="cursor-pointer text-[#525252]"
                >
                  <Trash size={15} weight="bold" />
                </button>
              </div>
            </section>
          </aside>
        </div>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#E6E8EB] bg-[#F4F4F4] px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="h-10 min-w-[110px] cursor-pointer rounded-lg border border-[#BFCDBE] bg-white px-5 text-[12px] font-medium text-[#282828]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 min-w-[190px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#086C20] px-5 text-[12px] font-medium text-white shadow-[0_6px_14px_rgba(8,108,32,0.24)]"
          >
            <CalendarBlank size={14} weight="bold" />
            Schedule Meeting
          </button>
        </footer>
      </section>
    </main>
  );
}
