import React, { useEffect, useState } from 'react';
import { CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { X, CalendarBlank, Textbox } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

interface ViewHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holiday: CollegeHoliday | null;
}

const HOLIDAY_COLORS: Record<string, string> = {
  festival: "text-orange-600 bg-orange-100 border-orange-200",
  weekly_off: "text-slate-600 bg-slate-100 border-slate-200",
  government: "text-blue-600 bg-blue-100 border-blue-200",
  emergency: "text-red-600 bg-red-100 border-red-200",
  custom: "text-purple-600 bg-purple-100 border-purple-200"
};

const HOLIDAY_GRADIENTS: Record<string, string> = {
  festival: "from-orange-50 to-orange-100/50",
  weekly_off: "from-slate-50 to-slate-100/50",
  government: "from-blue-50 to-blue-100/50",
  emergency: "from-red-50 to-red-100/50",
  custom: "from-purple-50 to-purple-100/50"
};

export default function ViewHolidayModal({ isOpen, onClose, holiday }: ViewHolidayModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted || (!isOpen && !show)) return null;
  if (!holiday) return null;

  const dateObj = new Date(holiday.holidayDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  const colorClass = HOLIDAY_COLORS[holiday.holidayType] || HOLIDAY_COLORS.custom;
  const gradientClass = HOLIDAY_GRADIENTS[holiday.holidayType] || HOLIDAY_GRADIENTS.custom;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div 
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out transform ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative pl-5 pr-12 py-6 sm:px-8 sm:py-8 sm:pr-14 bg-gradient-to-br ${gradientClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white rounded-full transition-all cursor-pointer shadow-sm z-10"
          >
            <X size={18} weight="bold" />
          </button>

          <div className="flex items-start gap-3 sm:gap-5">
            <div className="flex flex-col items-center justify-center min-w-[4.5rem] sm:min-w-[5rem] h-[4.5rem] sm:h-[5rem] bg-white rounded-xl shadow-sm border border-white/50 shrink-0">
              <span className={`text-xs sm:text-sm font-bold uppercase ${colorClass.split(" ")[0]}`}>{month.substring(0, 3)}</span>
              <span className={`text-2xl sm:text-3xl font-black leading-none mt-1 ${colorClass.split(" ")[0]}`}>{day}</span>
            </div>
            <div className="pt-0.5 sm:pt-1 min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight break-words">
                {holiday.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[10px] sm:text-xs font-bold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${colorClass}`}>
                  {holiday.holidayType === 'custom' ? 'Institutional Event' : holiday.holidayType.replace('_', ' ')}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 bg-white/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  {year}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 shrink-0">
              <CalendarBlank size={20} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day</p>
              <p className="text-sm font-medium text-slate-700">{dayName}, {month} {day}, {year}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 shrink-0 mt-1">
              <Textbox size={20} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed max-w-none whitespace-pre-wrap break-words">
                {holiday.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 sm:px-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
