export const DetailHeaderSkeleton = () => (
  <section className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 shrink-0">
          {index === 0 && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 shrink-0" />
          )}
          <div className="h-4 w-12 md:w-16 animate-pulse rounded bg-gray-100 shrink-0" />
          <div className="h-6 md:h-7 w-16 md:w-20 animate-pulse rounded-full bg-[#E8F6E2] shrink-0" />
        </div>
      ))}
    </div>
    <article className="hidden lg:flex justify-end shrink-0">
      <div className="h-[88px] w-[320px] animate-pulse rounded-[24px] bg-white shadow-sm" />
    </article>
  </section>
);

export const StudentProfileCardSkeleton = () => (
  <div className="h-full rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm">
    <div className="flex items-start md:items-center justify-between gap-2">
      <div className="flex items-center gap-3 md:gap-6">
        <div className="h-12 w-12 md:h-16 md:w-16 animate-pulse rounded-full bg-gray-200 shrink-0" />
        <div>
          <div className="mb-2 h-5 md:h-7 w-24 md:w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-4 md:h-6 w-12 md:w-14 animate-pulse rounded-full bg-[#E8F6E2]" />
        </div>
      </div>
      <div className="h-5 md:h-6 w-20 md:w-36 animate-pulse rounded-full bg-[#E8F6E2]" />
    </div>
    <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index}>
          <div className="mb-2 h-3 md:h-4 w-12 md:w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-4 md:h-6 w-full max-w-[120px] animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
    <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-gray-50 p-2 md:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 md:gap-3">
            <div className="h-6 w-6 md:h-10 md:w-10 animate-pulse rounded-md md:rounded-lg bg-gray-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 md:mb-2 h-3 md:h-5 w-10 md:w-14 animate-pulse rounded bg-gray-200" />
              <div className="h-2 md:h-4 w-16 md:w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ParentsCardSkeleton = () => (
  <div className="h-full rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm">
    <div className="mb-4 md:mb-6 h-6 md:h-7 w-40 md:w-48 animate-pulse rounded bg-gray-200" />
    <div className="space-y-3 md:space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-2.5 md:p-3"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-14 md:w-14 animate-pulse rounded-full bg-gray-200 shrink-0" />
            <div>
              <div className="mb-1.5 md:mb-2 h-4 md:h-5 w-24 md:w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 md:h-4 w-16 md:w-20 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-10 w-10 md:h-14 md:w-14 animate-pulse rounded-full bg-[#A1D683]/50 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export const AcademicPerformanceSkeleton = () => (
  <div className="rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm flex flex-col h-full">
    <div className="mb-4 md:mb-6 h-6 md:h-7 w-40 md:w-48 animate-pulse rounded bg-gray-200 shrink-0" />
    <div className="rounded-xl md:rounded-[20px] bg-gray-50 p-4 md:p-6 flex-1 min-h-[200px]">
      <div className="flex h-full items-end justify-between gap-2 md:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-2 md:gap-3 h-full justify-end"
          >
            <div
              className="w-full max-w-[40px] animate-pulse rounded-t-lg md:rounded-[18px] bg-[#E8F6E2]"
              style={{ height: `${20 + ((index % 4) + 1) * 20}%` }}
            />
            <div className="h-3 md:h-4 w-8 md:w-16 animate-pulse rounded bg-gray-100 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AttendanceSummarySkeleton = () => (
  <div className="h-full rounded-2xl md:rounded-xl bg-white p-4 md:p-6 shadow-sm flex flex-col items-center justify-center">
    <div className="mb-4 h-5 md:h-6 w-40 md:w-44 animate-pulse rounded bg-gray-200 self-start shrink-0" />
    <div className="relative mx-auto h-[130px] w-[200px] md:h-[160px] md:w-[260px]">
      <div className="absolute left-1/2 top-0 h-[100px] w-[200px] md:h-[130px] md:w-[260px] -translate-x-1/2 overflow-hidden">
        <div className="h-[200px] w-[200px] md:h-[260px] md:w-[260px] animate-pulse rounded-full border-[18px] md:border-[22px] border-[#E8F6E2]" />
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
        <div className="mb-2 h-6 md:h-8 w-16 md:w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-5 md:h-7 w-28 md:w-36 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-4 flex items-center justify-center gap-6 md:gap-10">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 md:gap-3">
          <div className="h-3 w-3 md:h-4 md:w-4 animate-pulse rounded-full bg-[#E8F6E2]" />
          <div className="h-4 md:h-5 w-12 md:w-16 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

