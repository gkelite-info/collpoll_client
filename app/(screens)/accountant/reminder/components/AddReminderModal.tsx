import { useMemo, useState, useEffect } from "react";
import { CaretDown, NotePencil, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";

import { createAccountantReminder, updateAccountantReminder } from "@/lib/helpers/accountant/accountantRemindersAPI";
import type { Reminder } from "./reminderData";

const defaultCategories = ["Utility", "Salary", "Fee Collection", "Subscription", "Tax"];

export function AddReminderModal({
  isOpen,
  onClose,
  collegeId,
  userId,
  onReminderAdded,
  reminderToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  collegeId: number | null;
  userId: number | null;
  onReminderAdded: () => void;
  reminderToEdit?: Reminder | null;
}) {
  const [reminderTitle, setReminderTitle] = useState("");
  const [type, setType] = useState("To Pay");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repeat, setRepeat] = useState("One Time");
  const [notifyBefore, setNotifyBefore] = useState("1 day before");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState(defaultCategories);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reminderToEdit && isOpen) {
      setReminderTitle(reminderToEdit.title || "");
      setType(reminderToEdit.type === "TO RECEIVE" ? "To Receive" : "To Pay");
      setCategory(reminderToEdit.category || "");
      setAmount(reminderToEdit.amount ? reminderToEdit.amount.replace(/\D/g, "") : "");
      setDueDate(reminderToEdit.rawDueDate || "");
      setRepeat(reminderToEdit.repeat || "One Time");
      setNotifyBefore(reminderToEdit.notifyBefore || "1 day before");
      setDescription(reminderToEdit.description || "");
      if (reminderToEdit.category && !defaultCategories.includes(reminderToEdit.category)) {
        setCategories((prev) => Array.from(new Set([...prev, reminderToEdit.category])));
      }
    } else if (!reminderToEdit && isOpen) {
      resetForm();
    }
  }, [reminderToEdit, isOpen]);

  const inputClass =
    "h-11 rounded-lg border border-[#6B7280] bg-white px-4 text-[14px] font-semibold text-[#17213D] outline-none placeholder:text-[#7B8AA3] focus:border-[#237333]";

  const helperClass = "mt-1.5 text-[10px] font-medium text-[#525252]";

  const categoryOptions = useMemo(
    () => Array.from(new Set(categories.map((item) => item.trim()).filter(Boolean))),
    [categories],
  );

  if (!isOpen) return null;

  const resetForm = () => {
    setReminderTitle("");
    setType("To Pay");
    setCategory("");
    setAmount("");
    setDueDate("");
    setRepeat("One Time");
    setNotifyBefore("1 day before");
    setDescription("");
    setIsCategoryOpen(false);
    setIsAddingCategory(false);
    setNewCategory("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddCategory = () => {
    const value = newCategory.trim();
    if (!value) {
      toast.error("Enter a category name.");
      return;
    }
    setCategories((prev) => Array.from(new Set([...prev, value])));
    setCategory(value);
    setNewCategory("");
    setIsAddingCategory(false);
    setIsCategoryOpen(false);
  };

  const handleSubmit = async () => {
    if (!collegeId || !userId) {
      toast.error("College or user context is unavailable.");
      return;
    }

    setIsSaving(true);
    try {
      if (reminderToEdit && reminderToEdit.id) {
        await updateAccountantReminder(reminderToEdit.id, {
          reminderTitle,
          type,
          category,
          amount: Number(amount),
          dueDate,
          repeat,
          notifyBefore,
          description,
        });
        toast.success("Reminder updated successfully.");
      } else {
        await createAccountantReminder({
          reminderTitle,
          type,
          category,
          amount: Number(amount),
          dueDate,
          repeat,
          notifyBefore,
          description,
          collegeId,
          createdBy: userId,
        });
        toast.success("Reminder added successfully.");
      }
      onReminderAdded();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to add reminder right now.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/55 px-4 py-6">
      <section className="mx-auto flex max-h-[78vh] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_20px_45px_rgba(15,23,42,0.24)]">
        <header className="flex shrink-0 items-center justify-between border-b border-[#E6E8EB] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DDF8E9] text-[#1A9B55]">
              <NotePencil size={20} weight="bold" />
            </span>
            <h2 className="text-[19px] font-bold text-[#17213D]">{reminderToEdit ? "Edit Reminder" : "Add Reminder"}</h2>
          </div>
          <button
            type="button"
            aria-label="Close add reminder modal"
            onClick={onClose}
            className="cursor-pointer text-[#8C9AB0]"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <form className="flex-1 overflow-y-auto px-6 py-6">
          <label className="block">
            <span className="text-[14px] font-bold text-[#17213D]">
              Reminder Title <span className="text-[#FF4B4B]">*</span>
            </span>
            <input
              type="text"
              value={reminderTitle}
              onChange={(event) => setReminderTitle(event.target.value)}
              placeholder="Enter reminder title"
              className={`mt-2 w-full ${inputClass}`}
            />
          </label>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Type <span className="text-[#FF4B4B]">*</span>
              </span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className={`mt-2 w-full cursor-pointer ${inputClass}`}
              >
                <option value="To Pay">To Pay</option>
              </select>
            </label>
            <label className="relative">
              <span className="text-[14px] font-bold text-[#17213D]">
                Category <span className="text-[#FF4B4B]">*</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryOpen((open) => !open)}
                className={`mt-2 flex w-full cursor-pointer items-center justify-between text-left ${inputClass}`}
              >
                <span className={category ? "text-[#17213D]" : "text-[#7B8AA3]"}>
                  {category || "Select category"}
                </span>
                <CaretDown size={14} weight="bold" />
              </button>
              {isCategoryOpen && (
                <div className="absolute left-0 right-0 top-[74px] z-20 overflow-hidden rounded-lg border border-[#DDE5EE] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
                  {categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCategory(option);
                        setIsCategoryOpen(false);
                        setIsAddingCategory(false);
                      }}
                      className="block w-full cursor-pointer px-4 py-2.5 text-left text-[13px] font-semibold text-[#17213D] hover:bg-[#F4F7FA]"
                    >
                      {option}
                    </button>
                  ))}
                  {!isAddingCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="block w-full cursor-pointer border-t border-[#E6E8EB] px-4 py-2.5 text-left text-[13px] font-bold text-[#087A34] hover:bg-[#F4F7FA]"
                    >
                      Other
                    </button>
                  ) : (
                    <div className="border-t border-[#E6E8EB] p-3">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="Enter category"
                        className="h-10 w-full rounded-md border border-[#C9D0D9] px-3 text-[13px] font-semibold text-[#17213D] outline-none focus:border-[#237333]"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategory("");
                          }}
                          className="h-8 cursor-pointer rounded-md border border-[#DDE5EE] px-3 text-[12px] font-bold text-[#525252]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="h-8 cursor-pointer rounded-md bg-[#087A34] px-4 text-[12px] font-bold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Amount <span className="text-[#FF4B4B]">*</span>
              </span>
              <div className={`mt-2 flex items-center gap-2 ${inputClass}`}>
                <span className="text-[14px] font-semibold text-[#17213D]">Rs</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                  placeholder="0.00"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Due Date <span className="text-[#FF4B4B]">*</span>
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className={`mt-2 w-full ${inputClass}`}
                style={{ colorScheme: "light" }}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Repeat <span className="text-[#FF4B4B]">*</span>
              </span>
              <select
                value={repeat}
                onChange={(event) => setRepeat(event.target.value)}
                className={`mt-2 w-full cursor-pointer ${inputClass}`}
              >
                <option>One Time</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </label>
            <label>
              <span className="text-[14px] font-bold text-[#17213D]">
                Notify Before <span className="text-[#FF4B4B]">*</span>
              </span>
              <select
                value={notifyBefore}
                onChange={(event) => setNotifyBefore(event.target.value)}
                className={`mt-2 w-full cursor-pointer ${inputClass}`}
              >
                <option>1 day before</option>
                <option>2 days before</option>
                <option>1 week before</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-[14px] font-bold text-[#17213D]">
              Description (Optional)
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter description or notes..."
              className="mt-2 min-h-[78px] w-full resize-none rounded-lg border border-[#6B7280] bg-white px-4 py-3 text-[14px] font-semibold text-[#17213D] outline-none placeholder:text-[#7B8AA3] focus:border-[#237333]"
            />
          </label>
        </form>

        <footer className="flex shrink-0 justify-end gap-4 border-t border-[#E6E8EB] px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 min-w-[118px] cursor-pointer rounded-lg border border-[#DDE5EE] bg-white px-6 text-[14px] font-bold text-[#525252]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-11 min-w-[160px] cursor-pointer rounded-lg bg-[#087A34] px-6 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(8,122,52,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (reminderToEdit ? "Updating..." : "Adding...") : (reminderToEdit ? "Update Reminder" : "Add Reminder")}
          </button>
        </footer>
      </section>
    </div>
  );
}
