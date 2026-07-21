import React from 'react';
import CalendarGridShimmer from './CalendarGridShimmer';
import { CaretLeft } from "@phosphor-icons/react";

const CalendarViewShimmer: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Header Section Shimmer */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2">
            <CaretLeft size={23} className="text-gray-300 shrink-0" weight="bold" />
            <div className="h-7 w-48 bg-gray-300 rounded-md"></div>
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded-md mt-3 ml-1"></div>
        </div>
        {/* Course Schedule Card Shimmer (Desktop only) */}
        <div className="hidden md:flex lg:flex w-[320px] h-[72px] bg-gray-200 rounded-xl"></div>
      </section>

      {/* Toolbar & Header Controls Shimmer */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-4">
        {/* Toolbar Tabs Shimmer */}
        <div className="bg-[#5252521C] rounded-t-[20px] border-b border-gray-200 px-6 py-4 flex items-center gap-8 w-full md:w-auto overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-24 bg-gray-300 rounded-md shrink-0"></div>
          ))}
        </div>
        
        {/* Calendar Header Shimmer */}
        <div className="flex flex-col min-[360px]:flex-row items-stretch min-[360px]:items-center justify-between w-full md:w-auto gap-3 min-[360px]:gap-4 mb-1">
          <div className="flex items-center bg-gray-200 border border-gray-200 rounded-lg h-9 w-full min-[360px]:w-48"></div>
          <div className="h-9 bg-emerald-100 rounded-lg w-full min-[360px]:w-28 shrink-0"></div>
        </div>
      </div>

      {/* Grid Shimmer */}
      <CalendarGridShimmer />
    </div>
  );
};

export default CalendarViewShimmer;
