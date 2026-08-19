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
  className?: string;
  theme?: "green" | "always-green" | "default";
  hideCheckmark?: boolean;
  isMultiSelect?: boolean;
  selectedValues?: (string | number)[];
  isOpenProp?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
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
  className = "",
  theme = "default",
  hideCheckmark = false,
  isMultiSelect = false,
  selectedValues = [],
  isOpenProp,
  onOpenChange,
}: CustomDropdownProps) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  
  const setIsOpen = (newVal: boolean) => {
    setIsOpenInternal(newVal);
    onOpenChange?.(newVal);
  };
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

      const handleScroll = (e: Event) => {
        const target = e.target as Node;
        if (target instanceof Element && target.closest('.custom-dropdown-menu')) {
          return;
        }
        setIsOpen(false);
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  let finalOptions = [...options];
  if (includeAll && !finalOptions.some(opt => String(opt.value) === "All" || String(opt.label) === "All")) {
    finalOptions = [{ value: "All", label: "All" }, ...finalOptions];
  }

  const selectedOption = finalOptions.find(opt => String(opt.value) === String(selectedValue));
  const selectedLabel = isMultiSelect
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : ""
    : selectedOption ? selectedOption.label : "";

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
            const isSelected = isMultiSelect 
              ? selectedValues.some(val => String(val) === String(opt.value))
              : String(opt.value) === String(selectedValue);
            
            return (
              <div
                key={`${opt.value}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  if (!isMultiSelect) {
                    setIsOpen(false);
                  }
                }}
                className={`px-3 py-2.5 text-[13px] cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                  isSelected
                    ? (theme === "green" || theme === "always-green") ? "bg-[#43C17A15] text-[#43C17A] font-bold" : "bg-blue-50 text-blue-600 font-bold"
                    : "text-[#282828] hover:bg-gray-50 font-medium"
                }`}
              >
                <span className="flex items-center gap-2 pr-2">
                  {isMultiSelect && (
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-[#43C17A] border-[#43C17A] text-white" : "border-gray-300 bg-white"}`}>
                      {isSelected && <Check size={11} weight="bold" />}
                    </span>
                  )}
                  {opt.label}
                </span>
                {isSelected && !hideCheckmark && !isMultiSelect && <Check size={14} weight="bold" className="shrink-0" />}
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
          className={`relative rounded-md pl-3 pr-9 py-2 flex items-center justify-between transition-colors duration-300 ease-in-out select-none outline-none border w-full ${className} ${
            disabled
              ? theme === "always-green" ? "bg-[#43C17A15] cursor-not-allowed border-[#43C17A]/30" : "bg-[#F3F4F6] cursor-not-allowed border-gray-200"
              : theme === "always-green" 
                ? "bg-[#43C17A15] border-[#43C17A]/40 hover:bg-[#43C17A20] cursor-pointer"
                : isOpen 
                  ? theme === "green" ? "bg-[#43C17A15] border-[#43C17A]/40 cursor-pointer" : "bg-blue-50 border-blue-200 cursor-pointer" 
                  : "bg-white border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
        >
          <span className={`text-[13px] font-medium truncate ${disabled ? (theme === "always-green" ? "text-[#43C17A] opacity-70" : "text-gray-500") : theme === "always-green" ? "text-[#43C17A] font-semibold" : isOpen ? (theme === "green" ? "text-[#43C17A] font-semibold" : "text-blue-600 font-semibold") : "text-gray-700"}`}>
            {selectedLabel || placeholder}
          </span>
          <CaretDown
            size={14}
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-in-out ${
              isOpen ? (theme === "green" || theme === "always-green" ? "rotate-180 text-[#43C17A]" : "rotate-180 text-blue-500") : disabled ? (theme === "always-green" ? "text-[#43C17A] opacity-70" : "text-gray-400") : theme === "always-green" ? "text-[#43C17A]" : "text-gray-500"
            }`}
            weight="bold"
          />
        </button>

        {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
      </div>
    </div>
  );
};
