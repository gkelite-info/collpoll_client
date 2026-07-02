export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="flex items-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm"
        >
          <div className="p-4 bg-gray-200 rounded-full shadow-sm mr-4 shrink-0 w-16 h-16 animate-pulse"></div>
          <div className="min-w-0 w-full">
            <div className="h-3.5 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentSubmissionsSkeleton() {
  return (
    <div className="w-full divide-y divide-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <div className="h-3.5 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="flex flex-col gap-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-2.5 bg-gray-200 rounded animate-pulse w-1/4"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
            <div className="h-2.5 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
