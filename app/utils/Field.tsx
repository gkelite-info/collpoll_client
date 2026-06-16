import React from "react";

export default function Field({
  label,
  children,
  htmlFor,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  const labelContent = (
    <>
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </>
  );

  return (
    <div className="block">
      <span className="mb-1.5 sm:mb-2 block w-fit text-xs sm:text-sm font-semibold text-[#282828]">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="cursor-pointer select-none">
            {labelContent}
          </label>
        ) : (
          <span className="select-none">{labelContent}</span>
        )}
      </span>
      {children}
    </div>
  );
}
