"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Plus, CalendarBlank } from "@phosphor-icons/react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchAccountantReminders,
  updateAccountantReminderStatus,
  deleteAccountantReminder,
  type AccountantReminder,
} from "@/lib/helpers/accountant/accountantRemindersAPI";
import { AddReminderModal } from "./AddReminderModal";
import { ReminderDetailsModal } from "./ReminderDetailsModal";
import { ReminderSummaryCard } from "./ReminderSummaryCard";
import { RemindersTable } from "./RemindersTable";
import ConfirmDeleteModal from "../../../admin/calendar/components/ConfirmDeleteModal";
import { reminders as fallbackReminders, summaryCards, type Reminder } from "./reminderData";

const categoryToneMap: Record<string, Reminder["tone"]> = {
  utility: "red",
  salary: "orange",
  "fee collection": "green",
  subscription: "purple",
  tax: "pink",
  purchase: "blue",
};

const categoryIconMap = new Map(
  fallbackReminders.map((reminder) => [
    reminder.category.toLocaleLowerCase("en-IN"),
    reminder.icon,
  ]),
);

function formatCurrency(amount: number) {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getReminderStatus(dueDate: string, isActive: boolean | null): Pick<Reminder, "status" | "dueMeta"> {
  if (isActive === false) {
    return { status: "COMPLETED", dueMeta: "COMPLETED" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) {
    return { status: "UPCOMING", dueMeta: "UPCOMING" };
  }

  const dayDiff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (dayDiff === 0) return { status: "DUE TODAY", dueMeta: "DUE TODAY" };
  if (dayDiff < 0) {
    return {
      status: "OVERDUE",
      dueMeta: `OVERDUE BY ${Math.abs(dayDiff)} DAY${Math.abs(dayDiff) === 1 ? "" : "S"}`,
    };
  }

  return { status: "UPCOMING", dueMeta: "UPCOMING" };
}

function mapReminder(row: AccountantReminder): Reminder {
  const categoryKey = row.category.toLocaleLowerCase("en-IN");
  const status = getReminderStatus(row.dueDate, row.isActive);

  return {
    id: row.accountantReminderId,
    title: row.reminderTitle,
    type: row.type.toLocaleUpperCase("en-IN"),
    category: row.category,
    amount: formatCurrency(row.amount),
    dueDate: formatDate(row.dueDate),
    icon: categoryIconMap.get(categoryKey) ?? fallbackReminders[0].icon,
    tone: categoryToneMap[categoryKey] ?? "blue",
    repeat: row.repeat,
    notifyBefore: row.notifyBefore,
    description: row.description,
    rawDueDate: row.dueDate,
    ...status,
  };
}

export function ReminderScreen() {
  const { collegeId, userId, loading: userLoading } = useUser();
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusToUpdate, setStatusToUpdate] = useState<{ id: number; status: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (userLoading) return;
    let isActive = true;

    async function loadReminders() {
      if (!collegeId) {
        setReminders([]);
        setError("College context is unavailable for this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const rows = await fetchAccountantReminders(
          collegeId,
          debouncedSearchQuery,
          selectedCategory,
          selectedStatus,
          selectedDate
        );
        if (isActive) setReminders(rows.map(mapReminder));
      } catch (err) {
        console.error("Failed to load accountant reminders", err);
        if (isActive) {
          setError("Unable to load reminders right now.");
          toast.error("Unable to load reminders right now.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadReminders();

    return () => {
      isActive = false;
    };
  }, [collegeId, refreshKey, userLoading, debouncedSearchQuery, selectedCategory, selectedStatus, selectedDate]);

  const handleUpdateStatus = async (id: number, statusStr: string) => {
    setStatusToUpdate({ id, status: statusStr });
  };

  const confirmUpdateStatus = async () => {
    if (!statusToUpdate) return;
    const { id, status } = statusToUpdate;
    setIsUpdatingStatus(true);
    const isActive = status !== "COMPLETED";
    try {
      await updateAccountantReminderStatus(id, isActive);
      toast.success("Status updated");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
      setStatusToUpdate(null);
    }
  };

  const confirmDelete = async () => {
    if (!reminderToDelete || !reminderToDelete.id) return;
    setIsDeleting(true);
    try {
      await deleteAccountantReminder(reminderToDelete.id);
      toast.success("Reminder deleted");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to delete reminder");
    } finally {
      setIsDeleting(false);
      setReminderToDelete(null);
    }
  };

  const dynamicSummaryCards = useMemo(() => {
    const totals = reminders.reduce(
      (acc, reminder) => {
        const amount = Number(reminder.amount.replace(/[^\d]/g, "")) || 0;
        if (reminder.status === "DUE TODAY") acc.dueToday += amount;
        else if (reminder.status === "UPCOMING") acc.upcoming += amount;
        else if (reminder.status === "OVERDUE") acc.overdue += amount;
        else acc.completed += amount;
        return acc;
      },
      { dueToday: 0, upcoming: 0, overdue: 0, completed: 0 },
    );

    return summaryCards.map((card) => {
      const key =
        card.label === "Due Today"
          ? "dueToday"
          : card.label === "Upcoming"
            ? "upcoming"
            : card.label === "Overdue"
              ? "overdue"
              : "completed";

      return { ...card, value: formatCurrency(totals[key]) };
    });
  }, [reminders]);

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
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-colors ${
                  selectedDate ? "bg-[#E4FAED] text-[#1A9B55]" : "bg-white border border-[#DDE5EE] text-[#7B8AA3] hover:text-[#17213D]"
                }`}
              >
                <CalendarBlank size={16} weight="bold" />
                <span>
                  {selectedDate
                    ? (() => {
                        const parts = selectedDate.split("-");
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        return selectedDate;
                      })()
                    : "Select Date"}
                </span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute left-1/2 top-1/2 -z-10 h-0 w-0 -translate-x-1/2 -translate-y-1/2 opacity-0"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAddReminderOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-6 text-[13px] font-bold text-white shadow-[0_6px_14px_rgba(67,193,122,0.18)]"
            >
              <Plus size={14} weight="bold" />
              Add Reminder
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          {dynamicSummaryCards.map((item) => (
            <ReminderSummaryCard key={item.label} item={item} isLoading={isLoading || userLoading} />
          ))}
        </section>

        <RemindersTable
          reminders={reminders}
          isLoading={isLoading || userLoading}
          error={error}
          onSelectReminder={(reminder) => {
            setSelectedReminder(reminder);
            setIsAddReminderOpen(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onDeleteReminder={setReminderToDelete}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      <AddReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => {
          setIsAddReminderOpen(false);
          setTimeout(() => setSelectedReminder(null), 200); // clear after animation
        }}
        collegeId={collegeId}
        userId={userId}
        onReminderAdded={() => setRefreshKey((key) => key + 1)}
        reminderToEdit={selectedReminder}
      />
      <ReminderDetailsModal
        reminder={null} // Disable details modal since we use AddReminderModal for editing now
        onClose={() => {}}
      />
      <ConfirmDeleteModal
        open={!!reminderToDelete}
        onConfirm={confirmDelete}
        onCancel={() => setReminderToDelete(null)}
        isDeleting={isDeleting}
        title="Delete Reminder"
        itemName={reminderToDelete?.title}
        confirmText="Yes, Delete"
        actionType="remove"
      />
      <ConfirmDeleteModal
        open={!!statusToUpdate}
        onConfirm={confirmUpdateStatus}
        onCancel={() => setStatusToUpdate(null)}
        isDeleting={isUpdatingStatus}
        title="Change Status"
        customDescription={
          statusToUpdate ? (
            <span>
              Are you sure you want to change the status to <span className="font-bold text-[#17213D]">{statusToUpdate.status}</span>?
            </span>
          ) : undefined
        }
        confirmText="Yes, Update"
        loadingText="Updating..."
        actionType="accept"
      />
    </main>
  );
}
