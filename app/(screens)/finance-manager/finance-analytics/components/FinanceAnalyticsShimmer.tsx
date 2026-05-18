"use client";

function ShimmerBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export default function FinanceAnalyticsShimmer() {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <ShimmerBlock className="mb-4 h-7 w-56" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-24 flex-col justify-between rounded-lg bg-white p-3 shadow-sm"
          >
            <ShimmerBlock className="h-9 w-9 rounded-sm" />
            <ShimmerBlock className="h-4 w-20" />
            <ShimmerBlock className="h-3 w-28" />
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <ShimmerBlock className="h-5 w-44" />
          <ShimmerBlock className="h-8 w-72" />
        </div>
        <ShimmerBlock className="h-56 w-full" />
        <div className="mt-4 grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <ShimmerBlock key={index} className="h-24 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function YearWiseFeeCollectionShimmer() {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-3">
        <ShimmerBlock className="h-8 w-8 rounded-full" />
        <ShimmerBlock className="h-8 w-72" />
      </div>
      <div className="mb-3 flex items-center justify-between">
        <ShimmerBlock className="h-5 w-48" />
        <ShimmerBlock className="h-8 w-72" />
      </div>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3"
                >
                  <ShimmerBlock className="h-4 w-12" />
                  <ShimmerBlock className="h-8 w-full rounded-sm" />
                  <ShimmerBlock className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      <ShimmerBlock className="mt-5 h-6 w-48" />
      <div className="mt-3 flex items-center justify-between">
        <ShimmerBlock className="h-10 w-96 rounded-full" />
        <div className="flex gap-3">
          <ShimmerBlock className="h-10 w-36 rounded-full" />
          <ShimmerBlock className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <ShimmerBlock className="mt-3 h-64 w-full" />
    </div>
  );
}

export function BranchWiseCollectionShimmer() {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center gap-3">
        <ShimmerBlock className="h-8 w-8 rounded-full" />
        <ShimmerBlock className="h-7 w-72" />
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <ShimmerBlock className="h-5 w-48" />
          <ShimmerBlock className="h-8 w-72" />
        </div>
        <ShimmerBlock className="h-56 w-full" />
        <div className="mt-4 grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShimmerBlock key={index} className="h-28 w-full" />
          ))}
        </div>
      </section>

      <ShimmerBlock className="mt-5 h-6 w-48" />
      <ShimmerBlock className="mt-3 h-80 w-full" />
    </div>
  );
}
