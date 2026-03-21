export const ProfileShimmer = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="flex justify-between items-center mb-10">
        <div className="w-20 h-7 bg-gray-200 rounded" />
        <div className="w-20 h-9 bg-gray-200 rounded-md" />
      </div>

      <div className="flex flex-col md:flex-row gap-10 md:gap-16 md:items-center">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-40 h-40 rounded-full bg-gray-200" />
          <div className="mt-6 w-36 h-10 bg-gray-200 rounded-md" />
        </div>

        <div className="flex-1 w-full">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="flex flex-col space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-3/4 sm:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};