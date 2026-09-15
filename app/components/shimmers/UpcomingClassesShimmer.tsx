"use client";

export default function UpcomingClassesShimmer() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-1 mb-2 max-md:gap-3">
          <div className="w-[20%] max-md:w-[22%] flex flex-col items-center justify-center max-md:justify-start gap-1">
            <div className="h-2.5 w-10 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-2.5 w-10 bg-slate-200 animate-pulse rounded"></div>
          </div>

          <div className="w-[80%] max-md:w-[78%] flex justify-end bg-slate-200 max-md:bg-white rounded-md rounded-r-lg max-md:justify-start max-md:border-l-4 max-md:border-slate-200 max-md:shadow-sm">
            <div className="bg-slate-100 w-[98%] rounded-r-md flex flex-col justify-between gap-1 px-2 py-2 max-md:w-full max-md:px-3 max-md:py-2.5 max-md:gap-1.5">
              <div className="flex justify-between items-center max-md:justify-start max-md:gap-2">
                <div className="h-3.5 w-28 bg-slate-200 animate-pulse rounded"></div>
                <div className="h-2.5 w-16 bg-slate-200 animate-pulse rounded"></div>
              </div>
              <div className="h-2.5 w-40 bg-slate-200 animate-pulse rounded mt-1"></div>
              <div className="h-2.5 w-24 bg-slate-200 animate-pulse rounded hidden md:block"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
