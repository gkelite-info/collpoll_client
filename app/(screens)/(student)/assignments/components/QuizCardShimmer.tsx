export const QuizCardShimmer = () => {
  return (
    <div className="flex items-stretch justify-between p-3.5 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-4 border border-gray-100 animate-pulse">
      <div className="flex flex-col md:flex-row items-stretch gap-5 h-full w-full">
        {/* Quiz image placeholder */}
        <div className="rounded-lg bg-gray-300 overflow-hidden relative flex-shrink-0 w-full h-32 md:w-24 md:h-24" />

        <div className="flex flex-col justify-between h-full w-full gap-4 md:gap-0">
          {/* Course name and topic */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="flex flex-col gap-2 w-full">
              <div className="h-6 bg-gray-300 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
            {/* Start Quiz button */}
            <div className="h-9 bg-gray-300 rounded-md w-full md:w-24 flex-shrink-0" />
          </div>

          {/* Quiz details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-gray-200 rounded-full p-1 flex-shrink-0">
                  <div className="w-4 h-4 bg-gray-300 rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuizCardSkeletonGroup = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <QuizCardShimmer key={i} />
      ))}
    </>
  );
};
