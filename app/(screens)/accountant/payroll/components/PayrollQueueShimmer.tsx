const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[#e8ebf0] ${className}`} />
);

export default function PayrollQueueShimmer() {
  return (
    <div className="pb-8" aria-label="Loading salary payment records" role="status">
      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={index} className="rounded-2xl border border-[#e4e7eb] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full">
                <Shimmer className="h-3 w-28" />
                <Shimmer className="mt-4 h-7 w-40" />
                <Shimmer className="mt-3 h-3 w-36" />
              </div>
              <Shimmer className="h-11 w-11 shrink-0 rounded-xl" />
            </div>
          </article>
        ))}
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e5e9] bg-white">
        <div className="border-b border-[#edf0f3] p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <Shimmer className="h-5 w-48" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Shimmer className="h-10 w-full sm:w-40" />
              <Shimmer className="h-10 w-full sm:w-64" />
              <Shimmer className="h-10 w-full sm:w-36" />
            </div>
          </div>
          <Shimmer className="mt-4 h-12 w-full rounded-xl" />
        </div>
        <div className="overflow-hidden">
          <div className="grid min-w-[950px] grid-cols-[56px_1.5fr_1fr_1fr_repeat(4,0.8fr)_1fr] gap-4 bg-[#f7f8fc] px-5 py-4">
            {Array.from({ length: 9 }).map((_, index) => <Shimmer key={index} className="h-3 w-16" />)}
          </div>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid min-w-[950px] grid-cols-[56px_1.5fr_1fr_1fr_repeat(4,0.8fr)_1fr] items-center gap-4 border-t border-[#edf0f3] px-5 py-4">
              <Shimmer className="h-4 w-4 rounded" />
              <div className="flex items-center gap-3">
                <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
                <div className="w-full"><Shimmer className="h-3 w-24" /><Shimmer className="mt-2 h-2.5 w-32" /></div>
              </div>
              {Array.from({ length: 6 }).map((_, index) => <Shimmer key={index} className="h-3 w-20" />)}
              <Shimmer className="h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f3] px-5 py-4">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-8 w-52" />
        </div>
      </section>
      <span className="sr-only">Loading payroll records</span>
    </div>
  );
}
