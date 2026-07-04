"use client";

import { useMemo, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Plus,
  SlidersHorizontal,
  User,
  Users,
} from "@phosphor-icons/react";
import { buildCalendarRows, meetings, monthFormatter, stats } from "./calendarData";

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[76px] min-w-0 items-center gap-4 rounded-lg bg-white px-7 shadow-[0_5px_14px_rgba(15,23,42,0.14)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F8EF] text-[#237333]">
        <Icon size={18} weight="bold" />
      </span>
      <div>
        <p className="text-[22px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[#525252]">
          {item.label}
        </p>
      </div>
    </article>
  );
}

function CalendarDay({
  day,
  muted,
  danger,
  selected,
  dots,
}: {
  day: string;
  muted?: boolean;
  danger?: boolean;
  selected?: boolean;
  dots?: number;
}) {
  if (selected) {
    return (
      <div className="flex h-16 items-center justify-center">
        <div className="flex h-[58px] w-[50px] flex-col items-center justify-center rounded-full bg-[#43C17A] text-white shadow-[0_8px_18px_rgba(67,193,122,0.32)]">
          <span className="text-[15px] font-bold leading-tight">{day}</span>
          <span className="mt-0.5 text-[12px] font-bold leading-none">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-16 flex-col items-center justify-center">
      <span
        className={`text-[13px] font-semibold ${
          danger ? "text-[#E5484D]" : muted ? "text-[#A8AEB7]" : "text-[#17213D]"
        }`}
      >
        {day}
      </span>
      <div className="mt-3 flex h-2 items-center gap-1">
        {Array.from({ length: dots ?? 0 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#237333]" />
        ))}
      </div>
    </div>
  );
}

function CalendarPanel() {
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 5, 1));
  const calendarRows = useMemo(() => buildCalendarRows(monthDate), [monthDate]);
  const monthTitle = monthFormatter.format(monthDate);

  const goToMonth = (offset: number) => {
    setMonthDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + offset);
      return next;
    });
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_5px_14px_rgba(15,23,42,0.14)]">
      <div className="mb-7 flex items-center gap-6">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => goToMonth(-1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#D7DEE6] text-[#17213D]"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <h2 className="min-w-[130px] text-center text-[18px] font-bold text-[#17213D]">
          {monthTitle}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => goToMonth(1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#D7DEE6] text-[#17213D]"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wide text-[#525252]">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-5 divide-y divide-[#EEF1F4]">
        {calendarRows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7">
            {row.map((item, index) => (
              <CalendarDay key={`${rowIndex}-${index}`} {...item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function MeetingCard({
  item,
  onViewDetails,
}: {
  item: (typeof meetings)[number];
  onViewDetails: () => void;
}) {
  const Icon = item.icon;

  return (
    <article className="relative pl-4">
      <span className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full bg-[#237333]" />
      <div className="rounded-lg bg-white p-3">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E8F8EF] text-[#237333]">
            <Icon size={15} weight="bold" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[12px] font-bold text-[#17213D]">{item.title}</h3>
            <p className="mt-0.5 text-[10px] font-medium text-[#525252]">
              {item.time}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wide text-[#525252]">
              Organized By
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCEAFF] text-[#17213D]">
                <User size={11} weight="fill" />
              </span>
              <p className="text-[9px] font-semibold leading-tight text-[#17213D]">
                {item.organizer}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wide text-[#525252]">
              Participants
            </p>
            <div className="mt-1 flex items-start gap-1.5">
              <Users size={11} weight="bold" className="mt-0.5 shrink-0 text-[#17213D]" />
              <p className="text-[9px] font-semibold leading-tight text-[#17213D]">
                {item.participants}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-8 cursor-pointer rounded-md bg-[#172B58] px-3 text-[10px] font-bold text-white"
          >
            Join Meeting
          </button>
          <button
            type="button"
            onClick={onViewDetails}
            className="h-8 cursor-pointer rounded-md border border-[#237333] bg-white px-3 text-[10px] font-bold text-[#237333]"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

function MeetingsPanel({ onViewDetails }: { onViewDetails: () => void }) {
  return (
    <aside className="rounded-lg bg-white p-5 shadow-[0_5px_14px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#17213D]">Meetings</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 items-center gap-2 rounded-md bg-[#F0F2F4] px-3 text-[10px] font-semibold text-[#17213D]"
          >
            All Meetings
            <CaretRight size={10} weight="bold" className="rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Filter meetings"
            className="flex h-7 w-7 cursor-pointer items-center justify-center text-[#17213D]"
          >
            <SlidersHorizontal size={15} weight="bold" />
          </button>
        </div>
      </div>
      <p className="mt-5 text-[9px] font-bold uppercase tracking-wide text-[#525252]">
        Today - 18 June 2026
      </p>
      <div className="mt-4 space-y-3">
        {meetings.map((item) => (
          <MeetingCard
            key={item.title}
            item={item}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </aside>
  );
}
type CalendarMeetingsScreenProps = {
  onOpenSchedule: () => void;
  onViewMeetingDetails: () => void;
};

export function CalendarMeetingsScreen({
  onOpenSchedule,
  onViewMeetingDetails,
}: CalendarMeetingsScreenProps) {
  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#282828]">
              Calendar &amp; Meetings
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#282828]">
              View your schedule, upcoming meetings and stay on track.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-6 text-[12px] font-bold text-white shadow-[0_6px_14px_rgba(67,193,122,0.28)]"
          >
            <Plus size={14} weight="bold" />
            Schedule Meeting
          </button>
        </section>

        <section className="rounded-lg bg-white px-14 py-3 shadow-[0_5px_14px_rgba(15,23,42,0.14)]">
          <div className="grid gap-5 md:grid-cols-3">
            {stats.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <CalendarPanel />
          <MeetingsPanel onViewDetails={onViewMeetingDetails} />
        </section>
      </div>
    </main>
  );
}
