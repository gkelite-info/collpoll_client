import Skeleton from "@/app/utils/skeleton";
import { TableSkeleton } from "./attendanceDashSkeleton";

export default function SubjectAttendanceDetailsShimmer() {
  return (
    <div className="flex w-full flex-col pb-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-[88px] w-[320px] rounded-xl max-md:hidden" />
      </div>

      <div className="mt-4 flex w-full gap-4">
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-2 max-md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32 w-full rounded-xl max-md:h-[76px]"
            />
          ))}
        </div>
        <Skeleton className="h-[170px] w-[360px] shrink-0 rounded-xl max-md:hidden" />
      </div>

      <Skeleton className="my-2 h-[90px] w-[68%] rounded-xl max-md:w-full" />

      <div className="mt-4 space-y-3">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-72 rounded-full max-md:hidden" />
        </div>
        <TableSkeleton />
      </div>
    </div>
  );
}
