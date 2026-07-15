import { AnalyticsShimmerVariant } from "../shared/types";

function ShimmerLineChart() {
  return (
    <div className="flex h-full w-full flex-col">
      <svg className="flex-1 w-full" viewBox="0 0 800 260" preserveAspectRatio="none">
        {/* Grid lines */}
        {[40, 100, 160, 220].map((y) => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F0F2F5" strokeWidth="1" />
        ))}
        
        {/* Line 1 (Green-ish shimmer) */}
        <path
          d="M 20,220 L 120,220 L 220,205 L 320,205 L 420,185 L 520,190 L 620,220 L 720,220"
          fill="none"
          stroke="#DDE5E1"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {[
          { x: 20, y: 220 }, { x: 120, y: 220 }, { x: 220, y: 205 },
          { x: 320, y: 205 }, { x: 420, y: 185 }, { x: 520, y: 190 },
          { x: 620, y: 220 }, { x: 720, y: 220 },
        ].map((pt, i) => (
          <circle key={`p1-${i}`} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#DDE5E1" strokeWidth="2" />
        ))}

        {/* Line 2 (Red-ish shimmer) */}
        <path
          d="M 20,220 L 120,220 L 220,220 L 320,220 L 420,220 L 520,40 L 620,220 L 720,220"
          fill="none"
          stroke="#E8EBED"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {[
          { x: 20, y: 220 }, { x: 120, y: 220 }, { x: 220, y: 220 },
          { x: 320, y: 220 }, { x: 420, y: 220 }, { x: 520, y: 40 },
          { x: 620, y: 220 }, { x: 720, y: 220 },
        ].map((pt, i) => (
          <circle key={`p2-${i}`} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#E8EBED" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-4 flex w-full justify-between pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-3 w-8 rounded bg-[#E5E8EB]" />
        ))}
      </div>
    </div>
  );
}

function ShimmerBarChart() {
  const chartBars = [42, 65, 50, 78, 56, 88, 60, 72];
  return (
    <div className="flex h-full w-full items-end gap-5">
      {chartBars.map((height, index) => (
        <div
          key={index}
          className="flex-1 rounded-t bg-[#DDE5E1]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function AnalyticsPageShimmer({
  variant = "overview",
}: {
  variant?: AnalyticsShimmerVariant;
}) {
  const statCards = variant === "studentFees" ? 3 : 4;

  return (
    <main
      className="min-h-full w-full bg-[#F4F4F4] px-3 py-4 pb-8"
      aria-label="Loading analytics"
      aria-busy="true"
    >
      <div className="mx-auto flex w-full max-w-[1180px] animate-pulse flex-col gap-4">
        <section className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-64 rounded-lg bg-[#E2E6EA]" />
            <div className="h-4 w-80 max-w-[70vw] rounded bg-[#E7EAED]" />
          </div>
          <div className="h-11 w-36 rounded-xl bg-[#E2E6EA]" />
        </section>

        <section
          className={`grid gap-4 md:grid-cols-2 ${
            statCards === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"
          }`}
        >
          {Array.from({ length: statCards }, (_, index) => (
            <div
              key={index}
              className="flex h-[88px] items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]"
            >
              <div className="h-11 w-11 shrink-0 rounded-lg bg-[#E3E8EC]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-[#E3E8EC]" />
                <div className="h-5 w-32 rounded bg-[#DCE1E5]" />
              </div>
            </div>
          ))}
        </section>

        {variant === "overview" ? (
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div className="h-6 w-56 rounded bg-[#DCE1E5]" />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                    <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-[#E5E8EB]" />
                    <div className="h-4 w-16 rounded bg-[#E5E8EB]" />
                  </div>
                  <div className="h-10 w-32 rounded-xl bg-[#E5E8EB]" />
                </div>
              </div>
              <div className="mt-7 h-[300px] w-full px-5">
                <ShimmerLineChart />
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              <div className="h-5 w-44 rounded bg-[#DCE1E5]" />
              <div className="mx-auto mt-8 h-40 w-40 rounded-full border-[28px] border-[#E1E6E9]" />
              <div className="mt-7 space-y-4">
                {Array.from({ length: 4 }, (_, row) => (
                  <div key={row} className="h-5 rounded bg-[#EEF0F2]" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded bg-[#DCE1E5]" />
              <div className="flex gap-2">
                <div className="h-10 w-[300px] rounded-full bg-[#E5E8EB]" />
                <div className="h-10 w-24 rounded-full bg-[#E5E8EB]" />
              </div>
            </div>
            <div className="mt-7 flex h-[260px] items-end gap-5 px-5">
              <ShimmerBarChart />
            </div>
          </section>
        )}

        {variant === "overview" && (
          <section className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex h-[360px] flex-col rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
                {/* Title */}
                <div className="mb-8 h-6 w-56 rounded bg-[#DCE1E5]" />
                {/* Header Row */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-[#E5E8EB]" />
                  <div className="h-3 w-16 rounded bg-[#E5E8EB]" />
                </div>
                {/* List Items */}
                <div className="flex flex-1 flex-col gap-6 overflow-hidden">
                  {Array.from({ length: 4 }, (_, row) => (
                    <div key={row} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#E5E8EB]" />
                        <div className="space-y-2">
                          <div className="h-4 w-28 rounded bg-[#DCE1E5]" />
                          <div className="h-3 w-20 rounded bg-[#E5E8EB]" />
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-4 w-20 rounded bg-[#DCE1E5]" />
                        <div className="h-3 w-12 ml-auto rounded bg-[#E5E8EB]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {variant !== "overview" && (
          <>
            <section
              className={`grid gap-4 ${
                variant === "revenue"
                  ? "md:grid-cols-2 xl:grid-cols-4"
                  : "sm:grid-cols-2 xl:grid-cols-5"
              }`}
            >
              {Array.from(
                { length: variant === "revenue" ? 4 : 5 },
                (_, index) => (
                  <div key={index} className="h-28 rounded-xl bg-white p-4 shadow-sm">
                    <div className="h-4 w-28 rounded bg-[#DCE1E5]" />
                    <div className="mt-5 h-5 w-20 rounded bg-[#E7EAED]" />
                  </div>
                ),
              )}
            </section>
            <section className="rounded-xl bg-white p-6 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
              <div className="mb-6 h-6 w-56 rounded bg-[#DCE1E5]" />
              <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-3">
                <div className="h-3 w-32 rounded bg-[#DCE1E5]" />
                <div className="h-3 w-40 rounded bg-[#DCE1E5]" />
                <div className="h-3 w-16 rounded bg-[#DCE1E5]" />
                <div className="h-3 w-24 rounded bg-[#DCE1E5]" />
              </div>
              <div className="mt-2 flex flex-col">
                {Array.from({ length: 6 }, (_, row) => (
                  <div key={row} className="flex items-center justify-between border-b border-[#F0F2F5] px-4 py-5 last:border-0">
                    <div className="h-4 w-32 rounded bg-[#E5E8EB]" />
                    <div className="h-4 w-40 rounded bg-[#E5E8EB]" />
                    <div className="h-4 w-20 rounded bg-[#DCE1E5]" />
                    <div className="h-4 w-24 rounded bg-[#E5E8EB]" />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
