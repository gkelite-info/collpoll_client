"use client";

import React from "react";

export function LeaveCardsShimmer() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex h-[105px] w-full flex-col justify-center gap-3 rounded-2xl bg-gray-100 p-4 shadow-sm animate-pulse"
        >
          <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-12 rounded bg-gray-200"></div>
            <div className="h-3 w-20 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeavePageShimmer() {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col p-2">
      {/* Header section shimmer */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="text-gray-300">/</div>
            <div className="h-5 w-32 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="text-gray-300">/</div>
            <div className="h-5 w-40 rounded-md bg-gray-200 animate-pulse"></div>
          </div>
          <div className="h-4 w-80 max-w-full rounded-md bg-gray-200 animate-pulse"></div>
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse"></div>
      </div>

      <LeaveCardsShimmer />

      {/* Search and Date section shimmer */}
      <div className="flex flex-col items-center justify-between gap-2 py-3 sm:flex-row">
        <div className="h-10 w-full sm:w-[300px] rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-9 w-32 rounded-md bg-gray-200 animate-pulse"></div>
      </div>

      {/* Table section shimmer */}
      <div className="-mt-2 w-full table-container-wrapper">
        <div className="h-[55vh] w-full rounded-xl bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  );
}

export function RightPageShimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* CourseScheduleCard shimmer */}
      <div className="flex justify-between w-full h-[54px]">
        <div className="bg-gray-200 w-[49%] h-full rounded-lg animate-pulse" />
        <div className="bg-gray-200 w-[49%] h-full rounded-lg animate-pulse" />
      </div>
      {/* WorkWeekCalendar shimmer */}
      <div className="bg-gray-200 w-full h-[120px] rounded-2xl animate-pulse" />
      {/* TaskPanel shimmer */}
      <div className="bg-gray-200 w-full flex-1 min-h-[400px] rounded-2xl animate-pulse" />
    </div>
  );
}
