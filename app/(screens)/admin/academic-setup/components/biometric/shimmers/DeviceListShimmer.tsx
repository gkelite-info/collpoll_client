"use client";

import React from "react";

export default function DeviceListShimmer() {
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="w-full p-3.5 rounded-lg border border-gray-200 animate-pulse bg-gray-50/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
          <div className="h-5 bg-gray-200 rounded-full w-16 shrink-0 ml-4" />
        </div>
      ))}
    </div>
  );
}
