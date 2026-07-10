import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  placeholder?: string;
  as?: "select";
  children?: ReactNode;
};

export default function Field({ label, placeholder, as, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold tracking-wide text-[#4A5565]">
        {label}
      </span>
      {as === "select" ? (
        <select className="h-11 w-full rounded-[7px] border border-[#BFD0C2] bg-white px-3 text-[14px] text-[#14213A] outline-none focus:border-[#43C17A]">
          {children}
        </select>
      ) : (
        <input
          className="h-11 w-full rounded-[7px] border border-[#BFD0C2] px-3 text-[14px] text-[#14213A] placeholder-[#9CA3AF] outline-none focus:border-[#43C17A]"
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
