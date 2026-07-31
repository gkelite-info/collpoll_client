"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export type DropdownOption = {
  value: string | number;
  label: string;
};

interface CustomDropdownProps {
  label?: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (val: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  widthClassName?: string;
  includeAll?: boolean;
}

export const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select...",
  widthClassName = "w-full",
  includeAll = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedValue = value ?? "";
  
  const updateRect = () => {
    if (dropdownRef.current) {
      setRect(dropdownRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('.custom-dropdown-menu')) {
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

  let finalOptions = [...options];
  if (includeAll && !finalOptions.some(opt => String(opt.value) === "All" || String(opt.label) === "All")) {
    finalOptions = [{ value: "All", label: "All" }, ...finalOptions];
  }

  const selectedOption = finalOptions.find(opt => String(opt.value) === String(selectedValue));
  const selectedLabel = selectedOption ? selectedOption.label : "";

  const menuHeightEstimate = Math.min(240, finalOptions.length * 40 + 10);
  const spaceBelow = typeof window !== 'undefined' && rect ? window.innerHeight - rect.bottom : 0;
  const spaceAbove = rect ? rect.top : 0;
  const renderAbove = rect ? spaceBelow < menuHeightEstimate && spaceAbove > spaceBelow : false;

  const menu = (
    <AnimatePresence>
      {isOpen && !disabled && rect && (
        <motion.div
          initial={{ opacity: 0, y: renderAbove ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: renderAbove ? 10 : -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: renderAbove ? undefined : rect.bottom + 6,
            bottom: renderAbove ? (typeof window !== 'undefined' ? window.innerHeight - rect.top + 6 : undefined) : undefined,
            left: rect.left,
            width: rect.width,
            zIndex: 9999999 // Highest z-index for modals
          }}
          className="custom-dropdown-menu bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar"
        >
          {finalOptions.map((opt, index) => {
            const isSelected = String(opt.value) === String(selectedValue);
            
            return (
              <div
                key={`${opt.value}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 text-[13px] cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#43C17A15] text-[#43C17A] font-bold"
                    : "text-[#282828] hover:bg-gray-50 font-medium"
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && <Check size={14} weight="bold" className="shrink-0" />}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`flex flex-col gap-1 ${widthClassName} overflow-visible`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) updateRect();
            setIsOpen(!isOpen);
          }}
          className={`relative rounded-md pl-3 pr-9 py-2 flex items-center justify-between transition-colors duration-300 ease-in-out cursor-pointer select-none outline-none border w-full ${
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
            size={14}
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-in-out ${
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
