"use client";

import { useRef, useState, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

export interface SelectOption {
  label: string;
  value: any;
}

export default function CustomSelect({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  id?: string;
  label: string;
  options: (SelectOption | string)[];
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        if (id) {
          const labelElement = document.querySelector(`label[for="${id}"]`);
          if (labelElement && labelElement.contains(target)) {
            return;
          }
        }
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none cursor-pointer text-left ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >

        <span className={selectedOption ? "text-[#555555]" : "text-[#8A8A8A]"}>
          {selectedOption ? selectedOption.label : label}
        </span>
        <CaretDown
          size={16}
          className={`text-[#282828] transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg custom-scrollbar">
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-gray-400">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#16284F]/15 font-semibold text-[#16284F] hover:bg-[#16284F]/20"
                      : "text-[#555555] hover:bg-[#E8E8E8]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
