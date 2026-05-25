import React from "react";

export default function IssueCardShimmer() {
  return (
    <div className="flex flex-col w-full">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full rounded-2xl p-4 sm:p-6 mb-4 flex flex-col gap-3 sm:gap-4 bg-[#F9F9F9] animate-pulse"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-sm"></div>
            </div>
          </div>

          <div className="h-6 w-3/4 sm:w-1/2 bg-gray-200 rounded mt-1"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm mt-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-7 w-24 bg-gray-200 rounded-xs border border-gray-200"></div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-7 w-28 bg-gray-200 rounded-xs border border-gray-200"></div>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:gap-6 mt-1">
            <div className="h-4 w-24 bg-gray-200 rounded lg:w-[220px] flex-shrink-0"></div>
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-2 mt-2">
            <div className="h-4 w-24 bg-gray-200 rounded sm:mt-2 flex-shrink-0"></div>
            
            <div className="flex flex-wrap gap-3 w-full">
              {[1, 2].map((fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-xs p-2 pr-4 w-full sm:w-auto min-w-[180px]"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-xs flex-shrink-0"></div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    <div className="h-2 w-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}