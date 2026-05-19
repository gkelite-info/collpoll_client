export default function AttendancePerformanceChartShimmer() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 w-full">
            <div className="h-5 w-60 bg-gray-200 rounded mb-8 animate-pulse" />

            <div className="relative w-full h-[260px] flex">

                <div className="flex flex-col justify-between items-end pr-4 h-[calc(100%-32px)]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`y-${i}`} className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>

                <div className="flex-1 flex flex-col h-full relative">

                    <div className="absolute top-[6px] left-0 w-full h-[calc(100%-38px)] flex flex-col justify-between z-0">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={`grid-${i}`} className="w-full border-t border-gray-100" />
                        ))}
                    </div>

                    <div className="absolute top-[6px] left-0 w-full h-[calc(100%-38px)] z-10 animate-pulse overflow-hidden px-2">
                        <svg
                            className="w-full h-full text-gray-200"
                            viewBox="0 0 1000 300"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M 0 160 L 90 190 L 180 150 L 270 180 L 360 210 L 450 160 L 540 100 L 630 180 L 720 130 L 810 190 L 900 150 L 990 170"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M 0 240 L 90 220 L 180 200 L 270 260 L 360 210 L 450 130 L 540 50 L 630 170 L 720 90 L 810 200 L 900 150 L 990 190"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full flex justify-between items-end z-20">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={`x-${i}`} className="h-3 w-6 sm:w-8 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center gap-6 mt-8">
                <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
            </div>

        </div>
    );
};