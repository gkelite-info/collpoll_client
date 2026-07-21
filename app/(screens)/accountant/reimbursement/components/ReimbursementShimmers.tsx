"use client";

const Block = ({ className }: { className: string }) => (
  <div className={`reimbursement-shimmer rounded bg-slate-200 ${className}`} />
);

function ShimmerStyles() {
  return (
    <style jsx global>{`
      .reimbursement-shimmer {
        position: relative;
        overflow: hidden;
      }
      .reimbursement-shimmer::after {
        position: absolute;
        inset: 0;
        content: "";
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.72) 50%,
          transparent 100%
        );
        animation: reimbursement-shimmer-sweep 1.35s ease-in-out infinite;
      }
      @keyframes reimbursement-shimmer-sweep {
        100% {
          transform: translateX(100%);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .reimbursement-shimmer::after {
          animation: none;
        }
      }
    `}</style>
  );
}

export function ReimbursementDashboardShimmer() {
  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 sm:p-5">
      <ShimmerStyles />
      <header className="mb-5 space-y-2">
        <Block className="h-7 w-56" />
        <Block className="h-4 w-72 max-w-full" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={index} className="h-[132px] rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <Block className="h-11 w-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Block className="h-3 w-28" />
                <Block className="h-6 w-20" />
                <Block className="h-3 w-44 max-w-full" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#e2e5e9] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="space-y-2">
            <Block className="h-5 w-32" />
            <Block className="h-3 w-64 max-w-full" />
          </div>
          <Block className="h-9 w-20 rounded-lg" />
        </div>
        <div className="h-12 bg-[#edf3ff] px-7 py-4"><Block className="h-3 w-full bg-slate-300" /></div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid min-w-[1050px] grid-cols-[.25fr_1.25fr_1.1fr_1fr_1.25fr_.8fr_.9fr_.65fr_.65fr] items-center gap-7 border-b border-[#edf0f3] px-7 py-5">
            <Block className="h-4 w-4" />
            <div className="flex items-center gap-3"><Block className="h-9 w-9 shrink-0 rounded-full" /><Block className="h-3 w-24" /></div>
            {Array.from({ length: 6 }).map((__, cell) => <Block key={cell} className="h-3 w-full" />)}
            <Block className="ml-auto h-3 w-20" />
          </div>
        ))}
      </section>
    </main>
  );
}

export function ReimbursementDetailShimmer() {
  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 sm:p-5">
      <ShimmerStyles />
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex gap-3"><Block className="mt-1 h-5 w-5" /><div className="space-y-2"><Block className="h-6 w-44" /><Block className="h-3 w-72 max-w-full" /></div></div>
        <Block className="h-8 w-28 rounded-full" />
      </header>

      <section className="mb-5 grid gap-6 rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="space-y-3"><Block className="h-3 w-24" /><Block className="h-5 w-32 max-w-full" /><Block className="h-3 w-40 max-w-full" /></div>)}
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <SkeletonCard rows={3} tall />
          <SkeletonCard rows={2} />
        </div>
        <aside className="space-y-5">
          <SkeletonCard rows={4} tall />
          <SkeletonCard rows={4} />
        </aside>
      </div>
      <div className="mt-5 flex justify-end gap-3 border-t border-[#dce2e9] pt-4"><Block className="h-10 w-32 rounded-lg" /><Block className="h-10 w-32 rounded-lg" /></div>
    </main>
  );
}

function SkeletonCard({ rows, tall = false }: { rows: number; tall?: boolean }) {
  return (
    <section className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center gap-2"><Block className="h-5 w-5" /><Block className="h-4 w-36" /></div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => <div key={index} className="space-y-2"><Block className="h-3 w-24" /><Block className="h-4 w-full" /></div>)}
      </div>
      {tall && <div className="mt-7 grid grid-cols-3 gap-3"><Block className="h-24 w-full rounded-lg" /><Block className="h-24 w-full rounded-lg" /><Block className="h-24 w-full rounded-lg" /></div>}
    </section>
  );
}