export const AssignmentsTableSkeleton = () => (
  <div className="rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm overflow-hidden h-full">
    <div className="mb-4 md:mb-6 h-6 md:h-7 w-32 animate-pulse rounded bg-gray-200" />
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] space-y-3 md:space-y-4">
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr] gap-4 md:gap-6 px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-3 md:h-4 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr] gap-4 md:gap-6 border-t border-gray-50 px-4 py-3 md:py-4"
          >
            <div className="h-4 md:h-5 animate-pulse rounded bg-gray-200" />
            <div className="h-4 md:h-5 animate-pulse rounded bg-gray-100" />
            <div className="h-4 md:h-5 animate-pulse rounded bg-gray-100" />
            <div className="ml-auto h-4 md:h-5 w-16 md:w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GradesTableSkeleton = () => (
  <div className="rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm overflow-hidden h-full">
    <div className="mb-4 md:mb-6 h-6 md:h-7 w-20 md:w-24 animate-pulse rounded bg-gray-200" />
    <div className="w-full overflow-x-auto">
      <div className="min-w-[300px] space-y-3 md:space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.4fr_0.6fr_1fr] gap-3 md:gap-4 border-b border-gray-50 pb-3 md:pb-4"
          >
            <div className="h-4 md:h-5 animate-pulse rounded bg-gray-100" />
            <div className="h-4 md:h-5 w-8 md:w-10 animate-pulse rounded bg-gray-200" />
            <div className="ml-auto h-4 md:h-5 w-16 md:w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const StudentProgressDetailsSkeleton = () => (
  <div className="relative min-h-screen bg-[#F5F7FA] p-3 md:p-6 font-sans">
    <DetailHeaderSkeleton />
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3 min-w-0">
            <StudentProfileCardSkeleton />
          </div>
          <div className="h-full lg:col-span-2 min-w-0">
            <ParentsCardSkeleton />
          </div>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3 min-w-0">
            <AcademicPerformanceSkeleton />
          </div>
          <div className="h-full lg:col-span-2 min-w-0">
            <AttendanceSummarySkeleton />
          </div>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-5">
          <div className="h-full lg:col-span-3 min-w-0">
            <AssignmentsTableSkeleton />
          </div>
          <div className="h-full lg:col-span-2 min-w-0">
            <GradesTableSkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ShimmerBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-[#EEF2F6] ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

export const StudentProgressTableSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl">
    <div className="mb-2 flex items-center justify-between gap-4">
      <ShimmerBlock className="h-7 w-48 md:w-56 rounded-md" />
    </div>

    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] lg:min-w-full">
          <div className="sticky top-0 z-10 flex items-center gap-4 bg-[#F1F3F2] px-4 py-4">
            <ShimmerBlock className="h-10 w-10 rounded-full bg-[#DDEFE4] shrink-0" />
            {Array.from({ length: 8 }).map((_, index) => (
              <ShimmerBlock
                key={index}
                className={`h-4 rounded-md shrink-0 ${index % 2 === 0 ? "w-20" : "w-24"}`}
              />
            ))}
          </div>

          <div className="divide-y divide-gray-100 bg-white">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[48px_1fr_1.2fr_0.9fr_1.1fr_0.8fr_1fr_0.9fr_0.7fr] items-center gap-4 px-4 py-3"
              >
                <ShimmerBlock className="h-8 w-8 rounded-full" />
                <ShimmerBlock className="h-4 w-20 md:w-24 rounded-md" />
                <ShimmerBlock className="h-4 w-24 md:w-28 rounded-md" />
                <ShimmerBlock className="h-4 w-10 rounded-md" />
                <ShimmerBlock className="h-4 w-14 rounded-md" />
                <ShimmerBlock className="h-4 w-12 rounded-md" />
                <ShimmerBlock className="h-4 w-14 rounded-md" />
                <ShimmerBlock className="h-10 w-10 rounded-full" />
                <ShimmerBlock className="h-4 w-10 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TopPerformersSkeleton = () => (
  <div className="rounded-[24px] bg-white p-4 md:p-6 shadow-sm h-full flex flex-col">
    <ShimmerBlock className="mb-6 h-7 w-36 rounded-md" />
    <div className="space-y-4 flex-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <ShimmerBlock className="h-10 w-10 md:h-11 md:w-11 rounded-full shrink-0" />
          <div className="min-w-0 flex-1">
            <ShimmerBlock className="mb-2 h-4 w-24 rounded-md" />
            <ShimmerBlock className="h-3 w-14 rounded-md" />
          </div>
          <ShimmerBlock className="h-6 w-10 md:h-8 md:w-12 rounded-full bg-[#DDEFE4] shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export const TrendChartSkeleton = () => (
  <div className="rounded-[24px] bg-white p-4 md:p-6 shadow-sm h-full flex flex-col">
    <ShimmerBlock className="mb-6 md:mb-8 h-7 md:h-8 w-44 rounded-md" />
    <div className="flex flex-1 min-h-[250px] md:min-h-[360px] items-end gap-2 md:gap-4">
      <div className="flex h-full flex-col justify-between pb-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <ShimmerBlock
            key={index}
            className="h-3 w-6 md:h-4 md:w-10 rounded-md shrink-0"
          />
        ))}
      </div>
      <div className="flex flex-1 items-end justify-between gap-1.5 md:gap-4 h-full pt-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-2 md:gap-3 h-full justify-end"
          >
            <div
              className="relative w-full max-w-[54px] overflow-hidden rounded-t-xl md:rounded-[24px] bg-[#E8F6E2]"
              style={{ height: `${20 + ((index % 5) + 1) * 15}%` }}
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
            </div>
            <ShimmerBlock className="h-3 w-6 md:h-4 md:w-8 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const StudentProgressPageSkeleton = () => (
  <main className="relative overflow-hidden p-3 md:p-4">
    <section className="mb-4 flex items-center justify-between">
      <div>
        <ShimmerBlock className="mb-2 h-6 md:h-7 w-40 md:w-48 rounded-md" />
        <ShimmerBlock className="h-3 md:h-4 w-52 md:w-64 rounded-md" />
      </div>

      <article className="hidden lg:flex w-[32%] justify-end">
        <ShimmerBlock className="h-[88px] w-[320px] rounded-[24px] bg-white shadow-sm" />
      </article>
    </section>

    <div className="mb-4 md:mb-5 w-full max-w-5xl overflow-hidden">
      <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 shrink-0">
            <ShimmerBlock className="h-4 w-12 md:w-16 rounded-md" />
            <ShimmerBlock className="h-6 md:h-7 w-16 md:w-20 rounded-full bg-[#E8F6E2]" />
          </div>
        ))}
      </div>
    </div>

    <article className="mb-4 grid items-start gap-2 lg:gap-4 lg:grid-cols-[68%_32%]">
      <div className="grid grid-cols-3 gap-2 lg:gap-3 w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <ShimmerBlock
            key={index}
            className="h-[100px] lg:h-[130px] w-full rounded-xl lg:rounded-[12px] bg-white shadow-sm"
          />
        ))}
      </div>
      <ShimmerBlock className="hidden lg:block -mt-5 h-[210px] rounded-[24px] bg-white shadow-sm" />
    </article>

    <section>
      <StudentProgressTableSkeleton />
      <div className="mt-4 md:mt-5 grid gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)] items-stretch">
        <TopPerformersSkeleton />
        <TrendChartSkeleton />
      </div>
    </section>
  </main>
);
