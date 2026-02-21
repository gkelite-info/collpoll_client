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
  entityName?: string;
  label?: string;
  placeholder: string;
  options: string[] | Record<string, string[]>;
  selectedValues: string[];
  onChange: (val: string) => void;
  onRemove: (val: string) => void;
  disabled?: boolean;
  isGrouped?: boolean;
  paddingY?: string;
  closedBorder?: string;
  placeholderColorActive?: string;
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
  paddingY = "py-2",
  closedBorder = "border-gray-200",
  placeholderColorActive = "text-gray-400",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full" ref={wrapperRef}>
      {/* Label — matches native select exactly */}
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative">
        {/* Select trigger */}
        <div
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`
            w-full
            border
            ${isOpen ? "border-[#48C78E] ring-1 ring-[#48C78E]" : closedBorder}
            rounded-md
            px-3
            ${paddingY}
            text-sm
            flex
            justify-between
            items-center
            bg-white
            transition-all
            ${
              disabled
                ? "bg-gray-50 cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }
          `}
        >
          <span
            className={`truncate mr-2 ${
              selectedValues.length ? "text-gray-700" : placeholderColorActive
            }`}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} ${label ?? ""}${
                  selectedValues.length > 1 ? "s" : ""
                } selected`
              : placeholder}
          </span>

          <CaretDown
            size={14}
            className={`text-gray-400 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div
            className="
            absolute
            z-50
            top-full
            left-0
            right-0
            mt-1
            bg-white
            border
            border-gray-100
            rounded-md
            shadow-xl
            max-h-48
            overflow-y-auto
            custom-scrollbar
          "
          >
            {!isGrouped
              ? (options as string[]).map((opt, idx) => (
                  <div
                    key={`${label}-${opt}-${idx}`}
                    onClick={() => onChange(opt)}
                    className="
                      flex
                      items-center
                      justify-between
                      px-3
                      py-2
                      hover:bg-gray-50
                      cursor-pointer
                      text-sm
                      text-gray-700
                    "
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
                    <div key={`${label}-${category}`}>
                      <div
                        className="
                      sticky
                      top-0
                      z-10
                      px-3
                      py-1.5
                      bg-gray-50
                      text-[10px]
                      font-bold
                      text-gray-500
                      uppercase
                      tracking-wider
                      border-b
                      border-gray-100
                    "
                      >
                        {category}
                      </div>

                      {items.map((opt) => (
                        <div
                          key={`${label}-${category}-${opt}`}
                          onClick={() => onChange(opt)}
                          className="
                          flex
                          items-center
                          justify-between
                          px-3
                          py-2
                          hover:bg-gray-50
                          cursor-pointer
                          text-sm
                          text-gray-700
                          pl-5
                        "
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
                  ),
                )}
          </div>
        )}
      </div>

      {/* Selected pills */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((val) => (
            <PillTag
              key={`${label}-selected-${val}`}
              label={val}
              onRemove={() => onRemove(val)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
