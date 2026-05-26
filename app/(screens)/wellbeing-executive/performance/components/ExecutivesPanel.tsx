"use client";

import { executives } from "../data";
import ExecutiveAvatar from "./ExecutiveAvatar";

export default function ExecutivesPanel({
  selectedId,
  onSelect,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
      <h3 className="px-4 py-3 text-[16px] font-bold text-[#282828]">
        Executives
      </h3>
      <div className="flex flex-col">
        {executives.map((executive) => (
          <button
            key={executive.id}
            onClick={() => onSelect(executive.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left ${
              selectedId === executive.id ? "bg-[#E8F8EF]" : "bg-[#ECECEC]"
            }`}
          >
            <ExecutiveAvatar
              src={executive.image}
              alt={executive.name}
              size={42}
            />
            <span>
              <span className="block text-[13px] font-bold text-[#282828]">
                {executive.name}
              </span>
              <span className="block text-[11px] font-medium text-[#282828]">
                {executive.staffId}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
