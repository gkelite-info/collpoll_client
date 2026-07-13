import type { ElementType, ReactNode } from "react";

type FormCardProps = {
  icon: ElementType;
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export default function FormCard({
  icon: Icon,
  title,
  action,
  children,
}: FormCardProps) {
  return (
    <section className="rounded-[10px] border border-[#E9EEF2] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-[8px] bg-[#E5FAEF] p-2 text-[#20C86A]">
            <Icon size={20} />
          </span>
          <h2 className="text-[18px] font-bold text-[#14213A]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
