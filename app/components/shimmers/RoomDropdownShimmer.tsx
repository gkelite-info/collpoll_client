import React from "react";

export function RoomDropdownShimmer() {
  const shimmerRows = Array.from({ length: 4 });

  return (
    <div className="py-1 px-1 space-y-1">
      {shimmerRows.map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-center px-3 py-2.5 rounded-lg bg-gray-50/50 animate-pulse space-y-2"
        >
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
