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
        <ShimmerBlock className="h-[150px] w-full bg-[#DDF3E7]" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <ShimmerBlock className="h-8 w-[140px]" />
            <ShimmerBlock className="h-8 w-[120px]" />
          </div>
          <div className="flex gap-2">
            <ShimmerBlock className="h-8 w-[125px] rounded-full" />
            <ShimmerBlock className="h-8 w-[105px] rounded-full" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <ShimmerBlock key={item} className="h-[100px]" />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <ShimmerBlock className="h-[250px]" />
          <ShimmerBlock className="h-[250px]" />
        </div>
        <ShimmerBlock className="mt-3 h-[210px]" />
        <ShimmerBlock className="mt-3 h-[310px]" />
      </div>
      <aside className="hidden w-[32%] flex-col p-2 pr-0 md:flex lg:w-[32%]">
        <ShimmerBlock className="h-[54px]" />
        <ShimmerBlock className="mt-5 h-[170px]" />
        <ShimmerBlock className="mt-5 h-[520px]" />
      </aside>
    </main>
  );
}
