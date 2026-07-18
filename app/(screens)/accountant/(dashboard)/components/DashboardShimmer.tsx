const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
);

function AnalyticsChartShimmer() {
  const barHeights = [38, 62, 48, 76, 55, 88, 68, 44, 72, 58, 35, 64];

  return (
    <section className="mt-4 rounded-3xl bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
        <div className="flex h-9 w-[280px] animate-pulse items-center justify-around rounded-full bg-slate-100 px-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-3 w-12 rounded bg-slate-200" />
          ))}
        </div>
        <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex h-[70px] animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-100">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="h-5 w-24 rounded bg-slate-300" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex h-[190px] animate-pulse gap-4">
        <div className="flex w-8 flex-col justify-between pb-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-2.5 w-7 rounded bg-slate-200" />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-between gap-2 border-b border-slate-100 px-2 pb-6">
          {barHeights.map((height, index) => (
            <div key={index} className="relative flex h-full flex-1 items-end justify-center">
              <div className="w-3 rounded-t bg-slate-200" style={{ height: `${height}%` }} />
              <div className="absolute -bottom-5 h-2.5 w-5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DashboardShimmer() {
  return (
    <main className="flex min-h-full w-full gap-2 overflow-hidden bg-[#F4F4F4] pb-5">
      <div className="w-full px-2 py-3 md:w-[68%]">
        <Block className="h-[104px] w-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Block key={index} className="h-[74px]" />)}
        </div>
        <AnalyticsChartShimmer />
        <div className="mt-5 h-6 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 grid grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, index) => <Block key={index} className="h-[108px]" />)}
        </div>
      </div>
      <aside className="hidden flex-col gap-4 border-l border-gray-100 p-2 md:flex md:w-[32%]">
        <Block className="h-[154px] w-full" />
        <Block className="h-[380px] w-full" />
      </aside>
    </main>
  );
}
