"use client";

import React from "react";

export default function CollegeTimingsShimmer() {
  return (
    <div className="w-full animate-pulse">
      {/* Top Header Shimmer */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="w-64 h-7 bg-gray-200 rounded-md" />
          </div>
          <div className="w-80 h-4 bg-gray-200 rounded-md mt-2" />
        </div>
        <div className="w-full md:w-36 h-10 bg-gray-200 rounded-lg" />
      </div>

      {/* Main Card Shimmer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-6 overflow-hidden w-full">
        {/* Desktop Header Row */}
        <div className="hidden lg:grid grid-cols-[140px_100px_1fr] gap-6 px-6 py-3 bg-gray-50 rounded-t-lg border-b border-gray-100 min-w-[700px]">
          <div className="w-12 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 gap-4">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
          </div>
        </div>

        {/* 7 Rows Shimmer */}
        <div className="divide-y divide-gray-100 min-w-[280px] lg:min-w-[700px]">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col lg:grid lg:grid-cols-[140px_100px_1fr] gap-4 lg:gap-6 px-4 lg:px-6 py-5"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between lg:hidden w-full">
                <div className="w-24 h-5 bg-gray-200 rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-4 bg-gray-200 rounded" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full" />
                </div>
              </div>

              {/* Desktop Day Column */}
              <div className="hidden lg:flex items-center">
                <div className="w-24 h-5 bg-gray-200 rounded" />
              </div>

              {/* Desktop Status Column */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-11 h-6 bg-gray-200 rounded-full" />
                <div className="w-10 h-4 bg-gray-200 rounded" />
              </div>

              {/* Times Dropdown Columns */}
              <div className="min-h-[42px] flex items-center mt-2 lg:mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                  <div className="w-full h-10 bg-gray-200 rounded-lg" />
                  <div className="w-full h-10 bg-gray-200 rounded-lg" />
                  <div className="w-full h-10 bg-gray-200 rounded-lg" />
                  <div className="w-full h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
