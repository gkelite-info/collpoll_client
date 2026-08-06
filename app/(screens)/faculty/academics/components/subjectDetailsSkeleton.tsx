import React from "react";

export function SubjectDetailsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x mt-8 max-md:flex-col max-md:overflow-x-visible max-md:pb-0">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="min-w-[85vw] w-[85vw] md:min-w-[320px] md:w-[350px] shrink-0 snap-start max-md:min-w-0 max-md:w-full max-md:h-auto"
        >
          <div className="relative rounded-2xl w-full p-5 shadow-sm border border-gray-100 flex flex-col bg-gray-50 h-[450px] max-md:h-[350px] animate-pulse">
            
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded-md" />
            </div>

            {/* Title skeleton */}
            <div className="mb-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-2" />
              <div className="h-6 w-1/2 bg-gray-200 rounded-md" />
            </div>

            {/* Progress bar skeleton */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-3 bg-gray-200 rounded-full flex-1" />
              <div className="h-3 w-8 bg-gray-200 rounded-md" />
            </div>

            {/* List skeleton */}
            <div className="mt-6 flex-1 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-4 w-4 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="h-4 w-4 bg-gray-200 rounded-md" />
                    <div className="h-6 w-6 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="absolute bottom-4 right-4 max-md:bottom-[8px] max-md:right-[12px]">
              <div className="h-8 w-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
