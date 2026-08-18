export const AcademicPerformanceSkeleton = () => (
  <div className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-lg bg-white p-5 shadow-sm animate-pulse">
    <div className="h-6 w-56 bg-gray-200 rounded mb-6"></div>
    <div className="flex-1 flex items-end justify-around w-full mt-4 border-b border-gray-200 pb-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-12 bg-gray-100 rounded-t-sm" style={{ height: `${20 + i * 15}%` }}></div>
          <div className="h-3 w-10 bg-gray-200 rounded mt-2"></div>
        </div>
      ))}
    </div>
  </div>
);
