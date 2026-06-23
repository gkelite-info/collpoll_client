"use client";

import { FloppyDisk, X } from "@phosphor-icons/react";
import { useState } from "react";

export type NewCampusVisitor = {
  name: string;
  mobile: string;
  purpose: string;
  entryTime: string;
};

export function AddCampusVisitorModal({ onClose, onSave }: { onClose: () => void; onSave: (visitor: NewCampusVisitor) => void }) {
  const [form, setForm] = useState<NewCampusVisitor>({ name: "", mobile: "", purpose: "", entryTime: new Date().toTimeString().slice(0, 5) });
  const fieldClass = "mt-1 h-10 w-full rounded border border-[#D7DFEC] px-3 text-sm outline-none focus:border-[#43C17A]";

  const submit = () => {
    if (!form.name.trim() || !form.mobile.trim() || !form.purpose.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/55 p-3">
      <div className="relative w-full max-w-[560px] rounded-xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} title="Close" className="absolute right-5 top-5 cursor-pointer text-[#94A3B8] hover:text-[#EF4444]"><X size={18} weight="bold" /></button>
        <header className="border-b border-[#E2E8F0] px-6 py-5"><h2 className="text-xl font-extrabold text-[#16284F]">Add Visitor</h2><p className="mt-1 text-sm text-[#64748B]">Register a new campus visitor entry.</p></header>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#334155]">Visitor Name <span className="text-red-500">*</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter visitor name" className={fieldClass} /></label>
          <label className="text-sm font-bold text-[#334155]">Mobile Number <span className="text-red-500">*</span><input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="Enter mobile number" className={fieldClass} /></label>
          <label className="text-sm font-bold text-[#334155] sm:col-span-2">Purpose <span className="text-red-500">*</span><input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} placeholder="Enter purpose of visit" className={fieldClass} /></label>
          <label className="text-sm font-bold text-[#334155]">Entry Time <span className="text-red-500">*</span><input type="time" value={form.entryTime} onChange={(event) => setForm({ ...form, entryTime: event.target.value })} className={fieldClass} /></label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-[#E2E8F0] px-6 py-4"><button type="button" onClick={onClose} className="h-10 cursor-pointer rounded border border-[#D7DFEC] px-5 text-sm font-bold text-[#334155]">Cancel</button><button type="button" onClick={submit} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#43C17A] px-5 text-sm font-bold text-white hover:bg-[#35A968]"><FloppyDisk size={16} weight="bold" />Save Visitor</button></footer>
      </div>
    </div>
  );
}
