"use client";

export default function TimetableCardShimmer({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          <div className="hidden lg:flex h-[102px] w-full justify-between animate-pulse">
            <div className="w-[88px] shrink-0 flex flex-col items-center justify-center">
              <div className="h-3 w-14 bg-gray-200 rounded-sm mb-2.5"></div>
              <div className="h-[2px] w-2 bg-gray-200 rounded-sm mb-2.5"></div>
              <div className="h-3 w-14 bg-gray-200 rounded-sm"></div>
            </div>

            <div className="bg-[#16284F]/40 flex-1 rounded-xl flex justify-end ml-2">
              <div className="w-[98%] h-full bg-[#E8E9ED] gap-3 rounded-r-lg flex items-center px-2">
                <div className="h-[84px] w-[84px] rounded-lg bg-gray-300 shrink-0"></div>
                <div className="h-[84px] flex-1 min-w-0 gap-2 flex items-center justify-between">
                  <div className="flex flex-col justify-center gap-2 h-full w-[90%]">
                    <div className="h-4 w-48 bg-gray-300 rounded-md"></div>
                    <div className="h-3 w-32 bg-gray-300 rounded-md mt-1"></div>
                    <div className="flex gap-4 mt-1">
                      <div className="h-3 w-16 bg-gray-300 rounded-md"></div>
                      <div className="h-3 w-24 bg-gray-300 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden w-full bg-white rounded-xl p-3 md:p-4 flex gap-3 md:gap-4 relative shadow-sm border border-gray-100 animate-pulse">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-gray-200 shrink-0"></div>
            <div className="flex flex-col grow min-w-0 pr-8 md:pr-12 gap-2 mt-1">
              <div className="h-3.5 md:h-4 w-3/4 bg-gray-200 rounded-md"></div>
              <div className="h-2 md:h-3 w-1/2 bg-gray-200 rounded-md"></div>
              <div className="h-2 md:h-3 w-full bg-gray-200 rounded-md mt-1"></div>
              <div className="h-2 md:h-3 w-2/3 bg-gray-200 rounded-md"></div>
            </div>
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 rounded-full h-7 w-7 md:h-10 md:w-10 bg-gray-200"></div>
          </div>
        </div>
      ))}
    </>
  );
}
