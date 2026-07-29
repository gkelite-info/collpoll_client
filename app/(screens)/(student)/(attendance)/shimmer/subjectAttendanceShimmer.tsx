import Skeleton from "@/app/utils/skeleton";
import { TableSkeleton } from "./attendanceDashSkeleton";

export default function SubjectAttendanceShimmer() {
  return (
    <div className="flex w-full flex-col pb-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-[88px] w-[320px] rounded-xl max-md:hidden" />
      </div>

      <div className="mt-4 flex h-[170px] w-full items-start gap-3">
        <Skeleton className="h-32 w-44 shrink-0 rounded-xl" />
        <Skeleton className="h-32 w-44 shrink-0 rounded-xl" />
        <Skeleton className="h-32 min-w-[16rem] flex-1 rounded-xl" />
        <Skeleton className="h-[170px] w-[345px] shrink-0 rounded-xl max-md:hidden" />
      </div>

      <Skeleton className="my-2 h-[90px] w-[69.5%] rounded-xl max-md:w-full" />

      <div className="mt-4 space-y-3">
        <Skeleton className="h-6 w-60 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md max-md:hidden" />
        <TableSkeleton />
      </div>
    </div>
  );
}
