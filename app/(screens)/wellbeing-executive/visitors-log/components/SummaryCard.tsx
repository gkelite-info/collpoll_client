import type { Icon } from "@phosphor-icons/react";

type SummaryCardProps = {
  label: string;
  value: string | number;
  tone: string;
  icon: Icon;
};

export function SummaryCard({ label, value, tone, icon: Icon }: SummaryCardProps) {
  return (
    <div className="flex min-h-32 items-center gap-5 rounded-xl border border-[#E2E8F0] bg-white px-6 shadow-sm">
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={31} weight="bold" />
      </span>
      <div>
        <p className="whitespace-nowrap text-sm font-medium text-[#94A3B8]">{label}</p>
        <p className="text-3xl font-extrabold leading-none text-[#16284F]">{value}</p>
      </div>
    </div>
  );
}
