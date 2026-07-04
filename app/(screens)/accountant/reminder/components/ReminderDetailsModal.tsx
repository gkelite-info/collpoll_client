import { Bell, ClockClockwise, X } from "@phosphor-icons/react";

import { StatusBadge } from "./ReminderBadges";
import { toneClasses, type Reminder } from "./reminderData";

export function ReminderDetailsModal({
  reminder,
  onClose,
}: {
  reminder: Reminder | null;
  onClose: () => void;
}) {
  if (!reminder) return null;

  const Icon = reminder.icon;
  const dueDate =
    reminder.dueDate === "25 Jun 2026"
      ? "25 Jun 2026 (Today)"
      : reminder.dueDate;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 py-6">
      <section className="w-full max-w-[570px] overflow-hidden rounded-lg bg-white shadow-[0_22px_50px_rgba(15,23,42,0.28)]">
        <header className="flex items-center justify-between border-b border-[#DCE1E7] bg-[#F4F4F4] px-6 py-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[reminder.tone]}`}
            >
              <Icon size={18} weight="bold" />
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-[12px] font-bold text-[#17213D]">
                {reminder.title}
              </h2>
              <StatusBadge status={reminder.status} />
            </div>
          </div>
          <button
            type="button"
            aria-label="Close reminder details"
            onClick={onClose}
            className="cursor-pointer text-[#17213D]"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className="px-6 py-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Type
                </p>
                <div className="mt-2">
                  <span className="rounded-md bg-[#DDF8E9] px-2 py-1 text-[9px] font-bold text-[#237333]">
                    To Pay
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Category
                </p>
                <p className="mt-2 text-[12px] font-medium text-[#252525]">
                  {reminder.category}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Amount
                </p>
                <p className="mt-2 text-[20px] font-bold leading-none text-[#252525]">
                  {reminder.amount}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Due Date
                </p>
                <p
                  className={`mt-2 text-[12px] font-medium ${
                    reminder.status !== "UPCOMING"
                      ? "text-[#FF1F1F]"
                      : "text-[#17213D]"
                  }`}
                >
                  {dueDate}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-[#E6E8EB] pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Repeat Frequency
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#252525]">
                  <ClockClockwise size={12} weight="bold" />
                  Monthly
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Notify Before
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#252525]">
                  <Bell size={12} weight="bold" />
                  1 day before (24 Jun 2026)
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Created By
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full bg-cover bg-center ring-1 ring-white"
                    style={{ backgroundImage: "url('/maleuser.png')" }}
                  />
                  <p className="text-[12px] font-medium text-[#252525]">
                    Arjun Mehta
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#8C9AB0]">
                  Created On
                </p>
                <p className="mt-2 text-[12px] font-medium text-[#252525]">
                  10 Jun 2026, 10:30 AM
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-[#F4F4F4] px-4 py-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8A948F]">
              Description
            </p>
            <p className="mt-3 text-[11px] font-normal italic leading-relaxed text-[#252525]">
              &quot;Monthly electricity bill payment for main building.&quot;
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE1E7] bg-[#F4F4F4] px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              className="h-9 min-w-[78px] cursor-pointer rounded-md border border-[#9AA5B1] bg-white px-4 text-[11px] font-bold text-[#525252]"
            >
              Edit
            </button>
            <button
              type="button"
              className="h-9 min-w-[92px] cursor-pointer rounded-md border border-[#FF4B4B] bg-white px-4 text-[11px] font-bold text-[#FF1F1F]"
            >
              Delete
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 min-w-[78px] cursor-pointer rounded-md border border-[#C8D1DD] bg-white px-4 text-[11px] font-bold text-[#525252]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 min-w-[180px] cursor-pointer rounded-md bg-[#087A34] px-5 text-[11px] font-bold text-white shadow-[0_7px_16px_rgba(8,122,52,0.22)]"
            >
              Mark as Completed
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
