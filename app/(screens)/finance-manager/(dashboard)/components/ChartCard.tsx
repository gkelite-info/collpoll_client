"use client";

import { CaretRight } from "@phosphor-icons/react";
import FinanceEducationDropdown from "../../components/FinanceEducationDropdown";

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  minWidth?: string;
  onViewClick?: () => void;
  showDropdown?: boolean;
};

export default function ChartCard({
  title,
  children,
  minWidth = "min-w-[720px]",
  onViewClick,
  showDropdown = false,
}: ChartCardProps) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold text-[#282828]">{title}</h2>
        <div className="flex items-center gap-3">
          {showDropdown && <FinanceEducationDropdown />}
          <button
            className="cursor-pointer text-[#282828] transition hover:text-[#43C17A]"
            type="button"
            onClick={onViewClick}
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>
      </div>
      <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
        <div className={`${minWidth} h-64`}>{children}</div>
      </div>
    </section>
  );
}
