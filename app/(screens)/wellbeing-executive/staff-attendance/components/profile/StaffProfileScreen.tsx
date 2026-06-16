"use client";

import { ArrowLeft, FunnelSimple } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { StaffAttendanceRecord } from "../../data";
import AttendanceCalendarView from "./AttendanceCalendarView";
import AttendanceTableView from "./AttendanceTableView";
import {
  getAdjacentMonthKey,
  getAttendanceMonthData,
  getAttendanceMonthOptions,
  getCurrentMonthKey,
  type AttendanceMonthKey,
} from "./attendance-profile-data";
import ProfileInfoCard from "./ProfileInfoCard";
import ProfileStats from "./ProfileStats";

type ProfileView = "table" | "calendar";

type StaffProfileScreenProps = {
  staff: StaffAttendanceRecord;
  onBack: () => void;
};

export default function StaffProfileScreen({ staff, onBack }: StaffProfileScreenProps) {
  const [view, setView] = useState<ProfileView>("table");
  const [selectedMonth, setSelectedMonth] = useState<AttendanceMonthKey>(getCurrentMonthKey);
  const monthOptions = getAttendanceMonthOptions();
  const monthData = getAttendanceMonthData(selectedMonth);
  const moveMonth = (direction: -1 | 1) => {
    setSelectedMonth((current) => getAdjacentMonthKey(current, direction));
  };

  return (
    <main className="min-h-screen w-full overflow-y-auto p-2 pb-6">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col rounded-2xl bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[#F3F6FA] text-[#08244A] transition-colors hover:bg-[#08244A] hover:text-white"
            title="Back to attendance"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <h1 className="text-[30px] font-extrabold text-[#08244A]">Ground Staff Profile</h1>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ProfileInfoCard staff={staff} />
          <div>
            <ProfileStats staff={staff} />

            <div className="mt-5 overflow-hidden rounded-md border border-[#D7DFEC] bg-white">
              <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-[16px] font-medium text-[#2D3748]">Attendance Records</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-md bg-[#EDF1F7] p-1">
                    <ViewButton active={view === "table"} onClick={() => setView("table")}>
                      Table View
                    </ViewButton>
                    <ViewButton active={view === "calendar"} onClick={() => setView("calendar")}>
                      Calendar View
                    </ViewButton>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value as AttendanceMonthKey)}
                    className="h-9 cursor-pointer rounded-md border border-[#D7DFEC] bg-white px-4 text-[12px] font-semibold text-[#34425E] outline-none"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[#D7DFEC] text-[#34425E] hover:bg-[#F7F9FC]">
                    <FunnelSimple size={17} weight="bold" />
                  </button>
                </div>
              </div>

              {view === "calendar" ? (
                <div className="border-t border-[#D7DFEC] p-5">
                  <AttendanceCalendarView
                    month={monthData}
                    onPrevious={() => moveMonth(-1)}
                    onNext={() => moveMonth(1)}
                  />
                </div>
              ) : (
                <AttendanceTableView month={monthData} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded px-4 text-[12px] font-extrabold transition-colors ${
        active ? "cursor-pointer bg-white text-[#08244A] shadow-sm" : "cursor-pointer text-[#64748B] hover:text-[#08244A]"
      }`}
    >
      {children}
    </button>
  );
}
