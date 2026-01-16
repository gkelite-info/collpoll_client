"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, CaretDown, Check } from "@phosphor-icons/react";

export const PillTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="bg-[#D6F1E2] text-[#43C17A] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
    {label}
    <X
      size={10}
      weight="bold"
      className="cursor-pointer hover:text-red-500"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    />
  </span>
);

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: string[] | Record<string, string[]>;
  selectedValues: string[];
  onChange: (val: string) => void;
  onRemove: (val: string) => void;
  disabled?: boolean;
  isGrouped?: boolean;
}

export const CustomMultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  onRemove,
  disabled = false,
  isGrouped = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 w-full" ref={wrapperRef}>
      <label className="text-xs font-bold text-[#2D3748]">{label}</label>
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full border ${
            isOpen
              ? "border-[#48C78E] ring-1 ring-[#48C78E]"
              : "border-gray-200"
          } rounded-md px-3 py-1 text-sm flex justify-between items-center cursor-pointer bg-white transition-all ${
            disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""
          }`}
        >
          <span
            className={`truncate mr-2 ${
              selectedValues.length ? "text-gray-700" : "text-gray-400"
            }`}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} ${label}(s) selected`
              : placeholder}
          </span>
          <CaretDown size={14} className="text-gray-400 flex-shrink-0" />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
            {!isGrouped
              ? (options as string[]).map((opt) => (
                  <div
                    key={opt}
                    onClick={() => onChange(opt)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    <span>{opt}</span>
                    {selectedValues.includes(opt) && (
                      <Check
                        size={14}
                        weight="bold"
                        className="text-[#48C78E]"
                      />
                    )}
                  </div>
                ))
              : Object.entries(options as Record<string, string[]>).map(
                  ([category, items]) => (
                    <div key={category}>
                      <div className="sticky top-0 z-10 px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {category}
                      </div>
                      {items.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => onChange(opt)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 pl-5"
                        >
                          <span>{opt}</span>
                          {selectedValues.includes(opt) && (
                            <Check
                              size={14}
                              weight="bold"
                              className="text-[#48C78E]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
          </div>
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val) => (
            <PillTag key={val} label={val} onRemove={() => onRemove(val)} />
          ))}
        </div>
      )}
    </div>
  );
};
