export const StudentDiscussionCardShimmer = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 animate-pulse">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
        <div className="flex flex-col gap-2 w-full md:w-[80%]">
          {/* Title */}
          <div className="h-6 bg-gray-300 rounded w-3/4" />
          {/* Description lines */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
        {/* Upload button */}
        <div className="h-9 bg-gray-300 rounded-md w-full md:w-24 flex-shrink-0" />
      </div>

      {/* Details section */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4 md:gap-6 mt-1">
        {/* Left column - Faculty, dates */}
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-gray-200 rounded-full p-1 flex-shrink-0">
                <div className="w-4 h-4 bg-gray-300 rounded-full" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-300 rounded w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Right column - Attachments */}
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="flex gap-2 flex-wrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-md flex-shrink-0 w-32" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 mt-2" />
          <div className="flex gap-2 flex-wrap">
            {[...Array(1)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-md flex-shrink-0 w-32" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentDiscussionCardSkeletonGroup = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <StudentDiscussionCardShimmer key={i} />
      ))}
    </>
  );
};
