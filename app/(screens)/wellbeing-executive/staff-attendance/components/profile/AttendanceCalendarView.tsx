import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { AttendanceMonthData } from "./attendance-profile-data";

type AttendanceCalendarViewProps = {
  month: AttendanceMonthData;
  onPrevious: () => void;
  onNext: () => void;
};

export default function AttendanceCalendarView({
  month,
  onPrevious,
  onNext,
}: AttendanceCalendarViewProps) {
  const calendarDays = Array.from({ length: month.daysInMonth }, (_, index) => index + 1);
  const absentDays = new Set(month.absentDays);
  const blankDays = new Set(month.blankDays);

  return (
    <div className="mx-auto w-full max-w-[620px] overflow-hidden rounded-3xl border border-[#D7DFEC] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5EAF2] px-6 py-5">
        <h3 className="text-[22px] font-extrabold uppercase text-black">{month.title}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrevious}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black text-white transition-transform active:scale-95"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black text-white transition-transform active:scale-95"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-4 px-6 py-5 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-[15px] font-extrabold text-black">
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const isAbsent = absentDays.has(day);
          const isBlank = blankDays.has(day);
          return (
            <div key={day} className="grid place-items-center">
              <span
                className={`grid h-14 w-14 place-items-center rounded-full text-[16px] font-extrabold ${
                  isAbsent
                    ? "bg-[#FFDCD2] text-black"
                    : isBlank
                      ? "bg-white text-black"
                      : "bg-[#DFF4D8] text-black"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
