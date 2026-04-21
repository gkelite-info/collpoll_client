"use client";

import type { CSSProperties } from "react";

function ShimmerBlock({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={style}
    />
  );
}

export function PlacementTabsShimmer() {
  return (
    <div className="mt-2 inline-flex max-w-full gap-2 rounded-full bg-[#E6E6E6] px-2 py-2">
      {[160, 150, 170, 145].map((width) => (
        <ShimmerBlock key={width} className="h-8" style={{ width }} />
      ))}
    </div>
  );
}

export function CompanyCardsShimmer() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ShimmerBlock className="h-8 w-28" />
      </div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-[22px] bg-white px-8 py-5">
          <div className="flex gap-4">
            <ShimmerBlock className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <ShimmerBlock className="h-5 w-52" />
              <ShimmerBlock className="h-4 w-40" />
              <div className="flex gap-2">
                <ShimmerBlock className="h-7 w-16 rounded-full" />
                <ShimmerBlock className="h-7 w-20 rounded-full" />
                <ShimmerBlock className="h-7 w-28 rounded-full" />
              </div>
              <ShimmerBlock className="h-4 w-full" />
              <ShimmerBlock className="h-4 w-10/12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlacementTableShimmer() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ShimmerBlock className="h-8 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-32 rounded-lg bg-white p-3 shadow-sm">
            <ShimmerBlock className="h-8 w-9" />
            <div className="mt-8 space-y-2">
              <ShimmerBlock className="h-7 w-16" />
              <ShimmerBlock className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <ShimmerBlock className="mb-4 h-8 w-full" />
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <ShimmerBlock key={item} className="mb-3 h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PlacementRightPanelShimmer() {
  return (
    <aside className="sticky top-0 h-screen w-85 shrink-0">
      <div className="flex h-full flex-col gap-3">
        <ShimmerBlock className="h-22 w-80 rounded-xl" />
        <ShimmerBlock className="h-52 w-80 rounded-xl" />
        <div className="min-h-0 flex-1 rounded-xl bg-white p-4 shadow-sm">
          <ShimmerBlock className="mb-4 h-6 w-40" />
          {[1, 2, 3, 4, 5].map((item) => (
            <ShimmerBlock key={item} className="mb-3 h-20 w-full" />
          ))}
        </div>
      </div>
    </aside>
  );
}
