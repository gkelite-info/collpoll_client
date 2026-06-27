import type { Icon } from "@phosphor-icons/react";

type SummaryCardProps = {
  label: string;
  value: string | number;
  tone: string;
  icon: Icon;
  isLoading?: boolean;
};

export function SummaryCard({ label, value, tone, icon: Icon, isLoading = false }: SummaryCardProps) {
  return (
    <div className="flex min-h-32 items-center gap-5 rounded-xl border border-[#E2E8F0] bg-white px-6 shadow-sm">
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        {isLoading ? <span className="h-8 w-8 animate-pulse rounded-md bg-white/60" /> : <Icon size={31} weight="bold" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium leading-snug text-[#94A3B8]">{label}</p>
        {isLoading ? (
          <span className="mt-2 block h-8 w-16 animate-pulse rounded bg-[#E8EEF5]" />
        ) : (
          <p className="text-3xl font-extrabold leading-none text-[#16284F]">{value}</p>
        )}
      </div>
    </div>
  );
}
