import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "green" | "purple" | "blue" | "orange";
};

export function StatCard({
  icon,
  label,
  value,
  tone = "green",
}: StatCardProps) {
  const bgByTone = {
    green: "bg-[#E2FAF0] text-[#147A3D]",
    purple: "bg-[#EFE4FF] text-[#8B4DFF]",
    blue: "bg-[#E3F0FF] text-[#4A82FF]",
    orange: "bg-[#FFEBD6] text-[#FF8A2A]",
  };

  return (
    <article className="flex h-[74px] items-center gap-4 rounded-lg bg-white px-5 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${bgByTone[tone]}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-bold tracking-wide text-[#6B7280]">
          {label}
        </p>
        <p className="mt-1 text-[18px] font-bold leading-tight text-[#17213D]">
          {value}
        </p>
      </div>
    </article>
  );
}
