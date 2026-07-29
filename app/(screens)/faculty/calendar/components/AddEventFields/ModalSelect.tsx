"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface Option {
  value: string | number;
  label: string;
}

interface ModalSelectProps {
  value: string | number | undefined | null;
  options: Option[];
  onChange: (val: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  INPUT_HEIGHT?: string;
  isSmall?: boolean;
}

export const ModalSelect = ({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select...",
  INPUT_HEIGHT = "h-11", // Changed to absolute height standard
  isSmall = false,
}: ModalSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const selectedLabel = selectedOption ? selectedOption.label : "";

  const updateRect = () => {
    if (dropdownRef.current) {
      setRect(dropdownRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('.modal-dropdown-menu')) {
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
        const target = e.target as HTMLElement;
        if (target && target.closest && target.closest('.modal-dropdown-menu')) {
          return;
        }
        setIsOpen(false);
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateRect);
      
      // Auto-scroll to selected item
      if (menuRef.current) {
        // Use setTimeout to ensure the DOM is painted since we're using Framer Motion
        setTimeout(() => {
          if (menuRef.current) {
            const selectedEl = menuRef.current.querySelector('[data-selected="true"]');
            if (selectedEl) {
              selectedEl.scrollIntoView({ block: 'start' });
            }
          }
        }, 50);
      }

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateRect);
      }
    }
  }, [isOpen]);

  const spaceBelow = typeof window !== 'undefined' && rect ? window.innerHeight - rect.bottom : 500;
  const spaceAbove = rect ? rect.top : 0;
  const dropdownHeight = 240; // Approx max-h-60
  const placeAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

  const menu = (
    <AnimatePresence>
      {isOpen && !disabled && rect && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: placeAbove ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: placeAbove ? 10 : -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: placeAbove ? undefined : rect.bottom + 6,
            bottom: placeAbove ? (typeof window !== 'undefined' ? window.innerHeight - rect.top + 6 : 0) : undefined,
            left: rect.left,
            width: rect.width, // Match the exact width of the input
            zIndex: 99999
          }}
          className="modal-dropdown-menu bg-white rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden py-1 max-h-60 overflow-y-auto"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-[13px] text-gray-500 text-center">
              No options available
            </div>
          ) : (
            options.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              
              return (
                <div
                  key={`${opt.value}-${index}`}
                  data-selected={isSelected ? "true" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                    isSelected
                      ? "bg-[#43C17A15] text-[#43C17A] font-bold"
                      : "text-[#282828] hover:bg-gray-50 font-normal"
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {isSelected && !isSmall && <Check size={14} weight="bold" className="shrink-0" />}
                </div>
              );
            })
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) updateRect();
          setIsOpen(!isOpen);
        }}
        className={`w-full ${INPUT_HEIGHT} rounded-lg ${isSmall ? 'pl-2 pr-6' : 'pl-3 pr-10'} flex items-center justify-between transition-colors duration-300 ease-in-out cursor-pointer select-none outline-none border ${
          disabled
            ? "bg-gray-50 border-[#C9C9C9] cursor-not-allowed opacity-80"
            : isOpen 
              ? "bg-[#43C17A15] border-[#43C17A]/40 ring-2 ring-[#43C17A]" 
              : hasValue
                ? "bg-emerald-50 border-emerald-500 hover:border-emerald-600 focus:ring-2 focus:ring-emerald-500" 
                : "bg-white border-[#C9C9C9] hover:border-gray-400 focus:ring-2 focus:ring-[#43C17A]"
        }`}
      >
        <span className={`truncate ${isSmall ? 'text-xs' : 'text-sm'} ${disabled ? "text-gray-400 font-normal" : isOpen ? "text-[#43C17A] font-semibold" : hasValue ? "text-emerald-700 font-semibold" : "text-gray-400 font-normal"}`}>
          {selectedLabel || placeholder}
        </span>
        <CaretDown
          size={isSmall ? 14 : 16}
          className={`absolute ${isSmall ? 'right-1.5' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180 text-[#43C17A]" : "text-gray-400"
          }`}
          weight="bold"
        />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
    </div>
  );
};
