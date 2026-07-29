import Skeleton from "@/app/utils/skeleton";

export default function MainAttendanceShimmer() {
  return (
    <div className="grid w-[90%] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] gap-4 max-md:w-full max-md:grid-cols-2 max-md:gap-3">
      <Skeleton className="h-32 w-full rounded-xl max-md:h-[76px]" />
      <Skeleton className="h-32 w-full rounded-xl max-md:h-[76px]" />
      <Skeleton className="h-32 w-full rounded-xl max-md:col-span-2" />
    </div>
  );
}

export function AttendanceInsightShimmer() {
  return (
    <div className="h-[360px] w-full animate-pulse rounded-xl bg-white p-5 shadow-sm">
      <Skeleton className="h-7 w-48 rounded-md" />
      <div className="mt-8 flex h-[260px] items-end gap-4 border-b border-l border-gray-100 px-4 pb-3">
        {[42, 68, 54, 82, 62, 74, 48].map((height, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-md"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
