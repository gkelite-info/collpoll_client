export function PreviousSchedulesShimmer() {
  return (
    <div className="space-y-2 animate-pulse w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0"></div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>
        </div>
      ))}
    </div>
  );
}
