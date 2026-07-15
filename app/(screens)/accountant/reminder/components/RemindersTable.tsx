import {
  CaretDown,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CalendarBlank,
} from "@phosphor-icons/react";

import { StatusBadge, TypeBadge } from "./ReminderBadges";
import { useState, useEffect, useRef } from "react";
import { toneClasses, type Reminder } from "./reminderData";
import { Pagination } from "../../../admin/academic-setup/components/pagination";

export function RemindersTable({
  reminders,
  isLoading,
  error,
  onSelectReminder,
  onUpdateStatus,
  onDeleteReminder,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
}: {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  onSelectReminder: (reminder: Reminder) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  onDeleteReminder?: (reminder: Reminder) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Reset page when filters change (reminders array changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [reminders]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reminders.map((r) => r.id as number).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  const categories = ["Utility", "Salary", "Fee Collection", "Subscription", "Tax", "Purchase", "Furniture"];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReminders = reminders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.08)] flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <label className="flex h-9 min-w-[300px] items-center gap-3 rounded-md border border-[#DDE5EE] bg-white px-4 text-[#7B8AA3]">
          <MagnifyingGlass size={14} weight="bold" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reminders..."
            className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8AA3]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker()}
              className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors ${
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
              onChange={(e) => onDateChange(e.target.value)}
              className="absolute left-1/2 top-1/2 -z-10 h-0 w-0 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="flex h-9 cursor-pointer appearance-none items-center gap-2 rounded-md border border-[#DDE5EE] bg-white pl-4 pr-8 text-[11px] font-semibold text-[#17213D] outline-none"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#17213D]" />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="flex h-9 cursor-pointer appearance-none items-center gap-2 rounded-md border border-[#DDE5EE] bg-white pl-4 pr-8 text-[11px] font-semibold text-[#17213D] outline-none"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="DUE TODAY">Due Today</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#17213D]" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
        <table className="w-full min-w-[980px] border-collapse text-left relative">
          <thead className="bg-[#F1F4F7] sticky top-0 z-10 shadow-[0_1px_0_#DDE5EE]">
            <tr className="text-[10px] font-bold uppercase tracking-wide text-[#8C9AB0]">
              <th className="px-7 py-4 w-[40px]">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={reminders.length > 0 && selectedIds.length === reminders.length}
                  className="cursor-pointer"
                />
              </th>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`reminder-shimmer-${rowIndex}`}>
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <td key={`reminder-shimmer-${rowIndex}-${cellIndex}`} className="px-7 py-5">
                      <div
                        className={`h-4 animate-pulse rounded bg-slate-200 ${cellIndex === 1 ? "w-36" : cellIndex === 7 ? "ml-auto w-8" : "w-20"
                          }`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedReminders.length > 0 ? (
              paginatedReminders.map((reminder) => {
                const Icon = reminder.icon;

                return (
                  <tr
                    key={reminder.id ?? reminder.title}
                    className="border-b border-[#E9EEF4] text-[11px] font-medium text-[#17213D]"
                  >
                    <td className="px-7 py-5 w-[40px]">
                      <input
                        type="checkbox"
                        checked={reminder.id ? selectedIds.includes(reminder.id) : false}
                        onChange={(e) => reminder.id && handleSelectRow(reminder.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
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
                        className={`mt-0.5 text-[9px] font-bold ${reminder.dueMeta.includes("OVERDUE")
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
                      {onUpdateStatus && reminder.id ? (
                        <select
                          value={reminder.status}
                          onChange={(e) => onUpdateStatus(reminder.id as number, e.target.value)}
                          disabled={!(reminder.id && selectedIds.includes(reminder.id))}
                          className={`cursor-pointer appearance-none rounded-full px-3 py-1.5 text-[10px] font-bold outline-none border border-transparent disabled:cursor-not-allowed disabled:opacity-100 ${reminder.status === "OVERDUE"
                            ? "bg-[#FFE8E7] text-[#FF4B4B]"
                            : reminder.status === "DUE TODAY"
                              ? "bg-[#FFF0DF] text-[#FF8B25]"
                              : reminder.status === "COMPLETED"
                                ? "bg-[#F0E7FF] text-[#7D4DFF]"
                                : "bg-[#E8F1FF] text-[#3478F6]"
                            }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${reminder.status === "OVERDUE"
                              ? "FF4B4B"
                              : reminder.status === "DUE TODAY"
                                ? "FF8B25"
                                : reminder.status === "COMPLETED"
                                  ? "7D4DFF"
                                  : "3478F6"
                              }%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 8px top 50%",
                            backgroundSize: "8px auto",
                            paddingRight: "24px",
                          }}
                        >
                          <option value="UPCOMING">Upcoming</option>
                          <option value="DUE TODAY">Due Today</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <StatusBadge status={reminder.status} />
                      )}
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          aria-label={`Edit ${reminder.title}`}
                          onClick={() => onSelectReminder(reminder)}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#3478F6] transition-colors"
                        >
                          <PencilSimple size={16} weight="bold" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${reminder.title}`}
                          onClick={() => onDeleteReminder && onDeleteReminder(reminder)}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#FF4B4B] transition-colors"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-7 py-8 text-center text-[12px] font-semibold text-[#7B8AA3]">
                  {error ?? "No reminders found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={reminders.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        disabled={isLoading}
      />
    </section>
  );
}
