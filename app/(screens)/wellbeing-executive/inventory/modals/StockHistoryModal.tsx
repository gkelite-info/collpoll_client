"use client";

import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import type { InventoryStockHistoryRow } from "@/lib/helpers/inventory/inventoryStockHistoryAPI";

const sportsHistory = [
  { type: "Stock Added", quantity: "+15", date: "16 May 2025 • 10:30 AM", note: "Received 15 footballs from Decathlon.", added: true },
  { type: "Lost Equipment", quantity: "-2", date: "14 May 2025 • 04:20 PM", note: "Lost during inter-college tournament.", added: false },
  { type: "Stock Added", quantity: "+10", date: "10 May 2025 • 11:15 AM", note: "Purchased new footballs.", added: true },
  { type: "Lost Equipment", quantity: "-2", date: "08 May 2025 • 02:45 PM", note: "Lost during inter-college tournament.", added: false },
];

const safetyHistory = [
  { type: "Stock Added", quantity: "+15", date: "16 May 2025 • 10:30 AM", note: "Received new walkie talkies for the security team.", added: true },
  { type: "Damaged Asset", quantity: "-2", date: "14 May 2025 • 04:20 PM", note: "Damaged during campus patrol duty.", added: false },
  { type: "Stock Added", quantity: "+10", date: "10 May 2025 • 11:15 AM", note: "Purchased new reflective safety jackets.", added: true },
  { type: "Lost Asset", quantity: "-2", date: "08 May 2025 • 02:45 PM", note: "Reported missing after event security duty.", added: false },
];

const administrationHistory = [
  { type: "Stock Added", quantity: "+8", date: "16 May 2025 • 10:30 AM", note: "Received new printers for the administration office.", added: true },
  { type: "Damaged Equipment", quantity: "-1", date: "14 May 2025 • 04:20 PM", note: "Printer reported damaged during routine office use.", added: false },
  { type: "Stock Added", quantity: "+12", date: "10 May 2025 • 11:15 AM", note: "Purchased new biometric devices and scanners.", added: true },
  { type: "Equipment Retired", quantity: "-2", date: "08 May 2025 • 02:45 PM", note: "Old desktop systems removed from active inventory.", added: false },
];

type StockHistoryModalProps = {
  onClose: () => void;
  variant?: "sports" | "safety" | "administration";
  history?: InventoryStockHistoryRow[];
};

export function StockHistoryModal({ onClose, variant = "sports", history: dynamicHistory }: StockHistoryModalProps) {
  const staticHistory =
    variant === "administration"
      ? administrationHistory
      : variant === "safety"
        ? safetyHistory
        : sportsHistory;
  const history = dynamicHistory?.map((entry) => ({
    type: entry.actionType === "stockadded"
      ? "Stock Added"
      : entry.actionType === "lostequipment"
        ? "Lost Equipment"
        : "Stock Reduced",
    quantity: `${entry.actionType === "stockadded" ? "+" : "-"}${entry.quantity}`,
    date: new Date(entry.actionDate).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    note: entry.remarks || "No remarks added.",
    added: entry.actionType === "stockadded",
  })) ?? staticHistory;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-end bg-black/55 p-2">
      <aside className="relative h-full w-full max-w-[430px] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 cursor-pointer text-[#94A3B8] hover:text-[#FF2A2A]" title="Close">
          <X size={18} weight="bold" />
        </button>
        <div className="flex items-center gap-3 text-[#16284F]">
          <ClockCounterClockwise size={21} weight="bold" className="text-[#16A85B]" />
          <h2 className="text-[18px] font-extrabold">Recent Stock History</h2>
        </div>
        <div className="mt-6">
          <h3 className="text-[14px] font-extrabold text-[#16284F]">How history works?</h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#64748B]">Every time stock is added or reduced, it will appear here for reference.</p>
        </div>
        <div className="relative mt-6 space-y-7 before:absolute before:bottom-4 before:left-[10px] before:top-3 before:w-px before:bg-[#E2E8F0]">
          {history.map((entry, index) => (
            <div key={`${entry.type}-${index}`} className="relative flex gap-4">
              <span className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[16px] font-bold leading-none text-white ${entry.added ? "bg-[#16A85B]" : "bg-[#FF6B19]"}`}>
                {entry.added ? "+" : "−"}
              </span>
              <div>
                <p className="text-[13px] font-extrabold text-[#16284F]">{entry.type}</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#64748B]">Quantity: {entry.quantity}</p>
                <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">{entry.date}</p>
                <p className="mt-1 text-[12px] italic leading-5 text-[#64748B]">{entry.note}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

