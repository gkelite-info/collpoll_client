"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { CaretLeft, CaretRight, CaretDown, Trash, CircleNotch, PencilSimple, Eye } from "@phosphor-icons/react";
import { CollegeHoliday, deleteCollegeHoliday, bulkRemoveWeeklyOffs } from "@/lib/helpers/Hr/holidays/holidayAPI";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import ViewHolidayModal from "./ViewHolidayModal";
import { CalendarDotsIcon } from "@phosphor-icons/react/dist/ssr";

interface HolidayCalendarProps {
  holidays: CollegeHoliday[];
  year: number;
  setYear: (year: number) => void;
  onRefresh: () => void;
  onEditRequest?: (holiday: CollegeHoliday) => void;
  readOnly?: boolean;
}

type HolidayStyle = {
  cardBg: string;
  cardBorder: string;
  indicator: string;
  dateBox: string;
  dateText: string;
  badge: string;
};

const HOLIDAY_STYLES: Record<string, HolidayStyle> = {
  festival: {
    cardBg: "bg-orange-50/40 hover:bg-orange-50",
    cardBorder: "border-orange-100 hover:border-orange-200",
    indicator: "bg-orange-500",
    dateBox: "bg-orange-100/70 border-orange-200",
    dateText: "text-orange-800",
    badge: "bg-orange-100 text-orange-700 border-orange-200"
  },
  weekly_off: {
    cardBg: "bg-slate-50/50 hover:bg-slate-100/50",
    cardBorder: "border-slate-100 hover:border-slate-200",
    indicator: "bg-slate-400",
    dateBox: "bg-slate-100 border-slate-200",
    dateText: "text-slate-700",
    badge: "bg-slate-100 text-slate-600 border-slate-200"
  },
  government: {
    cardBg: "bg-blue-50/40 hover:bg-blue-50",
    cardBorder: "border-blue-100 hover:border-blue-200",
    indicator: "bg-blue-500",
    dateBox: "bg-blue-100/70 border-blue-200",
    dateText: "text-blue-800",
    badge: "bg-blue-100 text-blue-700 border-blue-200"
  },
  emergency: {
    cardBg: "bg-red-50/40 hover:bg-red-50",
    cardBorder: "border-red-100 hover:border-red-200",
    indicator: "bg-red-500",
    dateBox: "bg-red-100/70 border-red-200",
    dateText: "text-red-800",
    badge: "bg-red-100 text-red-700 border-red-200"
  },
  custom: {
    cardBg: "bg-purple-50/40 hover:bg-purple-50",
    cardBorder: "border-purple-100 hover:border-purple-200",
    indicator: "bg-purple-500",
    dateBox: "bg-purple-100/70 border-purple-200",
    dateText: "text-purple-800",
    badge: "bg-purple-100 text-purple-700 border-purple-200"
  }
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_COLORS = [
  "bg-gradient-to-r from-blue-500 to-blue-600 text-white", // Jan
  "bg-gradient-to-r from-rose-500 to-rose-600 text-white", // Feb
  "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white", // Mar
  "bg-gradient-to-r from-amber-500 to-amber-600 text-white", // Apr
  "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white", // May
  "bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white", // Jun
  "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white", // Jul
  "bg-gradient-to-r from-lime-500 to-lime-600 text-white", // Aug
  "bg-gradient-to-r from-violet-500 to-violet-600 text-white", // Sep
  "bg-gradient-to-r from-orange-500 to-orange-600 text-white", // Oct
  "bg-gradient-to-r from-teal-500 to-teal-600 text-white", // Nov
  "bg-gradient-to-r from-sky-500 to-sky-600 text-white", // Dec
];

export default function HolidayCalendar({ holidays, year, setYear, onRefresh, onEditRequest, readOnly = false }: HolidayCalendarProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<CollegeHoliday | null>(null);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [holidayToView, setHolidayToView] = useState<CollegeHoliday | null>(null);
  const { collegeId } = useUser();
  const [isBulkRemoving, setIsBulkRemoving] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"remove_sundays" | "remove_saturdays" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };
    
    if (isYearDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isYearDropdownOpen]);

  const { hasSundays, hasSaturdays } = useMemo(() => {
    let sunCount = 0;
    let satCount = 0;
    holidays.forEach(holiday => {
      const date = new Date(holiday.holidayDate);
      if (date.getFullYear() === year && holiday.holidayType === 'weekly_off') {
        if (holiday.recurringDay === 'sunday') sunCount++;
        else if (holiday.recurringDay === 'saturday') satCount++;
      }
    });
    return { 
      hasSundays: sunCount > 0, 
      hasSaturdays: satCount > 0 
    };
  }, [holidays, year]);

  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  const maxAvailableYear = currentYear + 3;
  const availableYears = Array.from({ length: maxAvailableYear - startYear + 1 }, (_, i) => startYear + i);

  const holidaysByMonth = useMemo(() => {
    const grouped = new Map<number, CollegeHoliday[]>();
    for (let i = 0; i < 12; i++) {
      grouped.set(i, []);
    }

    holidays.forEach(holiday => {
      const date = new Date(holiday.holidayDate);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        grouped.get(month)?.push(holiday);
      }
    });

    return grouped;
  }, [holidays, year]);

  const confirmDelete = (holiday: CollegeHoliday) => {
    setHolidayToDelete(holiday);
  };

  const handleDelete = async () => {
    if (!holidayToDelete) return;

    setDeletingId(holidayToDelete.holidayId);
    try {
      await deleteCollegeHoliday(holidayToDelete.holidayId);
      toast.success("Holiday deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete holiday");
    } finally {
      setDeletingId(null);
      setHolidayToDelete(null);
    }
  };

  const handleBulkAction = async () => {
    if (!collegeId || !bulkActionType) return;

    setIsBulkRemoving(true);
    try {
      if (bulkActionType === "remove_sundays") {
        await bulkRemoveWeeklyOffs(collegeId, year, "sunday");
        toast.success(`Removed all auto-generated Sundays for ${year}`);
      } else if (bulkActionType === "remove_saturdays") {
        await bulkRemoveWeeklyOffs(collegeId, year, "saturday");
        toast.success(`Removed all auto-generated Saturdays for ${year}`);
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || `Failed to perform bulk action`);
    } finally {
      setIsBulkRemoving(false);
      setBulkActionType(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 md:p-6">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center justify-start gap-2 w-full md:w-auto">
          <CalendarDotsIcon size={24} className="text-[#43C17A]" weight="fill" />
          Holiday Calendar {year}
        </h2>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          {!readOnly && (
            <div className="flex items-center gap-2 md:mr-2 border-r border-slate-200 pr-2 md:pr-4">
              <button
                onClick={() => setBulkActionType("remove_sundays")}
                disabled={!hasSundays}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
                title="Remove all Sundays"
              >
                <Trash size={16} weight="bold" />
                <span className="hidden sm:inline">Clear Sundays</span>
              </button>
              <button
                onClick={() => setBulkActionType("remove_saturdays")}
                disabled={!hasSaturdays}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
                title="Remove all Saturdays"
              >
                <Trash size={16} weight="bold" />
                <span className="hidden sm:inline">Clear Saturdays</span>
              </button>
            </div>
          )}

          <button 
            onClick={() => setYear(year - 1)}
            disabled={year <= 2026}
            className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition shadow-sm text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer min-w-[110px]"
            >
              <span className="font-bold text-slate-800 text-base">{year}</span>
              <CaretDown size={16} weight="bold" className={`text-slate-500 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isYearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-y-auto max-h-56 custom-scrollbar py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {availableYears.map(y => (
                    <button
                      key={y}
                      onClick={() => {
                        setYear(y);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        y === year 
                          ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500' 
                          : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
            )}
          </div>

          <button 
            onClick={() => setYear(year + 1)}
            disabled={year >= maxAvailableYear}
            className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition shadow-sm text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarDotsIcon size={64} weight="thin" className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">No holidays found for {year}</p>
          {!readOnly && (
            <p className="text-sm">Click &quot;Add Holiday&quot; to start building your calendar.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MONTHS.map((monthName, index) => {
            const monthHolidays = holidaysByMonth.get(index) || [];
            if (monthHolidays.length === 0) return null;

            return (
              <div key={monthName} className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className={`px-4 py-2 shadow-sm ${MONTH_COLORS[index]}`}>
                  <h3 className="font-bold text-sm">{monthName}</h3>
                </div>
                
                <div className="p-4 flex flex-col gap-3 bg-slate-50/30">
                  {monthHolidays.map(holiday => {
                    const style = HOLIDAY_STYLES[holiday.holidayType] || HOLIDAY_STYLES.custom;
                    const day = new Date(holiday.holidayDate).getDate();
                    const dayName = new Date(holiday.holidayDate).toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div 
                        key={holiday.holidayId} 
                        onClick={() => setActiveCardId(activeCardId === holiday.holidayId ? null : holiday.holidayId)}
                        className={`flex items-center gap-2 sm:gap-3 p-3 rounded-lg border shadow-sm transition-all hover:shadow-md group relative overflow-hidden cursor-pointer ${style.cardBg} ${style.cardBorder}`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.indicator}`} />
                        
                        <div className={`flex flex-col items-center justify-center min-w-[3.5rem] rounded-lg p-2 border ${style.dateBox}`}>
                          <span className={`text-[10px] font-bold uppercase opacity-80 ${style.dateText}`}>{dayName}</span>
                          <span className={`text-xl font-black leading-none mt-0.5 ${style.dateText}`}>{day}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden py-1">
                          <h4 className="font-bold text-slate-800 text-sm leading-tight truncate pr-1">{holiday.title}</h4>
                          {holiday.description && holiday.description.toLowerCase() !== "weekly off" && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate pr-1">{holiday.description}</p>
                          )}
                          <div className="mt-1.5 flex flex-wrap">
                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${style.badge}`}>
                              {holiday.holidayType === 'custom' ? 'Institutional Event' : holiday.holidayType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className={`transition-all duration-300 ease-in-out flex flex-col items-center justify-center shrink-0 relative z-10 overflow-hidden ${activeCardId === holiday.holidayId ? 'opacity-100 pointer-events-auto max-w-[40px] w-full gap-0.5' : 'opacity-0 pointer-events-none max-w-0 w-0 gap-0 lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto lg:group-hover:max-w-[40px] lg:group-hover:w-full lg:group-hover:gap-0.5'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setHolidayToView(holiday);
                            }}
                            className="p-1.5 sm:p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                            title="View Holiday"
                          >
                            <Eye size={18} weight="bold" />
                          </button>
                          {!readOnly && onEditRequest && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditRequest(holiday);
                              }}
                              className="p-1.5 sm:p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Holiday"
                            >
                              <PencilSimple size={18} weight="bold" />
                            </button>
                          )}
                          {!readOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(holiday);
                              }}
                              disabled={deletingId === holiday.holidayId}
                              className="p-1.5 sm:p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Holiday"
                            >
                              {deletingId === holiday.holidayId ? (
                                <CircleNotch size={18} className="animate-spin" />
                              ) : (
                                <Trash size={18} weight="fill" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDeleteModal
        open={!!holidayToDelete}
        onConfirm={handleDelete}
        onCancel={() => setHolidayToDelete(null)}
        isDeleting={deletingId !== null}
        title="Delete Holiday"
        name={holidayToDelete?.title}
        confirmText="Yes, Delete"
      />

      <ViewHolidayModal
        isOpen={!!holidayToView}
        onClose={() => setHolidayToView(null)}
        holiday={holidayToView}
      />

      <ConfirmDeleteModal
        open={!!bulkActionType}
        onConfirm={handleBulkAction}
        onCancel={() => setBulkActionType(null)}
        isDeleting={isBulkRemoving}
        title={bulkActionType === "remove_sundays" ? "Remove Sundays" : "Remove Saturdays"}
        actionType="remove"
        confirmText="Yes, Remove"
        loadingText="Removing..."
        customDescription={`Are you sure you want to completely remove all auto-generated ${bulkActionType?.includes("sundays") ? "Sundays" : "Saturdays"} from the year ${year}?`}
      />
    </div>
  );
}
