"use client";

export default function SubjectSkeleton() {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <div className="w-full flex flex-wrap gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg w-full min-h-[230px] p-4 flex flex-col justify-between shadow-md border border-gray-100"
          >
            <div className="flex flex-col justify-start gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse" />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                  <div className="h-[30px] w-[30px] bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col justify-between mt-4 gap-2">
              <div className="w-full h-3 bg-gray-200 rounded-full animate-pulse" />

              <div className="flex justify-between items-center mt-1">
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
