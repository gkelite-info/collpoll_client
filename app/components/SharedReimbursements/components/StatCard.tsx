import type { ElementType } from "react";

type StatCardProps = {
  label: string;
  value: string;
  color: string;
  valueClass: string;
  icon: ElementType;
  iconClass: string;
};

export default function StatCard({
  label,
  value,
  color,
  valueClass,
  icon: Icon,
  iconClass,
}: StatCardProps) {
  return (
    <div
      className={`min-h-[108px] w-[235px] shrink-0 rounded-[8px] border border-[#E6EAF0] border-t-4 ${color} bg-white px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.08)]`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="min-w-0 whitespace-nowrap text-[13px] font-bold tracking-wide text-[#4C5565]">
          {label}
        </p>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[6px] ${iconClass}`}>
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <p className={`text-[30px] font-bold leading-tight ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
