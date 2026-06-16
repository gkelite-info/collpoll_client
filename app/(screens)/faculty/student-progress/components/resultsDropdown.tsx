"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface Option {
  label: string;
  value: string;
}

interface ResultsDropdownProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
  align?: "left" | "right";
  icon?: ReactNode;
}

export default function ResultsDropdown({
  options,
  selectedValue,
  onChange,
  className = "",
  align = "right",
  icon,
}: ResultsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full items-center justify-between gap-x-1.5 rounded-lg bg-white px-3 py-2 text-xs md:text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-gray-500">{icon}</span>}
            <span>{selectedOption ? selectedOption.label : "Select"}</span>
          </div>
          <CaretDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "left" ? "left-0" : "right-0"
          } z-50 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-xl ring-0 border-0 overflow-hidden`}
        >
          <div className="py-0">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-4 py-2.5 text-left text-xs md:text-sm transition-colors cursor-pointer ${
                  selectedValue === option.value
                    ? "bg-[#43C17A] text-white font-semibold"
                    : "text-gray-700 hover:bg-[#43C17A]/10 hover:text-[#43C17A]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
