"use client";

import { FormEvent, useState } from "react";
import { CalendarBlank, CircleNotch, UserPlus, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";

export type VisitorCategory = "Parent" | "Guest" | "Other";

export type NewCampusVisitor = {
  name: string;
  mobile: string;
  category: VisitorCategory;
  purpose: string;
  numberOfVisitors: number;
  date: string;
  entryTime: string;
  exitTime: string;
};

export function AddCampusVisitorModal({
  onClose,
  onSave,
  initialVisitor,
  isSaving = false,
}: {
  onClose: () => void;
  onSave: (visitor: NewCampusVisitor) => void;
  initialVisitor?: NewCampusVisitor;
  isSaving?: boolean;
}) {
  const now = new Date();
  const [form, setForm] = useState<NewCampusVisitor>({
    name: initialVisitor?.name ?? "",
    mobile: initialVisitor?.mobile ?? "",
    category: initialVisitor?.category ?? "Parent",
    purpose: initialVisitor?.purpose ?? "",
    numberOfVisitors: initialVisitor?.numberOfVisitors ?? 1,
    date: initialVisitor?.date ?? new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(now),
    entryTime: initialVisitor?.entryTime ?? new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    exitTime: initialVisitor?.exitTime ?? "-",
  });

  const fieldClass =
    "mt-2 h-10 w-full rounded-md border border-[#D7DFEC] bg-white px-3 text-sm text-[#16284F] outline-none placeholder:text-[#94A3B8] focus:border-[#43C17A]";
  const purposeFieldClass =
    `${fieldClass} overflow-x-auto whitespace-nowrap no-scrollbar`;
  const labelClass = "block text-[11px] font-bold uppercase text-[#475569]";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const mobile = form.mobile.trim();
    if (!form.name.trim()) {
      toast.error("Please enter the visitor name.");
      return;
    }
    if (!mobile) {
      toast.error("Please enter the mobile number.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }
    if (!form.category) {
      toast.error("Please select a visitor category.");
      return;
    }
    if (!form.purpose.trim()) {
      toast.error("Please enter the purpose of visit.");
      return;
    }
    if (!form.numberOfVisitors || form.numberOfVisitors < 1) {
      toast.error("Please select the number of visitors.");
      return;
    }
    if (!form.date.trim()) {
      toast.error("Please select the visit date.");
      return;
    }
    if (!form.entryTime.trim()) {
      toast.error("Please enter the entry time.");
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      mobile,
      purpose: form.purpose.trim(),
      exitTime: form.exitTime.trim(),
    });
  };

  const isFormInvalid =
    !form.name.trim() ||
    !/^\d{10}$/.test(form.mobile.trim()) ||
    !form.category ||
    !form.purpose.trim() ||
    !form.numberOfVisitors ||
    form.numberOfVisitors < 1 ||
    !form.date.trim() ||
    !form.entryTime.trim();

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-[3px]"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="my-auto flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#E8F8EF] text-[#169653]">
              <UserPlus size={19} weight="bold" />
            </span>
            <h2 className="text-base font-extrabold text-[#16284F]">Add Visitor</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            title="Close"
            className="cursor-pointer text-[#94A3B8] hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <h3 className="text-xs font-extrabold text-[#334155]">Visitor Information</h3>

          <label className={labelClass}>
            Visitor Name <span className="text-red-500">*</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Enter visitor name"
              className={fieldClass}
            />
          </label>

          <label className={labelClass}>
            Mobile Number <span className="text-red-500">*</span>
            <input
              required
              type="tel"
              value={form.mobile}
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              onChange={(event) =>
                setForm({ ...form, mobile: event.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              placeholder="Enter mobile number"
              className={fieldClass}
            />
          </label>

          <fieldset>
            <legend className={labelClass}>
              Visitor Category <span className="text-red-500">*</span>
            </legend>
            <div className="mt-2 grid gap-2 rounded-md border border-[#D7DFEC] p-3 sm:grid-cols-3">
              {(["Parent", "Guest", "Other"] as VisitorCategory[]).map((category) => (
                <label key={category} className="flex cursor-pointer items-center gap-2 text-sm text-[#34425E]">
                  <input
                    type="radio"
                    name="visitor-category"
                    checked={form.category === category}
                    onChange={() => setForm({ ...form, category })}
                    className="accent-[#22B967]"
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <h3 className="pt-1 text-xs font-extrabold text-[#334155]">Visit Information</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Purpose of Visit <span className="text-red-500">*</span>
              <input
                required
                value={form.purpose}
                onChange={(event) => setForm({ ...form, purpose: event.target.value })}
                placeholder="Enter purpose"
                className={purposeFieldClass}
              />
            </label>

            <label className={labelClass}>
              Number of Visitors <span className="text-red-500">*</span>
              <select
                value={form.numberOfVisitors}
                onChange={(event) =>
                  setForm({ ...form, numberOfVisitors: Number(event.target.value) })
                }
                className={fieldClass}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className={labelClass}>Date <span className="text-red-500">*</span></span>
            <div className="mt-2 flex h-10 items-center gap-2 rounded-md border border-[#D7DFEC] bg-[#F8FAFC] px-3 text-sm text-[#475569]">
              <CalendarBlank size={16} className="text-[#94A3B8]" />
              {form.date}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Entry Time <span className="text-red-500">*</span>
              <input
                required
                value={form.entryTime}
                onChange={(event) => setForm({ ...form, entryTime: event.target.value })}
                placeholder="Enter entry time"
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              Exit Time
              <input
                value={form.exitTime}
                onChange={(event) => setForm({ ...form, exitTime: event.target.value })}
                placeholder="Enter exit time"
                className={fieldClass}
              />
            </label>
          </div>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#E2E8F0] bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 cursor-pointer rounded-md border border-[#D7DFEC] text-sm font-bold text-[#334155] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isFormInvalid}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#169653] text-sm font-bold text-white hover:bg-[#117D45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                Saving...
              </>
            ) : initialVisitor ? "Update Visitor" : "Add Visitor"}
          </button>
        </footer>
      </form>
    </div>
  );
}
