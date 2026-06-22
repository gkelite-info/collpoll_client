"use client";

import { CaretDown } from "@phosphor-icons/react";
import type { VehicleLogStatus } from "../types";

export function VehicleStatusDropdown({ status, onChange }: { status: VehicleLogStatus; onChange: (status: VehicleLogStatus) => void }) {
  const tone = status === "Exited" ? "bg-[#E7FAEE] text-[#10A66A]" : status === "Inside Campus" ? "bg-[#FFF2E5] text-[#F97316]" : "bg-[#FFE9E9] text-[#EF4444]";

  return (
    <div className={`relative mx-auto inline-flex rounded-full ${tone}`}>
      <select value={status} onChange={(event) => onChange(event.target.value as VehicleLogStatus)} aria-label="Vehicle status" className="h-8 cursor-pointer appearance-none rounded-full bg-transparent py-1 pl-4 pr-9 text-xs font-extrabold outline-none">
        <option value="Exited">Exited</option>
        <option value="Inside Campus">Inside Campus</option>
        <option value="Pending Exit">Pending Exit</option>
      </select>
      <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
    </div>
  );
}
