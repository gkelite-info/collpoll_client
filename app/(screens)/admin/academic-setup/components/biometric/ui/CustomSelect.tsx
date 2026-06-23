import { useState, useRef, useEffect } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";

interface CustomSelectProps {
  label?: string;
  name?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string, name?: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Select option",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="w-full space-y-1" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-[#16284F]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full cursor-pointer flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm transition-all min-h-[42px] ${
            disabled ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" : "bg-gray-50 hover:bg-gray-100/50"
          } ${
            isOpen ? "border-[#43C17A] ring-1 ring-[#43C17A] text-[#16284F]" : "border-gray-200 text-gray-700"
          }`}
        >
          <span className={`truncate ${!value && !selectedOption ? "text-gray-400" : "font-medium"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <CaretDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#43C17A]" : ""}`}
            weight="bold"
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar animate-fade-in-up origin-top">
            {!label && !required && (
              <button
                type="button"
                onClick={() => { onChange("", name); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  value === "" ? "bg-emerald-50 text-[#43C17A] font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{placeholder}</span>
              </button>
            )}
            
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value, name); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  opt.value === value
                    ? "bg-emerald-50 text-[#43C17A] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={14} weight="bold" className="text-[#43C17A]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
