"use client";

import { useEffect, useState } from "react";
import { Buildings, Clock, FloppyDisk, Plus, User, Wrench, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { fetchInventoryAssets, type InventoryAssetRow } from "@/lib/helpers/inventory/inventoryAssetAPI";

type EquipmentRow = {
  id: number;
  inventoryAssetId: string;
};

export function NewVisitorEntryModal({
  inventoryContext,
  onClose,
  onSave,
}: {
  inventoryContext?: { collegeId: number; categoryId: number };
  onClose: () => void;
  onSave: () => void;
}) {
  const inputClass = "mt-1 h-8 w-full rounded border border-[#DCE5EF] bg-white px-2.5 text-xs text-[#334155] outline-none focus:border-[#43C17A]";
  const labelClass = "text-xs font-bold text-[#334155]";
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([{ id: 0, inventoryAssetId: "" }]);
  const [inventoryAssets, setInventoryAssets] = useState<InventoryAssetRow[] | null>(null);
  const isEquipmentLoading = Boolean(inventoryContext && inventoryAssets === null);

  useEffect(() => {
    if (!inventoryContext) {
      return;
    }

    let active = true;
    fetchInventoryAssets(inventoryContext.collegeId, inventoryContext.categoryId)
      .then((assets) => {
        if (active) setInventoryAssets(assets);
      })
      .catch((error) => {
        if (!active) return;
        setInventoryAssets([]);
        toast.error(error instanceof Error ? error.message : "Failed to load equipment.");
      });

    return () => { active = false; };
  }, [inventoryContext]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/55 p-3">
      <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[720px] overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button type="button" onClick={onClose} title="Close" className="absolute right-4 top-4 cursor-pointer text-[#94A3B8] hover:text-[#EF4444]"><X size={15} weight="bold" /></button>
        <header className="border-b border-[#E8EEF5] px-5 py-4"><h2 className="text-base font-extrabold text-[#1F2937]">New Entry - Sports Room Register</h2><p className="mt-0.5 text-xs text-[#94A3B8]">Record a new visitor entry and equipment issue.</p></header>

        <div className="space-y-4 px-5 py-4">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><User size={16} className="text-[#16A85B]" />1. Student Information</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Full Name <span className="text-red-500">*</span><input className={inputClass} placeholder="Enter full name" /></label>
              <label className={labelClass}>Student ID <span className="text-red-500">*</span><input className={inputClass} placeholder="Enter student ID" /></label>
              <label className={labelClass}>Department <span className="text-red-500">*</span><select className={inputClass} defaultValue=""><option value="" disabled>Select department</option><option>Computer Science</option><option>Commerce</option></select></label>
              <label className={labelClass}>Branch <span className="text-red-500">*</span><select className={inputClass} defaultValue=""><option value="" disabled>Select branch</option><option>CSE</option><option>ECE</option></select></label>
              <label className={labelClass}>Year <span className="text-red-500">*</span><select className={inputClass} defaultValue=""><option value="" disabled>Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option></select></label>
              <label className={labelClass}>Section <span className="text-red-500">*</span><select className={inputClass} defaultValue=""><option value="" disabled>Select section</option><option>A</option><option>B</option></select></label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Buildings size={16} className="text-[#16A85B]" />2. Purpose of Visit</h3>
            <label className={labelClass}>Purpose of Visit <span className="text-red-500">*</span><textarea rows={2} className="mt-1 w-full resize-none rounded border border-[#DCE5EF] p-2.5 text-xs outline-none focus:border-[#43C17A]" placeholder="Enter purpose of visit in detail..." /></label>
            <div className="mt-1 flex justify-between text-xs text-[#94A3B8]"><span>Provide complete details about why the student is visiting the sports room.</span><span>0 / 500 characters</span></div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Clock size={16} className="text-[#16A85B]" />3. Visit Details</h3>
            <div className="grid gap-3 md:grid-cols-3"><label className={labelClass}>Entry Date <span className="text-red-500">*</span><input type="date" defaultValue="2025-05-15" className={inputClass} /></label><label className={labelClass}>Entry Time <span className="text-red-500">*</span><input type="time" defaultValue="10:15" className={inputClass} /></label><label className={labelClass}>Exit Time <span className="font-normal text-[#94A3B8]">(Optional)</span><input type="time" className={inputClass} /></label></div>
            <div className="mt-2 rounded border border-[#B9DDFB] bg-[#EDF7FF] px-3 py-2 text-xs font-semibold text-[#2583D8]">ⓘ &nbsp; Entry time is recorded automatically. You can adjust it if needed.</div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Wrench size={16} className="text-[#16A85B]" />4. Equipment Details <span className="text-xs font-semibold text-[#94A3B8]">(Optional)</span></h3>
            <div className="space-y-3">
              {equipmentRows.map((row) => (
                <div key={row.id} className="grid gap-3 md:grid-cols-[1.2fr_.7fr_1fr_1.2fr]"><label className={labelClass}>Equipment <span className="font-normal text-[#94A3B8]">(Optional)</span><select className={inputClass} value={row.inventoryAssetId} disabled={isEquipmentLoading} onChange={(event) => setEquipmentRows((rows) => rows.map((equipmentRow) => equipmentRow.id === row.id ? { ...equipmentRow, inventoryAssetId: event.target.value } : equipmentRow))}><option value="" disabled>{isEquipmentLoading ? "Loading equipment..." : "Select equipment"}</option>{(inventoryAssets ?? []).map((asset) => <option key={asset.inventoryAssetId} value={asset.inventoryAssetId}>{asset.assetName}</option>)}</select>{row.inventoryAssetId ? <span className="mt-1 block text-[11px] font-semibold text-[#64748B]">({(inventoryAssets ?? []).find((asset) => String(asset.inventoryAssetId) === row.inventoryAssetId)?.availableQty ?? 0} available)</span> : null}</label><label className={labelClass}>Quantity <span className="font-normal text-[#94A3B8]">(Optional)</span><input type="number" min="1" className={inputClass} /></label><label className={labelClass}>Condition <span className="font-normal text-[#94A3B8]">(Optional)</span><select className={inputClass} defaultValue=""><option value="" disabled>Select condition</option><option>Good</option><option>Fair</option></select></label><label className={labelClass}>Remarks <span className="font-normal text-[#94A3B8]">(Optional)</span><input className={inputClass} placeholder="Enter remarks" /></label></div>
              ))}
            </div>
            <button type="button" onClick={() => setEquipmentRows((rows) => [...rows, { id: Date.now(), inventoryAssetId: "" }])} className="mt-3 inline-flex h-8 cursor-pointer items-center gap-2 rounded border border-[#16A85B] px-3 text-xs font-bold text-[#149447]"><Plus size={13} weight="bold" />Add Another Equipment</button>
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#E8EEF5] px-5 py-3"><button type="button" onClick={onClose} className="h-8 cursor-pointer rounded border border-[#DCE5EF] px-5 text-xs font-bold text-[#334155]">Cancel</button><button type="button" onClick={onSave} className="inline-flex h-8 cursor-pointer items-center gap-2 rounded bg-[#149447] px-5 text-xs font-bold text-white"><FloppyDisk size={13} weight="bold" />Save Entry</button></footer>
      </div>
    </div>
  );
}
