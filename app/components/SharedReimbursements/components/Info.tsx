type InfoProps = {
  label: string;
  value: string;
  strong?: boolean;
  badge?: boolean;
  blue?: boolean;
  className?: string;
};

export default function Info({
  label,
  value,
  strong,
  badge,
  blue,
  className = "",
}: InfoProps) {
  return (
    <div className={className}>
      <p className="mb-1 text-[12px] text-[#8A9BB2]">{label}</p>
      {badge ? (
        <span className="inline-flex rounded-full bg-[#FFF3E8] px-2 py-1 text-[11px] font-bold text-[#F47A16]">
          {value}
        </span>
      ) : (
        <p
          className={`text-[13px] font-bold ${
            strong ? "text-[22px]" : ""
          } ${blue ? "text-[#3B36D9]" : "text-[#14213A]"}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
