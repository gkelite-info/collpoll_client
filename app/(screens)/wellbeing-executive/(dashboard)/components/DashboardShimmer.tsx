import type { CSSProperties } from "react";

function ShimmerBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={style}
    />
  );
}

export default function DashboardShimmer() {
  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden pb-5">
      <div className="w-full p-1 md:w-[68%] md:p-2 lg:w-[68%]">
        <ShimmerBlock className="h-[175px] w-full bg-[#DDF3E7]" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <ShimmerBlock className="h-9 w-[150px]" />
            <ShimmerBlock className="h-9 w-[150px]" />
          </div>
          <div className="flex gap-2">
            <ShimmerBlock className="h-9 w-[135px] rounded-full" />
            <ShimmerBlock className="h-9 w-[115px] rounded-full" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <ShimmerBlock className="h-5 w-28" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <ShimmerBlock key={item} className="h-[78px]" />
              ))}
            </div>
            <ShimmerBlock className="mx-auto mt-6 h-[190px] w-[260px] rounded-full" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <ShimmerBlock className="h-5 w-24" />
              <div className="mt-5 flex h-[215px] items-end gap-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <ShimmerBlock
                    key={item}
                    className="w-10"
                    style={{ height: `${95 - item * 9}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <ShimmerBlock className="h-5 w-44" />
              <div className="mt-4 flex gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex w-[92px] flex-col items-center">
                    <ShimmerBlock className="h-[72px] w-[72px] rounded-full" />
                    <ShimmerBlock className="mt-3 h-4 w-20" />
                    <ShimmerBlock className="mt-2 h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <ShimmerBlock className="h-10 w-56" />
            <ShimmerBlock className="h-8 w-56" />
          </div>
          <ShimmerBlock className="mt-5 h-10 w-full" />
          {[1, 2, 3, 4].map((item) => (
            <ShimmerBlock key={item} className="mt-3 h-12 w-full" />
          ))}
        </div>
      </div>

      <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
        <div className="grid grid-cols-2 gap-3">
          <ShimmerBlock className="h-[54px]" />
          <ShimmerBlock className="h-[54px]" />
        </div>
        <ShimmerBlock className="mt-5 h-[170px]" />
        <ShimmerBlock className="mt-5 h-[420px]" />
      </aside>
    </main>
  );
}
