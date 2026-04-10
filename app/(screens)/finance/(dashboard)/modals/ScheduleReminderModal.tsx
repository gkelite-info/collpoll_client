"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CaretLeft,
  CaretRight,
  Check,
  CircleNotch,
  CaretDown,
  BellRinging,
  WarningCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { scheduleFeeReminders } from "@/lib/helpers/finance/dashboard/reminders/financeReminders";

const generateNumbers = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String(start + i).padStart(2, "0"),
  );

const HOURS = generateNumbers(1, 12);
const MINUTES = generateNumbers(0, 59);
const SECONDS = generateNumbers(0, 59);
const AMPM = ["AM", "PM"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Helper to get current time + 15 minutes by default
const getFutureTimeState = (addMinutes = 15) => {
  const future = new Date();
  future.setMinutes(future.getMinutes() + addMinutes);
  let h = future.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;

  return {
    date: new Date(future.getFullYear(), future.getMonth(), 1),
    day: future.getDate(),
    hour: String(h).padStart(2, "0"),
    minute: String(future.getMinutes()).padStart(2, "0"),
    second: String(future.getSeconds()).padStart(2, "0"),
    ampm,
  };
};

interface ScrollPickerProps {
  items: string[];
  selectedValue: string;
  onChange: (val: string) => void;
  width?: string;
}

const ScrollPicker = ({
  items,
  selectedValue,
  onChange,
  width = "w-12",
}: ScrollPickerProps) => {
  const ITEM_HEIGHT = 40;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);

  useEffect(() => {
    const index = items.indexOf(selectedValue);
    if (containerRef.current && index !== -1) {
      containerRef.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, [items, selectedValue]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(index, items.length - 1));

    if (items[safeIndex] !== selectedValue && !isDragging) {
      onChange(items[safeIndex]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setStartScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const y = e.pageY - containerRef.current.offsetTop;
    const walk = (startY - y) * 1.5;
    containerRef.current.scrollTop = startScrollTop + walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging || !containerRef.current) return;
    setIsDragging(false);

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(index, items.length - 1));

    onChange(items[safeIndex]);
    containerRef.current.scrollTo({
      top: safeIndex * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className={`h-[120px] overflow-y-auto relative ${width} ${
        isDragging
          ? "cursor-grabbing snap-none"
          : "cursor-grab snap-y snap-mandatory"
      }`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div style={{ height: ITEM_HEIGHT }} className="snap-center" />
      {items.map((item) => {
        const isSelected = item === selectedValue;
        return (
          <motion.div
            key={item}
            animate={{
              scale: isSelected ? 1.1 : 0.85,
              opacity: isSelected ? 1 : 0.4,
              fontWeight: isSelected ? 700 : 500,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-[40px] flex items-center justify-center snap-center select-none text-white"
          >
            {item}
          </motion.div>
        );
      })}
      <div style={{ height: ITEM_HEIGHT }} className="snap-center" />
    </div>
  );
};

const CustomCheckbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => {
  return (
    <div
      className={`flex items-center gap-3 group select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={!disabled ? onChange : undefined}
    >
      <div
        className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center transition-all border shadow-sm
        ${
          checked
            ? "bg-white border-[#192233]"
            : "border-gray-300 bg-gray-50 group-hover:border-gray-400"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check weight="bold" className="text-[#192233] w-3.5 h-3.5" />
        </motion.div>
      </div>
      <span className="text-gray-700 text-[14px] font-semibold tracking-tight">
        {label}
      </span>
    </div>
  );
};

interface ScheduleProps {
  isOpen: boolean;
  variant?: "student" | "faculty";
  collegeId: number;
  selectedStudentIds: number[];
  onClose: () => void;
}

export const ScheduleReminderModal = ({
  isOpen,
  variant = "student",
  collegeId,
  selectedStudentIds,
  onClose,
}: ScheduleProps) => {
  // Initialize with exactly Now + 15 minutes
  const [currentDate, setCurrentDate] = useState(
    () => getFutureTimeState().date,
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    () => getFutureTimeState().day,
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [hour, setHour] = useState(() => getFutureTimeState().hour);
  const [minute, setMinute] = useState(() => getFutureTimeState().minute);
  const [second, setSecond] = useState(() => getFutureTimeState().second);
  const [ampm, setAmpm] = useState(() => getFutureTimeState().ampm);

  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // If closed, ensure we reset the +15 minute logic next time it opens
  useEffect(() => {
    if (isOpen) {
      const future = getFutureTimeState();
      setCurrentDate(future.date);
      setSelectedDay(future.day);
      setHour(future.hour);
      setMinute(future.minute);
      setSecond(future.second);
      setAmpm(future.ampm);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const isPrevMonthDisabled =
    new Date(currentYear, currentMonth - 1, 1) <
    new Date(now.getFullYear(), now.getMonth(), 1);
  const isPrevYearDisabled = currentYear - 1 < now.getFullYear();

  const selectedFullDate = new Date(
    currentYear,
    currentMonth,
    selectedDay || 1,
  );
  let h24 = parseInt(hour, 10);
  if (ampm === "PM" && h24 < 12) h24 += 12;
  if (ampm === "AM" && h24 === 12) h24 = 0;
  selectedFullDate.setHours(h24, parseInt(minute, 10), parseInt(second, 10));

  // Validation strictly checks if selectedFullDate is behind right now
  const isPastSelection = selectedFullDate < new Date();

  const handlePrevMonth = () =>
    !isPrevMonthDisabled &&
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const handlePrevYear = () =>
    !isPrevYearDisabled &&
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  const handleNextYear = () =>
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));

  const selectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(currentYear, monthIndex, 1));
    setShowMonthPicker(false);
  };

  const handleSubmit = async () => {
    if (isPastSelection) {
      toast.error("Cannot schedule a reminder in the past.");
      return;
    }

    if (!sendEmail && !sendInApp) {
      toast.error("Please select at least one notification method");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Scheduling reminder...", { id: "schedule-reminder" });

    const result = await scheduleFeeReminders({
      collegeId,
      studentIds: selectedStudentIds,
      variant,
      notifyStudents: true,
      notifyParents: true,
      viaInApp: sendInApp,
      viaEmail: sendEmail,
      // viaSms: false,
      runAt: selectedFullDate.toISOString(),
    });

    if (result.success) {
      setIsSubmitting(false);
      toast.success("Reminder scheduled successfully", {
        id: "schedule-reminder",
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);
    } else {
      setIsSubmitting(false);
      toast.error("Failed to schedule reminder.", { id: "schedule-reminder" });
    }
  };

  const formattedDate = `${MONTHS_SHORT[currentMonth]} ${selectedDay}, ${currentYear}`;
  const formattedTime = `${hour}:${minute}:${second} ${ampm}`;

  return (
    <>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-green-100"
          >
            <div className="w-9 h-9 rounded-full bg-[#E5FDF4] flex items-center justify-center text-[#10B981]">
              <BellRinging weight="fill" size={20} />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm leading-tight">
                Reminder Scheduled
              </p>
              <p className="text-gray-500 text-[13px] font-medium mt-0.5">
                For {formattedDate} at {formattedTime}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSubmitting && !showToast ? onClose : undefined}
          className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[700px] flex flex-col font-sans overflow-hidden"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Schedule Fee Reminder
            </h2>
            <button
              onClick={!isSubmitting && !showToast ? onClose : undefined}
              className="text-gray-400 hover:text-gray-800 transition-colors disabled:opacity-50 p-1 rounded cursor-pointer"
              disabled={isSubmitting || showToast}
            >
              <X size={22} weight="bold" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-[#1A2235] rounded-xl p-5 text-white shadow-lg flex flex-col min-h-[380px] overflow-hidden relative">
              <AnimatePresence mode="wait">
                {!showMonthPicker ? (
                  <motion.div
                    key="days"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={handlePrevMonth}
                        disabled={isPrevMonthDisabled}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPrevMonthDisabled
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <CaretLeft size={20} weight="bold" />
                      </button>
                      <button
                        onClick={() => setShowMonthPicker(true)}
                        className="flex items-center gap-2 font-bold text-[16px] tracking-wide hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {currentDate.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                        <CaretDown
                          size={14}
                          weight="bold"
                          className="text-gray-400"
                        />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <CaretRight size={20} weight="bold" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center mb-3">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <span
                            key={day}
                            className="text-[11px] font-bold text-gray-400 uppercase tracking-wider"
                          >
                            {day}
                          </span>
                        ),
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 text-center flex-1 content-start">
                      {Array.from({ length: startOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="py-2" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isSelected = selectedDay === day;

                        const dayDate = new Date(
                          currentYear,
                          currentMonth,
                          day,
                        );
                        dayDate.setHours(23, 59, 59, 999);
                        const isPastDay = dayDate < now;

                        return (
                          <div
                            key={day}
                            className="flex justify-center items-center h-9"
                          >
                            <button
                              disabled={isPastDay}
                              onClick={() => setSelectedDay(day)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-all duration-200 cursor-pointer
                                ${
                                  isPastDay
                                    ? "text-gray-600 cursor-not-allowed opacity-50"
                                    : isSelected
                                      ? "bg-white/20 text-white font-bold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-110"
                                      : "text-gray-300 hover:bg-white/10"
                                }`}
                            >
                              {day}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="months"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={handlePrevYear}
                        disabled={isPrevYearDisabled}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPrevYearDisabled
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <CaretLeft size={20} weight="bold" />
                      </button>
                      <span className="font-bold text-[18px] tracking-wide text-white">
                        {currentYear}
                      </span>
                      <button
                        onClick={handleNextYear}
                        className="hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <CaretRight size={20} weight="bold" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 flex-1 content-center">
                      {MONTHS_SHORT.map((month, idx) => {
                        const isMonthDisabled =
                          currentYear === now.getFullYear() &&
                          idx < now.getMonth();
                        return (
                          <button
                            key={month}
                            disabled={isMonthDisabled}
                            onClick={() => selectMonth(idx)}
                            className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                              ${
                                isMonthDisabled
                                  ? "text-gray-600 opacity-30 cursor-not-allowed"
                                  : currentMonth === idx
                                    ? "bg-white/20 text-white border border-white/30 shadow-lg"
                                    : "text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white"
                              }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col min-h-[380px] h-full justify-between gap-4">
              <div className="bg-[#1A2235] rounded-xl p-5 text-white shadow-lg relative flex flex-col items-center">
                <h3 className="text-[15px] font-bold mb-3 w-full text-left text-gray-200">
                  Set time
                </h3>

                <div className="relative w-full flex justify-center h-[120px]">
                  <div className="absolute top-[40px] left-2 right-2 h-[40px] border-y border-white/15 bg-white/[0.03] rounded-sm pointer-events-none z-0" />

                  <div className="flex items-center justify-center relative z-10 w-full max-w-[220px]">
                    <ScrollPicker
                      items={HOURS}
                      selectedValue={hour}
                      onChange={setHour}
                    />
                    <span className="text-lg font-bold text-gray-400 mx-1 mb-1 pointer-events-none">
                      :
                    </span>
                    <ScrollPicker
                      items={MINUTES}
                      selectedValue={minute}
                      onChange={setMinute}
                    />
                    <span className="text-lg font-bold text-gray-400 mx-1 mb-1 pointer-events-none">
                      :
                    </span>
                    <ScrollPicker
                      items={SECONDS}
                      selectedValue={second}
                      onChange={setSecond}
                    />
                    <div className="w-2 pointer-events-none" />
                    <ScrollPicker
                      items={AMPM}
                      selectedValue={ampm}
                      onChange={setAmpm}
                      width="w-14"
                    />
                  </div>
                </div>
              </div>

              <div className="px-1 mt-2 mb-auto">
                <h3 className="text-gray-800 font-bold text-[15px] mb-3">
                  Send Reminder Via
                </h3>
                <div className="space-y-3.5">
                  <CustomCheckbox
                    label="Email"
                    checked={sendEmail}
                    onChange={() => setSendEmail(!sendEmail)}
                  />
                  <CustomCheckbox
                    label="In-app"
                    checked={sendInApp}
                    onChange={() => setSendInApp(!sendInApp)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={
                  !isSubmitting && !showToast && !isPastSelection
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !isSubmitting && !showToast && !isPastSelection
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={handleSubmit}
                // We keep it visually clickable to show the validation error via toast
                disabled={isSubmitting || showToast}
                className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 overflow-hidden relative mt-auto cursor-pointer
                  ${
                    isPastSelection
                      ? "bg-gray-200 text-gray-500"
                      : showToast
                        ? "bg-[#10B981] text-white"
                        : "bg-[#52B774] hover:bg-[#43a062] text-white"
                  }`}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CircleNotch
                        weight="bold"
                        className="w-6 h-6 animate-spin"
                      />
                    </motion.div>
                  ) : showToast ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check weight="bold" size={20} />
                      <span>Scheduled!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      {isPastSelection && (
                        <WarningCircle size={18} weight="bold" />
                      )}
                      <span>
                        {isPastSelection
                          ? "Cannot schedule in the past"
                          : "Schedule Reminder"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
