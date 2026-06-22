import { Cube } from "@phosphor-icons/react";

type StatCardProps = {
  label: string;
  value: number;
  tone: "green" | "blue" | "orange" | "red";
};

export function StatCard({ label, value, tone }: StatCardProps) {
  const toneClasses = {
    green: "bg-[#DFF8EA] text-[#009B55]",
    blue: "bg-[#E4F0FF] text-[#3B82F6]",
    orange: "bg-[#FFF0D9] text-[#F97316]",
    red: "bg-[#FFE4E4] text-[#FF2A2A]",
  };

  return (
    <div className="rounded-lg border border-[#E8EEF5] bg-white p-5">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Cube size={24} weight="bold" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-[#94A3B8]">{label}</p>
          <p className="text-[28px] font-extrabold leading-tight text-[#16284F]">{value}</p>
        </div>
      </div>
    </div>
  );
}
