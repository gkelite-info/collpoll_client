"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { recentExpenseRecords } from "./data";

function RecentExpenseRecords() {
  return (
    <section className="min-h-[380px] flex-1 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#17213D]">
          Recent Expense Records
        </h2>
        <button type="button" className="text-xs font-bold text-[#43C17A]">
          View All
        </button>
      </div>

      <div className="mt-5 flex h-[calc(100%-34px)] flex-col gap-4 overflow-y-auto pr-1">
        {recentExpenseRecords.map((item, index) => {
          const Icon = item.icon;

          return (
            <article key={`${item.title}-${index}`} className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon size={18} weight="fill" color={item.color} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold leading-tight text-[#17213D]">
                  {item.title}
                </h3>
                <p className="text-[11px] leading-tight text-gray-500">{item.subtitle}</p>
                <p className="text-[11px] leading-tight text-gray-500">{item.date}</p>
              </div>
              <p className="shrink-0 text-[13px] font-bold text-[#17213D]">
                {item.amount}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function AccountantDashboardRight() {
  return (
    <aside className="hidden flex-col gap-4 border-l border-gray-100 p-2 md:flex md:w-[32%]">
      <CourseScheduleCard isVisibile={false} />
      <WorkWeekCalendar />
      <RecentExpenseRecords />
    </aside>
  );
}
