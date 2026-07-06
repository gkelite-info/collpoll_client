import type { Icon } from "@phosphor-icons/react";

export type BonafideSummaryCardItem = {
  label: string;
  value: string;
  helper: string;
  icon: Icon;
  tone: "blue" | "green" | "orange" | "amber";
};

const toneClasses: Record<BonafideSummaryCardItem["tone"], string> = {
  blue: "bg-[#EEF4FF] text-[#2D6BFF]",
  green: "bg-[#EAF8EF] text-[#219653]",
  orange: "bg-[#FFF1E8] text-[#F97316]",
  amber: "bg-[#FFF7E6] text-[#D97706]",
};

export function BonafideSummaryCard({
  item,
  isLoading,
}: {
  item: BonafideSummaryCardItem;
  isLoading?: boolean;
}) {
  const Icon = item.icon;

  if (isLoading) {
    return (
      <article className="h-[92px] w-full rounded-lg border border-[#E7ECF3] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:w-[236px]">
        <div className="flex h-full items-center gap-3 animate-pulse">
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#E2E8F0]"></div>
          <div className="flex w-full flex-col gap-2">
            <div className="h-3 w-16 rounded bg-[#E2E8F0]"></div>
            <div className="h-5 w-12 rounded bg-[#E2E8F0]"></div>
            <div className="h-2 w-24 rounded bg-[#E2E8F0]"></div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="h-[92px] w-full rounded-lg border border-[#E7ECF3] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:w-[236px]">
      <div className="flex h-full items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[item.tone]}`}
        >
          <Icon size={21} weight="bold" />
        </span>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium leading-tight text-[#303642]">
            {item.label}
          </p>
          <p className="mt-1 text-[22px] font-bold leading-none text-[#17213D]">
            {item.value}
          </p>
          <p className="mt-1 text-[10px] font-medium leading-tight text-[#8A96A8]">
            {item.helper}
          </p>
        </div>
      </div>
    </article>
  );
}
