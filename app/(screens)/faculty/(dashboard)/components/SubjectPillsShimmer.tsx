import React from "react";

export default function SubjectPillsShimmer() {
  return (
    <div className="mt-4 flex w-full overflow-x-auto gap-3 pb-2 hide-scrollbar">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 flex flex-col justify-center px-5 py-3 rounded-full w-[260px] h-[72px] bg-white shadow-sm border border-gray-100"
        >
          {/* Subject Name Placeholder */}
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2 ml-1" />
          
          {/* Bottom Row Placeholder (Year/Branch/Section) */}
          <div className="flex items-center gap-2 mt-1">
            <div className="h-5 w-12 bg-green-100 animate-pulse rounded-[4px]" />
            <div className="h-2 w-2 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-4 w-10 bg-gray-200 animate-pulse rounded" />
            <div className="flex items-center gap-1.5 ml-1">
               <div className="h-5 w-[28px] bg-gray-200 animate-pulse rounded-[4px]" />
               <div className="h-5 w-[28px] bg-gray-200 animate-pulse rounded-[4px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
