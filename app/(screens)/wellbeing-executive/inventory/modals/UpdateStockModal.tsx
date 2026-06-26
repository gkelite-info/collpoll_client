"use client";

import { X } from "@phosphor-icons/react";
import { EquipmentThumb } from "../components";
import type { EquipmentItem, StockUpdateState } from "../types";

type UpdateStockModalProps = {
  item: EquipmentItem;
  stockUpdate: StockUpdateState;
  onChange: (nextUpdate: StockUpdateState) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

export function UpdateStockModal({ item, stockUpdate, onChange, onClose, onSave, isLoading = false }: UpdateStockModalProps) {
  const isReducing = stockUpdate.actionType === "remove";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-end bg-black/55 p-2">
      <div className="relative max-h-[calc(100vh-1rem)] w-full max-w-[430px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 cursor-pointer text-[#94A3B8] hover:text-[#FF2A2A]" title="Close">
          <X size={16} weight="bold" />
        </button>

        <h2 className="text-[20px] font-extrabold text-[#16284F]">Update Stock</h2>
        <p className="mt-2 text-[12px] font-medium text-[#64748B]">Update the stock for</p>

        <div className="mt-4 flex items-center gap-3">
          <EquipmentThumb image={item.image} name={item.name} />
          <div>
            <p className="text-[13px] font-extrabold text-[#16284F]">{item.name}</p>
            <span className="mt-1 inline-flex rounded bg-[#DFF8EA] px-2 py-0.5 text-[9px] font-extrabold text-[#009B55]">{item.category}</span>
          </div>
        </div>
 
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-[12px] font-extrabold text-[#16284F]">1. Action Type <span className="text-[#FF2A2A]">*</span></p>
            <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">Select the type of stock update</p>
            <div className="mt-3 overflow-hidden rounded-md border border-[#E2E8F0]">
              {[
                { value: "add" as const, label: "Add Stock", helper: "Add new stock to inventory" },
                { value: "remove" as const, label: "Reduce Stock", helper: "Remove stock from inventory manually" },
              ].map((option) => {
                const selected = stockUpdate.actionType === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => onChange({ ...stockUpdate, actionType: option.value })} className={`flex w-full cursor-pointer items-center justify-between border-l-4 px-4 py-3 text-left ${selected ? option.value === "add" ? "border-[#2563EB] bg-[#EAF3FF]" : "border-[#EF4444] bg-[#FFF1F2]" : "border-transparent bg-white hover:bg-[#F8FAFC]"}`}>
                    <span className="flex items-center gap-3">
                      <span className={`flenx h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[25px] leading-none ${option.value === "add" ? "bg-[#DBEAFE]" : "bg-[#FEE2E2]"}`} aria-hidden="true">
                        {option.value === "add" ? "📥" : "📤"}
                      </span>
                      <span>
                        <span className="block text-[12px] font-extrabold text-[#16284F]">{option.label}</span>
                        <span className="mt-0.5 block text-[10px] font-medium text-[#94A3B8]">{option.helper}</span>
                      </span>
                    </span>
                    {selected ? (
                      <span className={`text-[12px] font-bold ${option.value === "add" ? "text-[#2563EB]" : "text-[#EF4444]"}`}>✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-extrabold text-[#16284F]">2. Stock Details</p>
            <label className="mt-3 block">
              <span className="text-[10px] font-extrabold uppercase text-[#475569]">Quantity <span className="text-[#FF2A2A]">*</span></span>
              <input type="number" onWheel={(e) => e.currentTarget.blur()} min="1" max={isReducing ? item.available : undefined} value={stockUpdate.quantity} onChange={(event) => onChange({ ...stockUpdate, quantity: event.target.value })} className="mt-1 h-9 w-full rounded-sm border border-[#E2E8F0] px-3 text-[12px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]" />
              <span className="mt-1 block text-[10px] font-medium text-[#94A3B8]">
                {isReducing
                  ? `Enter a positive number to reduce stock (maximum ${item.available})`
                  : "Enter a positive number to add stock"}
              </span>
            </label>
            <label className="mt-3 block">
              <span className="text-[10px] font-extrabold uppercase text-[#475569]">Date <span className="text-[#FF2A2A]">*</span></span>
              <input type="date" value={stockUpdate.date} onChange={(event) => onChange({ ...stockUpdate, date: event.target.value })} className="mt-1 h-9 w-full rounded-sm border border-[#E2E8F0] px-3 text-[12px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]" />
            </label>
          </div>

          <label className="block">
            <span className="text-[12px] font-extrabold text-[#16284F]">3. Remarks <span className="text-[#94A3B8]">(Optional)</span></span>
            <span className="mt-1 block text-[11px] font-medium text-[#94A3B8]">Add any additional notes</span>
            <textarea value={stockUpdate.remarks} onChange={(event) => onChange({ ...stockUpdate, remarks: event.target.value })} maxLength={250} rows={4} className="mt-2 w-full resize-none rounded-sm border border-[#E2E8F0] p-3 text-[12px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]" />
            <span className="mt-1 block text-[10px] font-medium text-[#94A3B8]">Maximum 250 characters</span>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="h-10 cursor-pointer rounded-sm border border-[#E2E8F0] text-[12px] font-bold text-[#16284F] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
          <button type="button" onClick={onSave} disabled={isLoading} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-[#16284F] text-[12px] font-bold text-white hover:bg-[#0F1E3A] disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
