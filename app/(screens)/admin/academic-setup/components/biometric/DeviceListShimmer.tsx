"use client";

import React from "react";

export default function DeviceListShimmer() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 animate-pulse bg-gray-50/50"
        >
          <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
