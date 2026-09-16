"use client";

export default function CalendarStatsShimmer() {
  return (
    <div className="bg-white grid grid-cols-3 gap-2 lg:gap-3 rounded-lg shadow-md p-2 lg:p-3 max-md:mt-3">
      {/* Quiz Shimmer */}
      <div className="bg-pink-100/50 border border-pink-200 rounded-lg p-2 flex flex-col items-center justify-center text-center h-[90px] lg:h-[110px] animate-pulse">
        <div className="h-8 lg:h-9 w-10 bg-pink-200 rounded mb-2"></div>
        <div className="h-3 lg:h-4 w-16 bg-pink-200 rounded mt-1 mb-1"></div>
        <div className="h-3 lg:h-4 w-12 bg-pink-200 rounded"></div>
      </div>
      
      {/* Assignment Shimmer */}
      <div className="bg-blue-100/50 border border-blue-200 rounded-lg p-2 flex flex-col items-center justify-center text-center h-[90px] lg:h-[110px] animate-pulse">
        <div className="h-8 lg:h-9 w-10 bg-blue-200 rounded mb-2"></div>
        <div className="h-3 lg:h-4 w-16 bg-blue-200 rounded mt-1 mb-1"></div>
        <div className="h-3 lg:h-4 w-12 bg-blue-200 rounded"></div>
      </div>
      
      {/* Discussion Shimmer */}
      <div className="bg-purple-100/50 border border-purple-200 rounded-lg p-2 flex flex-col items-center justify-center text-center h-[90px] lg:h-[110px] animate-pulse">
        <div className="h-8 lg:h-9 w-10 bg-purple-200 rounded mb-2"></div>
        <div className="h-3 lg:h-4 w-16 bg-purple-200 rounded mt-1 mb-1"></div>
        <div className="h-3 lg:h-4 w-12 bg-purple-200 rounded"></div>
      </div>
    </div>
  );
}
