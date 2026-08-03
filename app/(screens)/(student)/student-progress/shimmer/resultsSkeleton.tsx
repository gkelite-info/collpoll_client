"use client";

import Skeleton from "@/app/utils/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-4 gap-4 border-b border-gray-100 pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, row) => (
          <div key={row} className="grid grid-cols-4 gap-4 border-b border-gray-100 py-5 last:border-0">
            {Array.from({ length: 4 }).map((_, column) => (
              <Skeleton key={column} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <Skeleton className="mb-8 h-7 w-56" />
        <div className="flex h-64 items-end justify-around gap-5">
          {[45, 70, 55, 85].map((height, index) => (
            <Skeleton key={index} className="w-14 rounded-t-lg" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
