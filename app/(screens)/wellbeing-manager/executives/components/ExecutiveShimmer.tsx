"use client";

import React from "react";

export const ExecutiveShimmer = () => (
  <div className="grid auto-rows-max grid-cols-1 items-start gap-4 overflow-visible pb-0.5 pr-1 sm:grid-cols-2 lg:overflow-y-auto lg:custom-scrollbar xl:grid-cols-3">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <div
        key={i}
        className="flex min-h-[220px] flex-col items-center justify-center rounded-[8px] bg-white px-5 py-6 text-center shadow-[0_1px_12px_rgba(15,23,42,0.05)] sm:min-h-[190px] lg:min-h-[176px] xl:min-h-[196px] animate-pulse"
      >
        <div className="h-[72px] w-[72px] rounded-full bg-gray-200 sm:h-[70px] sm:w-[70px] lg:h-[64px] lg:w-[64px] xl:h-[72px] xl:w-[72px]" />
        <div className="mt-4 flex w-full flex-col items-center gap-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
        </div>
        <div className="mt-3 h-5 w-24 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);

export const TabsShimmer = () => (
  <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pb-1 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] lg:flex lg:flex-row lg:overflow-x-auto lg:whitespace-nowrap lg:max-h-none lg:pb-2 custom-scrollbar animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="h-[40px] min-w-0 rounded-[6px] bg-[#DEDFE3] opacity-70 sm:h-[42px] lg:h-[32px] lg:min-w-[104px] lg:shrink-0"
      />
    ))}
  </div>
);
