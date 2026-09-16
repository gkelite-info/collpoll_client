"use client";

export default function CalendarLeftShimmer({ count = 7 }: { count?: number }) {
  return (
    <div className="hidden md:flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center p-3 rounded-md mt-2 gap-2 bg-[#FFFFFF] border border-[#D4D4D4]"
        >
          {/* Date skeleton */}
          <div className="flex flex-col items-center justify-center gap-0.5 h-[73.1px] w-[73.1px] rounded-md bg-[#D3F1E0] animate-pulse shrink-0">
            <div className="h-3 w-8 bg-gray-300/60 rounded"></div>
            <div className="h-5 w-6 bg-gray-300/60 rounded mt-1"></div>
          </div>
          
          {/* Details skeleton */}
          <div className="w-full flex justify-between items-center pl-2">
            <div className="flex flex-col w-full gap-2">
              <div className="flex gap-4">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
              <div className="h-2.5 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Caret Shimmer */}
            <div className="h-7 w-7 shrink-0 bg-gray-200 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
