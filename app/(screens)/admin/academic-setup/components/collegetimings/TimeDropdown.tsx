import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "@phosphor-icons/react";

export const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3];
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

export const generateTimeOptions = (interval: number) => {
  const times = [];
  for (let h = 8; h <= 22; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === 22 && m > 0) break; // Stop at exactly 10:00 PM
      const isPM = h >= 12;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const minStr = m.toString().padStart(2, "0");
      const ampm = isPM ? "PM" : "AM";
      const timeStr = `${hour12.toString().padStart(2, "0")}:${minStr} ${ampm}`;
      times.push(timeStr);
    }
  }
  return times;
};

export const TIME_OPTIONS_15 = generateTimeOptions(15);
export const TIME_OPTIONS_5 = generateTimeOptions(5);

export default function TimeDropdown({ 
  value, 
  onChange, 
  label, 
  allowClear, 
  placeholder,
  options,
  minMins,
  maxMins
}: { 
  value: string; 
  onChange: (val: string) => void; 
  label: string; 
  allowClear?: boolean; 
  placeholder?: string;
  options: string[];
  minMins?: number;
  maxMins?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({ block: "center" });
      }, 50);
    }
  }, [isOpen]);

  const parsedMin = minMins !== undefined ? minMins : -1;
  const parsedMax = maxMins !== undefined ? maxMins : 1500;

  const filteredOptions = options.filter(time => {
    const t = parseTime(time);
    return t > parsedMin && t < parsedMax;
  });

  return (
    <div className="flex flex-col gap-1 lg:block relative w-full min-w-[90px]" ref={containerRef}>
      <span className="text-xs text-gray-500 font-medium mb-1 lg:hidden truncate">{label}</span>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${isOpen ? "border-[#43C17A] ring-1 ring-[#43C17A]" : "border-gray-200"} rounded-lg px-2 xl:px-3 py-2 flex items-center justify-between text-[13px] xl:text-sm text-[#2D3748] outline-none transition-all hover:border-gray-300 shadow-sm cursor-pointer whitespace-nowrap`}
      >
        <span className={`truncate mr-1 ${!value ? "text-gray-400" : ""}`}>{value || placeholder || "Select Time"}</span>
        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          {allowClear && value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 hover:bg-gray-100 rounded-full transition-colors hover:text-red-500 cursor-pointer"
            >
              <X size={14} weight="bold" />
            </button>
          )}
          <Clock size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full min-w-[120px] left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500 text-center italic">No valid times</div>
            ) : (
              filteredOptions.map((time) => {
                const isSelected = value === time;
                return (
                  <div
                    key={time}
                    ref={isSelected ? selectedItemRef : null}
                    onClick={() => {
                      onChange(time);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-[#E6F4EA] text-[#43C17A] font-medium" : "text-gray-700"
                    }`}
                  >
                    {time}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
