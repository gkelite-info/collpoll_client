export default function FacultyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
      <div>
        <div className="flex gap-4 items-center">
          {/* Avatar Skeleton */}
          <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shrink-0"></div>

          {/* Name & ID Skeleton */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="h-5 bg-gray-200 rounded-md animate-pulse w-3/4 mb-1.5"></div>
            <div className="h-3 bg-gray-200 rounded-md animate-pulse w-1/3 mb-2"></div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {/* Branch */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full animate-pulse w-20"></div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 flex-1 max-w-[220px]"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </div>

      <div className="mt-5 bg-gray-200 animate-pulse h-[36px] rounded-full w-[90%] mx-auto"></div>
    </div>
  );
}