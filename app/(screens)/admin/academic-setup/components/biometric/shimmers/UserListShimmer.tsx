"use client";

import React from "react";

export default function UserListShimmer() {
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="w-full p-4 rounded-lg border border-gray-200 animate-pulse bg-gray-50/50 flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            {/* User Name Shimmer */}
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            {/* Email and Mobile Shimmer */}
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          {/* Role Badge Shimmer */}
          <div className="h-5 bg-gray-200 rounded-full w-14 shrink-0 ml-4" />
        </div>
      ))}
    </div>
  );
}
