import React from "react";

export default function HolidayCalendarShimmer() {
  const shimmerClass = "animate-pulse bg-slate-200 rounded";

  return (
    <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 md:p-6 w-full">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center justify-start gap-2 w-full md:w-auto">
          <div className="w-6 h-6 rounded-md animate-pulse bg-emerald-100"></div>
          <div className={`h-6 sm:h-7 w-40 sm:w-48 ${shimmerClass}`}></div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 md:mr-2 border-r border-slate-200 pr-2 md:pr-4">
            {/* Shimmer for Clear Sundays button */}
            <div className={`w-24 sm:w-32 h-8 sm:h-9 rounded-xl ${shimmerClass}`}></div>
            {/* Shimmer for Clear Saturdays button */}
            <div className={`w-24 sm:w-32 h-8 sm:h-9 rounded-xl ${shimmerClass}`}></div>
          </div>

          {/* Left Caret */}
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${shimmerClass}`}></div>
          
          {/* Year Dropdown */}
          <div className={`w-[110px] h-9 sm:h-10 rounded-xl ${shimmerClass}`}></div>
          
          {/* Right Caret */}
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${shimmerClass}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`h-9 w-full animate-pulse bg-slate-100 px-4 py-2 flex items-center`}>
              <div className={`h-4 w-24 ${shimmerClass} bg-slate-200`}></div>
            </div>
            
            <div className="p-4 flex flex-col gap-3 bg-slate-50/30">
              {[1, 2].map((j) => (
                <div key={j} className="relative flex items-center gap-2 sm:gap-3 p-3 rounded-lg border shadow-sm bg-white overflow-hidden">
                  <div className={`w-1 absolute left-0 top-0 bottom-0 animate-pulse bg-slate-200`} />
                  
                  <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-[3.5rem] rounded-lg border animate-pulse bg-slate-50"></div>
                  
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className={`h-4 w-3/4 ${shimmerClass}`}></div>
                    <div className={`h-3 w-1/2 ${shimmerClass}`}></div>
                    <div className="mt-1.5 flex flex-wrap">
                      <div className={`h-4 w-16 rounded-full ${shimmerClass}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
