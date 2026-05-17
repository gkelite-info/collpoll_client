"use client";

import { CaretRight } from "@phosphor-icons/react";
import { feeCollectionGroups } from "./data";

export default function FeeCollectionPanel() {
  return (
    <div className="flex h-[360px] flex-col rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-md font-semibold text-[#282828]">Fee Collection</h2>
      <div className="custom-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {feeCollectionGroups.map((group) => (
          <div key={group.title} className="rounded-md bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-md font-semibold text-[#282828]">
                {group.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[#282828]">
                <span className="text-md font-semibold text-[#16284F]">
                  {group.students}
                </span>
                <span>Students</span>
                <CaretRight size={18} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-[#E6FBEA] p-3">
                <p className="text-sm font-medium text-[#43C17A]">
                  Collected
                </p>
                <p className="text-md font-semibold text-[#43C17A]">
                  {group.collected}
                </p>
              </div>
              <div className="rounded-md bg-[#FFE5E7] p-3">
                <p className="text-sm font-medium text-[#FF2A2A]">
                  Pending
                </p>
                <p className="text-md font-semibold text-[#FF2A2A]">
                  {group.pending}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
