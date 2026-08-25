import { X, Clock } from "@phosphor-icons/react";
import { CustomSelect } from "./CustomSelect";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  subjectsList: any[];
  newSubjectName: string;
  setNewSubjectName: (val: string) => void;
  newSubjectDate: string;
  setNewSubjectDate: (val: string) => void;
  newSubjectTime: string;
  setNewSubjectTime: (val: string) => void;
  newSubjectEndTime: string;
  setNewSubjectEndTime: (val: string) => void;
}

function DatePickerComponent({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const formatForNative = (val: string) => {
    if (!val) return "";
    const parts = val.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    return val;
  };

  const formatFromNative = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return val;
  };

  return (
    <div className="relative w-full">
      <input
        type="date"
        value={formatForNative(value)}
        onChange={(e) => onChange(formatFromNative(e.target.value))}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A] [color-scheme:light]"
      />
    </div>
  );
}

const NativeLikeTimePicker = ({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: string;
  minute: string;
  onHourChange: (v: string) => void;
  onMinuteChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [selectedParts, setSelectedParts] = useState({ h: false, m: false });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedHourEl = hourScrollRef.current.querySelector('.selected-item') as HTMLElement;
          if (selectedHourEl) selectedHourEl.scrollIntoView({ block: 'center' });
        }
        if (minuteScrollRef.current) {
          const selectedMinuteEl = minuteScrollRef.current.querySelector('.selected-item') as HTMLElement;
          if (selectedMinuteEl) selectedMinuteEl.scrollIntoView({ block: 'center' });
        }
      }, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        if (!(e.target as Element).closest(".native-like-time-popover")) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuHeight = 220;
  const renderAbove = rect ? window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight : false;

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  const popover = (
    <AnimatePresence>
      {isOpen && rect && (
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
            width: "150px",
            zIndex: 999999,
          }}
          className="native-like-time-popover bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-gray-200 flex h-[220px] overflow-hidden p-1"
        >
          <div ref={hourScrollRef} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-1">
            {hours.map(h => (
              <div key={h} className="pb-0.5">
                <div 
                  onClick={() => {
                    onHourChange(h);
                    setSelectedParts(prev => {
                      const next = { ...prev, h: true };
                      if (next.h && next.m) setIsOpen(false);
                      return next;
                    });
                  }} 
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] text-center transition-colors ${hour === h ? "bg-[#1A73E8] text-white selected-item font-semibold shadow-sm" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="w-[1px] bg-gray-100 mx-1 my-2"></div>
          <div ref={minuteScrollRef} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-1">
            {minutes.map(m => (
              <div key={m} className="pb-0.5">
                <div 
                  onClick={() => {
                    onMinuteChange(m);
                    setSelectedParts(prev => {
                      const next = { ...prev, m: true };
                      if (next.h && next.m) setIsOpen(false);
                      return next;
                    });
                  }} 
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] text-center transition-colors ${minute === m ? "bg-[#1A73E8] text-white selected-item font-semibold shadow-sm" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  {m}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex-1 relative min-w-[90px]">
      <div ref={triggerRef} onClick={() => { setIsOpen(!isOpen); if (!isOpen) setSelectedParts({ h: false, m: false }); }} className={`flex items-center justify-between gap-1 md:gap-2 border ${isOpen ? "border-[#43C17A]" : "border-gray-200"} rounded-md p-2 bg-white cursor-pointer transition-colors hover:border-gray-300 w-full`}>
        <span className="text-[13px] text-[#282828] font-semibold tracking-wide">
          {hour}:{minute}
        </span>
        <Clock size={16} className="text-gray-500 shrink-0" weight="bold" />
      </div>
      {typeof document !== "undefined" ? createPortal(popover, document.body) : popover}
    </div>
  );
};

function TimePickerWrapper({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [hour, setHour] = useState("11");
  const [minute, setMinute] = useState("45");
  const [ampm, setAmpm] = useState("AM");

  useEffect(() => {
    if (!value) return;
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      setHour(match[1].padStart(2, '0'));
      setMinute(match[2]);
      if (match[3]) setAmpm(match[3].toUpperCase());
    }
  }, [value]);

  const handleTimeChange = (h: string, m: string, a: string) => {
    onChange(`${parseInt(h, 10)}:${m} ${a}`);
  };

  const ampmOptions = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  return (
    <div className="flex items-center gap-2">
      <NativeLikeTimePicker
        hour={hour}
        minute={minute}
        onHourChange={(h) => {
          setHour(h);
          handleTimeChange(h, minute, ampm);
        }}
        onMinuteChange={(m) => {
          setMinute(m);
          handleTimeChange(hour, m, ampm);
        }}
      />
      <div className="w-[75px] shrink-0">
        <CustomDropdown
          options={ampmOptions}
          value={ampm}
          onChange={(val) => {
            const newA = String(val);
            setAmpm(newA);
            handleTimeChange(hour, minute, newA);
          }}
          hideCheckmark
        />
      </div>
    </div>
  );
}

export function AddSubjectModal({
  isOpen,
  onClose,
  onSubmit,
  subjectsList,
  newSubjectName,
  setNewSubjectName,
  newSubjectDate,
  setNewSubjectDate,
  newSubjectTime,
  setNewSubjectTime,
  newSubjectEndTime,
  setNewSubjectEndTime,
}: AddSubjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-800">Add Subject Exam</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-gray-700 mb-1.5">Subject Name</label>
              {subjectsList.length > 0 ? (
                <CustomSelect
                  value={newSubjectName}
                  onChange={(val) => setNewSubjectName(val.toString())}
                  options={subjectsList.map((sub) => ({
                    value: sub.subjectName,
                    label: sub.subjectName,
                  }))}
                  placeholder="Select Subject"
                />
              ) : (
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                />
              )}
            </div>

            <div className="flex flex-col col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-gray-700 mb-1.5">Exam Date</label>
              <DatePickerComponent value={newSubjectDate} onChange={setNewSubjectDate} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
              <TimePickerWrapper value={newSubjectTime} onChange={setNewSubjectTime} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-1.5">End Time</label>
              <TimePickerWrapper value={newSubjectEndTime} onChange={setNewSubjectEndTime} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#43C17A] hover:bg-[#38b16d] text-white py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
