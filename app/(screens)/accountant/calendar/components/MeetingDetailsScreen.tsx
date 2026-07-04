"use client";

import Image from "next/image";
import {
  Bell,
  CalendarBlank,
  CaretLeft,
  Clock,
  DownloadSimple,
  FileText,
  Info,
  Link,
  PencilSimple,
  User,
  UserPlus,
  Users,
  VideoCamera,
  XCircle,
} from "@phosphor-icons/react";
import { detailParticipants } from "./calendarData";

function DetailStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#E8F8EF] text-[#237333]">
        <Icon size={18} weight="bold" />
      </span>
      <div>
        <p className="text-[13px] font-bold text-[#17213D]">{value}</p>
        <p className="text-[10px] font-medium text-[#525252]">{label}</p>
      </div>
    </div>
  );
}

function AttachmentRow({
  name,
  size,
  tone,
}: {
  name: string;
  size: string;
  tone: "green" | "red";
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-white px-4 py-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
          tone === "red"
            ? "bg-[#FFE9E9] text-[#E44242]"
            : "bg-[#E8F8EF] text-[#237333]"
        }`}
      >
        <FileText size={15} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-[#17213D]">{name}</p>
        <p className="mt-0.5 text-[10px] font-medium text-[#525252]">{size}</p>
      </div>
      <button
        type="button"
        aria-label={`Download ${name}`}
        className="cursor-pointer text-[#6B7280]"
      >
        <DownloadSimple size={15} weight="bold" />
      </button>
    </div>
  );
}

export function MeetingDetailsScreen({
  onBack,
  onEdit,
}: {
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <section className="mr-auto w-full max-w-[1040px] rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to calendar"
              onClick={onBack}
              className="mt-2 flex h-7 w-5 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#237333]">
              <CalendarBlank size={20} weight="bold" />
            </span>
            <div>
              <h1 className="text-[16px] font-bold text-[#17213D]">
                Budget Review Q3
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#525252]">
                <span className="flex items-center gap-1.5">
                  <CalendarBlank size={13} weight="bold" />
                  18 June 2026 (Thursday)
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} weight="bold" />
                  10:00 AM -11:00 AM
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#172B58] px-5 text-[11px] font-bold text-white"
            >
              <VideoCamera size={13} weight="fill" />
              Join Meeting
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#237333] bg-white px-4 text-[11px] font-bold text-[#237333]"
            >
              <PencilSimple size={13} weight="bold" />
              Edit
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#F4B4B4] bg-white px-4 text-[11px] font-bold text-[#D71920]"
            >
              <XCircle size={13} weight="bold" />
              Cancel
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <DetailStat icon={Users} value="8" label="Participants" />
              <DetailStat icon={Clock} value="1 Hour" label="Duration" />
              <DetailStat icon={Bell} value="Upcoming" label="Status" />
            </div>

            <section className="rounded-lg bg-white p-5 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#282828]">
                <FileText size={14} weight="bold" className="text-[#237333]" />
                Description
              </h2>
              <p className="mt-5 max-w-[560px] text-[12px] font-medium leading-6 text-[#525252]">
                This meeting is to review the Q3 budget performance, analyze
                department expenses, discuss vendor payments, forecast upcoming
                budgets and define action items for the final quarter.
              </p>
              <p className="mt-5 text-[12px] font-medium text-[#525252]">
                Agenda Includes:
              </p>
              <ul className="mt-3 space-y-2 text-[12px] font-medium text-[#525252]">
                {[
                  "Q3 Budget Review",
                  "Department Expenses",
                  "Vendor Payments",
                  "Budget Forecast",
                  "Action Items",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#237333]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#282828]">
                <Link size={14} weight="bold" className="text-[#237333]" />
                Attachments
              </h2>
              <div className="mt-5 space-y-3">
                <AttachmentRow name="Budget_Q3.xlsx" size="245 KB" tone="green" />
                <AttachmentRow name="Expense_Report.pdf" size="1.2 MB" tone="red" />
                <AttachmentRow
                  name="Vendor_Payments.xlsx"
                  size="310 KB"
                  tone="green"
                />
              </div>
              <button
                type="button"
                className="mt-5 h-9 w-full cursor-pointer rounded-lg border border-dashed border-[#9FB49F] text-[11px] font-bold text-[#237333]"
              >
                Download All Files
              </button>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg bg-white p-5 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#282828]">
                <UserPlus size={14} weight="bold" className="text-[#237333]" />
                Organizer
              </h2>
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-[#F3FAF7] p-3">
                <Image
                  src="/maleuser.png"
                  alt="Arthur Sterling"
                  width={42}
                  height={42}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-[12px] font-bold text-[#17213D]">
                    Arthur Sterling (You)
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[#525252]">
                    Senior Financial Officer
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#282828]">
                  <Users size={14} weight="bold" className="text-[#237333]" />
                  Participants (8)
                </h2>
                <button
                  type="button"
                  className="cursor-pointer text-[11px] font-bold text-[#237333]"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {detailParticipants.map((participant) => (
                  <div key={participant.name} className="flex items-center gap-3">
                    <Image
                      src={participant.avatar}
                      alt={participant.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#17213D]">
                        {participant.name}
                      </p>
                      <p className="text-[10px] font-medium text-[#525252]">
                        {participant.role}
                      </p>
                    </div>
                    {participant.organizer ? (
                      <span className="rounded bg-[#E8F8EF] px-2 py-1 text-[8px] font-bold uppercase text-[#237333]">
                        Organizer
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-5 w-full cursor-pointer text-center text-[11px] font-bold text-[#237333]"
              >
                +3 More Participants
              </button>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-[0_5px_12px_rgba(15,23,42,0.14)]">
              <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#282828]">
                <Info size={14} weight="bold" className="text-[#237333]" />
                Meeting Details
              </h2>
              <div className="mt-5 space-y-4 text-[11px] font-medium">
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-[#525252]">
                    <VideoCamera size={13} weight="bold" />
                    Meeting Type
                  </span>
                  <span className="font-bold text-[#17213D]">Online</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-[#525252]">
                    <Link size={13} weight="bold" />
                    Location / Link
                  </span>
                  <span className="font-bold text-[#237333]">Google Meet</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-[#525252]">
                    <CalendarBlank size={13} weight="bold" />
                    Created On
                  </span>
                  <span className="font-bold text-[#17213D]">15 June 2026</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-[#525252]">
                    <User size={13} weight="bold" />
                    Created By
                  </span>
                  <span className="font-bold text-[#17213D]">Sarah Jenkins</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
