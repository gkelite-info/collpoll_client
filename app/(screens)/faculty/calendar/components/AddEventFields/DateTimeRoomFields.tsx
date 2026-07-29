"use client";

import React from "react";
import RoomSelectDropdown from "@/app/components/calendar/RoomSelectDropdown";
import { ModalSelect } from "./ModalSelect";

interface DateTimeRoomFieldsProps {
  calendarMode: "single" | "bulk";
  selectedType: string;
  date: string;
  setDate: (date: string) => void;
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  TODAY: string;
  roomNo: string;
  setRoomNo: (room: string) => void;
  setCollegeRoomId: (id: number | null) => void;
  collegeId: number;
  startHour: string;
  setStartHour: (hour: string) => void;
  startMinute: string;
  setStartMinute: (min: string) => void;
  startPeriod: string;
  setStartPeriod: (p: "AM" | "PM") => void;
  endHour: string;
  setEndHour: (hour: string) => void;
  endMinute: string;
  setEndMinute: (min: string) => void;
  endPeriod: string;
  setEndPeriod: (p: "AM" | "PM") => void;
  isDateInputFocused: boolean;
  setIsDateInputFocused: (f: boolean) => void;
  INPUT_HEIGHT: string;
}

const DateTimeRoomFields: React.FC<DateTimeRoomFieldsProps> = ({
  calendarMode,
  selectedType,
  date, setDate,
  fromDate, setFromDate,
  toDate, setToDate,
  TODAY,
  roomNo, setRoomNo,
  setCollegeRoomId,
  collegeId,
  startHour, setStartHour,
  startMinute, setStartMinute,
  startPeriod, setStartPeriod,
  endHour, setEndHour,
  endMinute, setEndMinute,
  endPeriod, setEndPeriod,
  isDateInputFocused, setIsDateInputFocused,
  INPUT_HEIGHT,
}) => {
  return (
    <>
      <div>
        {calendarMode === "single" ? (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full min-w-0">
              <label className="block text-gray-700 font-medium text-sm mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl overflow-hidden transition-colors ${
                  isDateInputFocused ? "border-primary ring-1 ring-primary" : "border-gray-300"
                }`}
              >
                <input
                  type="date"
                  value={date}
                  min={TODAY}
                  onChange={(e) => setDate(e.target.value)}
                  onFocus={() => setIsDateInputFocused(true)}
                  onBlur={() => setIsDateInputFocused(false)}
                  className={`w-full ${INPUT_HEIGHT} px-4 focus:outline-none bg-transparent cursor-pointer`}
                />
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room No. {selectedType === "class" && <span className="text-red-500">*</span>}
              </label>
              <RoomSelectDropdown
                value={roomNo}
                onChange={(rNo, rId) => { setRoomNo(rNo); setCollegeRoomId(rId); }}
                collegeId={collegeId || 0}
                placeholder="Select Room No. / Room Name"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1 relative">
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative flex items-center border rounded-xl overflow-hidden transition-colors ${
                    isDateInputFocused ? "border-primary ring-1 ring-primary" : "border-gray-300"
                  }`}
                >
                  <input
                    type="date"
                    value={fromDate}
                    min={TODAY}
                    onChange={(e) => setFromDate(e.target.value)}
                    onFocus={() => setIsDateInputFocused(true)}
                    onBlur={() => setIsDateInputFocused(false)}
                    className={`w-full ${INPUT_HEIGHT} px-4 focus:outline-none bg-transparent cursor-pointer`}
                  />
                </div>
              </div>
              <div className="flex-1 relative">
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border rounded-xl overflow-hidden transition-colors border-gray-300">
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || TODAY}
                    onChange={(e) => setToDate(e.target.value)}
                    className={`w-full ${INPUT_HEIGHT} px-4 focus:outline-none bg-transparent cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1 w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room No. {selectedType === "class" && <span className="text-red-500">*</span>}
                </label>
                <RoomSelectDropdown
                  value={roomNo}
                  onChange={(rNo, rId) => { setRoomNo(rNo); setCollegeRoomId(rId); }}
                  collegeId={collegeId || 0}
                  placeholder="Select Room No. / Room Name"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-red-00 flex flex-col space-y-2 mt-3">
        <label className="block text-gray-700 font-medium text-sm">Time</label>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          
          {/* FROM BLOCK */}
          <div className="flex flex-col gap-1 w-full sm:flex-1 min-w-0">
            <div className="flex gap-0.5">
              <span className="block text-gray-500 text-xs font-medium">From</span>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 w-full">
              <div className="flex-[3] min-w-0">
                <ModalSelect
                  value={startHour}
                  onChange={(val) => setStartHour(String(val))}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return { value: h, label: h };
                  })}
                  placeholder="HH"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>

              <div className="flex-[3] min-w-0">
                <ModalSelect
                  value={startMinute}
                  onChange={(val) => setStartMinute(String(val))}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const m = String(i * 5).padStart(2, "0");
                    return { value: m, label: m };
                  })}
                  placeholder="MM"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>

              <div className="flex-[4] min-w-0">
                <ModalSelect
                  value={startPeriod}
                  onChange={(val) => setStartPeriod(val as "AM" | "PM")}
                  options={[
                    { value: "AM", label: "AM" },
                    { value: "PM", label: "PM" }
                  ]}
                  placeholder="--"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>
            </div>
          </div>

          {/* TO BLOCK */}
          <div className="flex flex-col gap-1 w-full sm:flex-1 min-w-0">
            <div className="flex gap-0.5">
              <span className="block text-gray-500 text-xs font-medium">To</span>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 w-full">
              <div className="flex-[3] min-w-0">
                <ModalSelect
                  value={endHour}
                  onChange={(val) => setEndHour(String(val))}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return { value: h, label: h };
                  })}
                  placeholder="HH"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>

              <div className="flex-[3] min-w-0">
                <ModalSelect
                  value={endMinute}
                  onChange={(val) => setEndMinute(String(val))}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const m = String(i * 5).padStart(2, "0");
                    return { value: m, label: m };
                  })}
                  placeholder="MM"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>

              <div className="flex-[4] min-w-0">
                <ModalSelect
                  value={endPeriod}
                  onChange={(val) => setEndPeriod(val as "AM" | "PM")}
                  options={[
                    { value: "AM", label: "AM" },
                    { value: "PM", label: "PM" }
                  ]}
                  placeholder="--"
                  INPUT_HEIGHT={INPUT_HEIGHT}
                  isSmall={true}
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default DateTimeRoomFields;
