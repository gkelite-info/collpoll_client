import React, { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface CustomSelectProps {
  value: string | number;
  onChange: (val: string | number) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value.toString() === value?.toString());

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-300"
            : isOpen || value
            ? "bg-[#E8F5E9] border-[#43C17A] text-[#22C55E] cursor-pointer"
            : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 cursor-pointer"
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#22C55E]" : "text-gray-500"}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  value?.toString() === opt.value.toString() ? "bg-[#E8F5E9] text-[#22C55E] font-medium" : "text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
