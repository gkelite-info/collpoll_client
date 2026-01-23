import Skeleton from "@/app/utils/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex w-full h-fit p-2 gap-4">
      <div className="w-[68%] flex flex-col gap-6">
        <div className="mb-2">
          <Skeleton variant="text" className="h-8 w-48 mb-2" />
          <Skeleton variant="text" className="h-4 w-96" />
        </div>

        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-32 flex-1 w-44 rounded-[20px]" />
          <Skeleton className="h-32 flex-1 w-44 rounded-[20px]" />
          <Skeleton className="h-32 flex-2 w-44 rounded-[20px]" />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <Skeleton variant="text" className="h-6 w-40 mb-1" />
            <Skeleton variant="text" className="h-4 w-64" />
          </div>

          <TableSkeleton />
        </div>
      </div>

      {/* --- RIGHT SECTION (32%) --- */}
      <div className="w-[32%] flex flex-col gap-4 p-2">
        {/* Course Schedule Card */}
        <Skeleton className="h-40 w-full rounded-xl" />

        {/* Work Week Calendar */}
        <Skeleton className="h-[170px] w-full rounded-lg" />

        {/* Chart Area */}
        <div className="mt-2">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export const TableSkeleton = () => {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white p-4">
      <div className="flex justify-between mb-4 border-b pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" className="h-4 mr-1 w-20" />
        ))}
      </div>

      {[1, 2, 3, 4, 5].map((row) => (
        <div
          key={row}
          className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
        >
          {/* Status Badge */}
          <Skeleton variant="text" className="h-4 w-32 mr-1" />
          <Skeleton variant="text" className="h-4 w-32 mr-1" />
          <Skeleton variant="text" className="h-4 w-12 mr-1" />
          {/* Count */}
          <Skeleton variant="text" className="h-4 w-12 mr-2" />
          <Skeleton
            variant="circular"
            className="h-6 w-6 mr-1 aspect-square rounded-full"
          />
        </div>
      ))}
    </div>
  );
};
