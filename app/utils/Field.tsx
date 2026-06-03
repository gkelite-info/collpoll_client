import React from "react";

export default function Field({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <span className="mb-1.5 sm:mb-2 block w-fit text-xs sm:text-sm font-semibold text-[#282828]">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="cursor-pointer select-none">
            {label}
          </label>
        ) : (
          <span className="select-none">{label}</span>
        )}
      </span>
      {children}
    </div>
  );
}
