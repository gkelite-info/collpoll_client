'use client';

export default function TimetableCardShimmer({ count = 6 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="h-[102px] w-full flex justify-between animate-pulse"
                >
                    <div className="w-[88px] flex flex-col items-center justify-center">
                        <div className="h-3 w-14 bg-gray-200 rounded-sm mb-2.5"></div>
                        <div className="h-[2px] w-2 bg-gray-200 rounded-sm mb-2.5"></div>
                        <div className="h-3 w-14 bg-gray-200 rounded-sm"></div>
                    </div>

                    <div className="bg-[#16284F]/40 w-[527px] rounded-xl flex justify-end">
                        <div className="w-[98%] h-full bg-[#E8E9ED] gap-3 rounded-r-lg flex items-center px-2">
                            <div className="h-[84px] w-[84px] rounded-lg bg-gray-300 shrink-0"></div>
                            <div className="h-[84px] w-[408px] gap-2 flex items-center justify-between">
                                <div className="flex flex-col justify-center gap-2 h-full w-[90%]">
                                    <div className="h-4 w-48 bg-gray-300 rounded-md"></div>
                                    <div className="h-3 w-32 bg-gray-300 rounded-md mt-1"></div>
                                    <div className="flex gap-4 mt-1">
                                        <div className="h-3 w-16 bg-gray-300 rounded-md"></div>
                                        <div className="h-3 w-24 bg-gray-300 rounded-md"></div>
                                    </div>
                                </div>
                                {/* <div className="bg-gray-300 rounded-full h-[40px] w-[40px] shrink-0"></div> */}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}