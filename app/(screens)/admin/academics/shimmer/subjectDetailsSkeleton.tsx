export const SubjectDetailsSkeleton = () => {
  return (
    <div className="w-full px-4 bg-[#F5F5F7] min-h-screen pt-4 pb-10 animate-pulse">
      <div className="flex justify-between items-center mb-5 w-full">
        <div className="flex flex-col w-[50%] gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-64 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-3 ml-5 mt-1">
            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 overflow-hidden mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-[320px] w-[350px] shrink-0 h-full flex flex-col"
          >
            <div className="h-28 bg-gray-300 rounded-t-xl p-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-400 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-gray-400 rounded mb-2"></div>
              <div className="flex justify-between mt-4">
                <div className="h-3 w-20 bg-gray-400 rounded"></div>
                <div className="h-3 w-8 bg-gray-400 rounded"></div>
              </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm p-4 flex-1 border-x border-b border-gray-100 min-h-[300px]">
              <div className="w-full h-3 bg-gray-200 rounded-full mb-6"></div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((t) => (
                  <div
                    key={t}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-5 w-5 bg-gray-200 rounded-full shrink-0"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-6 bg-gray-100 rounded-full shrink-0"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
