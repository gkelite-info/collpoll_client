import {
  CaretDown,
  DotsThreeVertical,
  MagnifyingGlass,
} from "@phosphor-icons/react";

import { StatusBadge, TypeBadge } from "./ReminderBadges";
import { reminders, toneClasses, type Reminder } from "./reminderData";

function FilterButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 items-center gap-2 rounded-md border border-[#DDE5EE] bg-white px-4 text-[11px] font-semibold text-[#17213D]"
    >
      {label}
      <CaretDown size={12} weight="bold" />
    </button>
  );
}

export function RemindersTable({
  onSelectReminder,
}: {
  onSelectReminder: (reminder: Reminder) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <label className="flex h-9 min-w-[300px] items-center gap-3 rounded-md border border-[#DDE5EE] bg-white px-4 text-[#7B8AA3]">
          <MagnifyingGlass size={14} weight="bold" />
          <input
            type="search"
            placeholder="Search reminders..."
            className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8AA3]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <FilterButton label="All Types" />
          <FilterButton label="All Categories" />
          <FilterButton label="All Statuses" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-[#F1F4F7]">
            <tr className="text-[10px] font-bold uppercase tracking-wide text-[#8C9AB0]">
              <th className="px-7 py-4">Reminder</th>
              <th className="px-7 py-4">Type</th>
              <th className="px-7 py-4">Category</th>
              <th className="px-7 py-4">Amount</th>
              <th className="px-7 py-4">Due Date</th>
              <th className="px-7 py-4">Status</th>
              <th className="px-7 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder) => {
              const Icon = reminder.icon;

              return (
                <tr
                  key={reminder.title}
                  className="border-b border-[#E9EEF4] text-[11px] font-medium text-[#17213D]"
                >
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[reminder.tone]}`}
                      >
                        <Icon size={16} weight="bold" />
                      </span>
                      <span className="font-bold">{reminder.title}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <TypeBadge type={reminder.type} />
                  </td>
                  <td className="px-7 py-5">{reminder.category}</td>
                  <td className="px-7 py-5 font-bold">{reminder.amount}</td>
                  <td className="px-7 py-5">
                    <p className="font-bold">{reminder.dueDate}</p>
                    <p
                      className={`mt-0.5 text-[9px] font-bold ${
                        reminder.dueMeta.includes("OVERDUE")
                          ? "text-[#FF4B4B]"
                          : reminder.dueMeta === "DUE TODAY"
                            ? "text-[#FF4B4B]"
                            : "text-[#3478F6]"
                      }`}
                    >
                      {reminder.dueMeta}
                    </p>
                  </td>
                  <td className="px-7 py-5">
                    <StatusBadge status={reminder.status} />
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        aria-label={`Actions for ${reminder.title}`}
                        onClick={() => onSelectReminder(reminder)}
                        className="cursor-pointer text-[#7B8AA3]"
                      >
                        <DotsThreeVertical size={16} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
