"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface FilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  displayModifier?: (opt: string) => string;
  placeholder?: string;
  widthClassName?: string;
}

export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  displayModifier,
  placeholder = "Select...",
  widthClassName = "min-w-[120px]",
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use "All" if value is missing and options has "All", or first option. Wait, native select handled "All".
  const selectedValue = value || "";
  const selectedLabel = displayModifier ? displayModifier(selectedValue) : selectedValue;

  const updateRect = () => {
    if (dropdownRef.current) {
      setRect(dropdownRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('.filter-dropdown-menu')) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      }
    }
  }, [isOpen]);

  // Make sure "All" is explicitly available if it's not in the options array but the native select had it.
  // Wait, the native select had <option value="All">All</option> hardcoded!
  // So we should always prepend "All" to the realOptions array if not present.
  const realOptions = options.filter((opt) => opt !== "All");
  const finalOptions = ["All", ...realOptions];

  const menu = (
    <AnimatePresence>
      {isOpen && !disabled && rect && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: rect.bottom + 6,
            left: rect.left,
            width: Math.max(140, rect.width),
            zIndex: 9999
          }}
          className="filter-dropdown-menu bg-white rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden py-1 max-h-60 overflow-y-auto"
        >
          {finalOptions.map((opt, index) => {
            const isSelected = String(opt) === String(selectedValue);
            const labelText = opt === "All" ? "All" : (displayModifier ? displayModifier(opt) : opt);
            
            return (
              <div
                key={`${opt}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 text-[13px] cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#43C17A15] text-[#43C17A] font-bold"
                    : "text-[#282828] hover:bg-gray-50 font-medium"
                }`}
              >
                <span className="truncate pr-2">{labelText}</span>
                {isSelected && <Check size={14} weight="bold" className="shrink-0" />}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col gap-1 min-w-[120px] overflow-visible">
      <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
        {label}
      </label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) updateRect();
            setIsOpen(!isOpen);
          }}
          className={`relative rounded-md pl-2 pr-9 py-1.5 flex items-center justify-between transition-colors duration-300 ease-in-out cursor-pointer select-none outline-none border w-full ${
            disabled
              ? "bg-gray-100 opacity-50 cursor-not-allowed border-gray-300"
              : isOpen 
                ? "bg-[#43C17A15] border-[#43C17A]/40" 
                : "bg-white border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className={`text-[13px] font-medium truncate ${disabled ? "text-gray-400" : isOpen ? "text-[#43C17A] font-semibold" : "text-gray-700"}`}>
            {selectedLabel || placeholder}
          </span>
          <CaretDown
            size={12}
            className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180 text-[#43C17A]" : "text-gray-500"
            }`}
            weight="bold"
          />
        </button>

        {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
      </div>
    </div>
  );
};
