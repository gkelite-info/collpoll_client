export default function AccountantReminderLoading() {
  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        {/* Header Shimmer */}
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
        </section>

        {/* Summary Cards Shimmer */}
        <section className="grid gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="flex h-[126px] flex-col justify-center rounded-xl bg-white px-7 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
              <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-lg bg-slate-200" />
              <div className="mt-4 flex h-[26px] items-center">
                <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
            </article>
          ))}
        </section>

        {/* Table Shimmer */}
        <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.08)] flex flex-col h-[500px]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="h-9 min-w-[300px] animate-pulse rounded-md bg-slate-200" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-32 animate-pulse rounded-md bg-slate-200" />
              <div className="h-9 w-32 animate-pulse rounded-md bg-slate-200" />
            </div>
          </div>
          
          <div className="w-full">
            <div className="h-12 w-full animate-pulse bg-slate-200" />
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex h-16 w-full animate-pulse items-center gap-4 border-b border-slate-100 bg-white px-7 py-5">
                 <div className="h-4 w-4 rounded bg-slate-200" />
                 <div className="h-4 w-36 rounded bg-slate-200" />
                 <div className="h-4 w-20 rounded bg-slate-200" />
                 <div className="h-4 w-20 rounded bg-slate-200" />
                 <div className="h-4 w-24 rounded bg-slate-200" />
                 <div className="h-4 w-20 rounded bg-slate-200" />
                 <div className="h-4 w-24 rounded bg-slate-200" />
                 <div className="ml-auto h-4 w-8 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
