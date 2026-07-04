"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { AddReminderModal } from "./AddReminderModal";
import { ReminderDetailsModal } from "./ReminderDetailsModal";
import { ReminderSummaryCard } from "./ReminderSummaryCard";
import { RemindersTable } from "./RemindersTable";
import { summaryCards, type Reminder } from "./reminderData";

export function ReminderScreen() {
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold leading-tight text-[#17213D]">
              Reminders
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
              Track and manage all your payment reminders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddReminderOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-6 text-[13px] font-bold text-white shadow-[0_6px_14px_rgba(67,193,122,0.18)]"
          >
            <Plus size={14} weight="bold" />
            Add Reminder
          </button>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          {summaryCards.map((item) => (
            <ReminderSummaryCard key={item.label} item={item} />
          ))}
        </section>

        <RemindersTable onSelectReminder={setSelectedReminder} />
      </div>

      <AddReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
      />
      <ReminderDetailsModal
        reminder={selectedReminder}
        onClose={() => setSelectedReminder(null)}
      />
    </main>
  );
}
