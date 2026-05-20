"use client";

function ShimmerBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

function SummaryCardsShimmer() {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
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
  );
}

function ChartShimmer() {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <ShimmerBlock className="h-5 w-40" />
        <ShimmerBlock className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex h-44 items-end gap-5 border-b border-l border-gray-300 pl-5">
        {["h-28", "h-20", "h-32", "h-16", "h-24"].map((height, index) => (
          <ShimmerBlock
            key={index}
            className={`${height} w-10 rounded-b-none`}
          />
        ))}
      </div>
    </section>
  );
}

function RightShimmer() {
  return (
    <aside className="hidden min-h-0 p-2 pr-0 md:flex md:w-[32%] md:flex-col lg:flex lg:w-[32%]">
      <div className="grid grid-cols-2 gap-4">
        <div />
        <ShimmerBlock className="h-20 w-full" />
      </div>
      <ShimmerBlock className="mt-3 h-52 w-full" />
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 rounded-lg bg-white p-3">
        <ShimmerBlock className="h-5 w-36" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3 rounded-lg bg-gray-50 p-3">
            <ShimmerBlock className="h-14 w-14 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <ShimmerBlock className="h-3 w-full" />
              <ShimmerBlock className="h-3 w-3/4" />
              <ShimmerBlock className="h-2 w-24" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DashboardLeftShimmer() {
  return (
    <div className="w-full p-2 pb-7 md:w-[68%] lg:w-[68%] lg:pb-5">
      <ShimmerBlock className="h-40 w-full" />
      <div className="mt-3">
        <SummaryCardsShimmer />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartShimmer />
        <ChartShimmer />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ShimmerBlock className="h-64 w-full" />
        <ShimmerBlock className="h-64 w-full" />
      </div>
    </div>
  );
}

export function FinanceManagerDashboardShimmer() {
  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <DashboardLeftShimmer />
      <RightShimmer />
    </main>
  );
}

export function TotalRevenueShimmer() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 lg:pb-5">
        <div className="mb-4 flex items-center gap-3">
          <ShimmerBlock className="h-8 w-8 rounded-full" />
          <ShimmerBlock className="h-7 w-64" />
        </div>
        <SummaryCardsShimmer />
        <section className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <ShimmerBlock className="h-5 w-44" />
            <ShimmerBlock className="h-8 w-72" />
          </div>
          <ShimmerBlock className="h-52 w-full" />
          <div className="mt-3 grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <ShimmerBlock key={index} className="h-24 w-full" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function TotalPendingFeesShimmer() {
  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 md:w-[68%] lg:w-[68%] lg:pb-5">
        <div className="mb-3 flex items-center gap-3">
          <ShimmerBlock className="h-8 w-8 rounded-full" />
          <ShimmerBlock className="h-6 w-72" />
        </div>
        <ShimmerBlock className="mb-3 h-8 w-3/4" />
        <SummaryCardsShimmer />
        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
          <ShimmerBlock className="h-36 w-full" />
          <ShimmerBlock className="h-36 w-full" />
        </div>
        <ShimmerBlock className="mt-3 h-14 w-2/3 rounded-full" />
        <ShimmerBlock className="mt-3 h-7 w-3/4" />
        <ShimmerBlock className="mt-3 h-[calc(100vh-24rem)] min-h-64 w-full" />
      </div>
      <RightShimmer />
    </main>
  );
}

export function TotalStudentsShimmer() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 lg:pb-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="h-8 w-8 rounded-full" />
            <ShimmerBlock className="h-6 w-64" />
          </div>
          <ShimmerBlock className="h-9 w-36" />
        </div>
        <SummaryCardsShimmer />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ShimmerBlock className="h-10 w-80 rounded-full" />
          <ShimmerBlock className="h-9 w-40 rounded-full" />
          <ShimmerBlock className="h-9 w-32 rounded-full" />
          <ShimmerBlock className="h-9 w-28 rounded-full" />
          <ShimmerBlock className="h-9 w-24 rounded-full" />
          <ShimmerBlock className="h-9 w-32 rounded-full" />
        </div>
        <ShimmerBlock className="mt-4 h-5 w-56" />
        <ShimmerBlock className="mt-3 h-[55vh] w-full" />
      </div>
    </main>
  );
}

export function ActiveManagersShimmer() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 lg:pb-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="h-8 w-8 rounded-full" />
            <ShimmerBlock className="h-6 w-44" />
          </div>
          <ShimmerBlock className="h-9 w-36" />
        </div>
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-10 w-80 rounded-full" />
          <ShimmerBlock className="h-9 w-44 rounded-full" />
          <ShimmerBlock className="h-9 w-32 rounded-full" />
        </div>
        <ShimmerBlock className="mt-3 h-[65vh] w-full" />
      </div>
    </main>
  );
}

export function ManagerFeeOverviewShimmer() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 lg:pb-5">
        <ShimmerBlock className="mb-3 h-8 w-52 rounded-full" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <section key={index} className="rounded-lg bg-white p-4 shadow-sm">
              <ShimmerBlock className="mb-4 h-5 w-56" />
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, headerIndex) => (
                    <ShimmerBlock key={headerIndex} className="h-4 w-full" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, columnIndex) => (
                      <ShimmerBlock
                        key={columnIndex}
                        className="h-3 w-full"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export function MonthlyFeeCollectionShimmer() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] md:pb-7 lg:pb-5">
      <div className="w-full p-2 pb-7 lg:pb-5">
        <div className="mb-4 flex items-center gap-3">
          <ShimmerBlock className="h-8 w-8 rounded-full" />
          <ShimmerBlock className="h-7 w-64" />
        </div>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <ShimmerBlock className="h-5 w-48" />
            <ShimmerBlock className="h-8 w-72" />
          </div>
          <ShimmerBlock className="h-72 w-full" />
          <div className="mt-4 grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ShimmerBlock key={index} className="h-28 w-full" />
            ))}
          </div>
        </section>

        <ShimmerBlock className="mt-5 h-6 w-48" />
        <ShimmerBlock className="mt-3 h-72 w-full" />
      </div>
    </main>
  );
}
