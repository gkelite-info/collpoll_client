"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

type Option = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];

  const updateRect = () => {
    if (dropdownRef.current) {
      setRect(dropdownRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Need to check if clicking inside the portal too!
      // But a simpler way is to just let the click on the option close it.
      // Wait, clicking outside the portal menu and the button should close it.
      // We can check if the click target is NOT within the button.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if they clicked inside the portal. The portal has class 'filter-dropdown-menu'
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
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            return (
              <div
                key={`${option.value}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 text-[13px] cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-[#43C17A15] text-[#43C17A] font-bold"
                    : "text-[#282828] hover:bg-gray-50 font-medium"
                }`}
              >
                <span className="truncate pr-2">{option.label}</span>
                {isSelected && <Check size={14} weight="bold" className="shrink-0" />}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex items-center gap-2 relative">
      <label className="text-[13px] text-[#525252] font-medium whitespace-nowrap">{label}</label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) updateRect();
            setIsOpen(!isOpen);
          }}
          className={`relative rounded-full pl-4 pr-9 py-1.5 flex items-center justify-between min-w-[120px] transition-all duration-300 ease-in-out cursor-pointer select-none outline-none ${
            disabled
              ? "bg-[#43C17A1C] opacity-50 cursor-not-allowed"
              : isOpen 
                ? "bg-[#43C17A25] ring-2 ring-[#43C17A]/40" 
                : "bg-[#43C17A1C] hover:bg-[#43C17A2C]"
          }`}
        >
          <span className="text-[13px] font-semibold text-[#43C17A] truncate">
            {selectedOption?.label || "Select"}
          </span>
          <CaretDown
            size={12}
            className={`absolute right-3.5 text-[#43C17A] pointer-events-none transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : ""
            }`}
            weight="bold"
          />
        </button>

        {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
      </div>
    </div>
  );
};

export const MOCK_DEPTS = [
  {
    id: 1,
    name: "CSE",
    year: "2",
    text: "#FF4B4B",
    color: "#FF4B4B",
    bgColor: "#FFE5E5",
    activeText: "Active Subjects with discussion",
    activeCount: "08",
    students: 320,
  },
  {
    id: 2,
    name: "ECE",
    year: "2",
    text: "#FF8A00",
    color: "#FF8A00",
    bgColor: "#FFEFE5",
    activeText: "Active Subjects with discussion",
    activeCount: "06",
    students: 320,
  },
  {
    id: 3,
    name: "MECH",
    year: "2",
    text: "#FFC700",
    color: "#FFC700",
    bgColor: "#FFF9E5",
    activeText: "Active Subjects with discussion",
    activeCount: "08",
    students: 320,
  },
  {
    id: 4,
    name: "CSE",
    year: "2",
    text: "#FF4B4B",
    color: "#FF4B4B",
    bgColor: "#FFE5E5",
    activeText: "Active Subjects with discussion",
    activeCount: "08",
    students: 320,
  },
  {
    id: 5,
    name: "ECE",
    year: "2",
    text: "#FF8A00",
    color: "#FF8A00",
    bgColor: "#FFEFE5",
    activeText: "Active Subjects with discussion",
    activeCount: "06",
    students: 320,
  },
  {
    id: 6,
    name: "MECH",
    year: "2",
    text: "#FFC700",
    color: "#FFC700",
    bgColor: "#FFF9E5",
    activeText: "Active Subjects with discussion",
    activeCount: "08",
    students: 320,
  },
  {
    id: 7,
    name: "AI & DS",
    year: "2",
    text: "#43C17A",
    color: "#43C17A",
    bgColor: "#E5F6ED",
    activeText: "Active Subjects with Assignments",
    activeCount: "08",
    students: 320,
  },
  {
    id: 8,
    name: "Biotech",
    year: "2",
    text: "#00D1FF",
    color: "#00D1FF",
    bgColor: "#E5FAFF",
    activeText: "Active Subjects with Assignments",
    activeCount: "06",
    students: 320,
  },
  {
    id: 9,
    name: "MBA",
    year: "2",
    text: "#6C8DFF",
    color: "#6C8DFF",
    bgColor: "#EAEFFF",
    activeText: "Active Subjects with Assignments",
    activeCount: "08",
    students: 320,
  },
];

export const MOCK_COURSES = [
  {
    id: 1,
    subject: "DATA STRUCTURES",
    facultyName: "Dr. Meena Reddy",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=5",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
  {
    id: 2,
    subject: "DISCRETE MATHEMATICS",
    facultyName: "Ananya Rao",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=9",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
  {
    id: 3,
    subject: "OOPS USING JAVA",
    facultyName: "Nikhil Verma",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=11",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
  {
    id: 4,
    subject: "COMPUTER NETWORKS",
    facultyName: "Neha Singh",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=20",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
  {
    id: 5,
    subject: "DBMS",
    facultyName: "Rahul Anand",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=33",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
  {
    id: 6,
    subject: "OPERATING SYSTEMS",
    facultyName: "Priya Menon",
    facultyId: "89273648",
    avatar: "https://i.pravatar.cc/150?img=44",
    activeQuiz: 4,
    pendingSubmissions: 4,
  },
];
