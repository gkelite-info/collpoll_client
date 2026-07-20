export default function MeetingsShimmer() {

    const gridHours = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM

    const shimmerDays = [0, 1, 2, 3, 4, 5, 6];

    return (
        <div className="w-full flex flex-col bg-gray-50/30 rounded-[24px] border border-gray-200 overflow-hidden min-h-[700px] shadow-sm animate-pulse">

            <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between gap-4 bg-white z-20">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="h-11 w-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-11 w-32 bg-gray-200 rounded-xl hidden sm:block"></div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="h-11 w-64 bg-gray-200 rounded-xl hidden md:block"></div>
                    <div className="h-11 w-40 bg-[#43C17A]/30 rounded-xl ml-auto lg:ml-0"></div>
                </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden relative bg-white">

                <div className="flex border-b border-gray-200 bg-gray-50/50 sticky top-0 z-30">
                    <div className="w-[60px] flex-shrink-0 border-r border-gray-200"></div>
                    <div className="flex-1 grid grid-cols-7">
                        {shimmerDays.map(day => (
                            <div key={day} className="px-2 py-3 border-r border-gray-200 flex flex-col items-center justify-center gap-1">
                                <div className="h-3 w-8 bg-gray-200 rounded-full"></div>
                                <div className="h-6 w-6 bg-gray-300 rounded-full mt-1"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-1 relative bg-white overflow-hidden">

                    <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white relative z-20">
                        {gridHours.map(hour => (
                            <div key={hour} className="h-[60px] relative">
                                <div className="absolute -top-2 right-2 h-3 w-8 bg-gray-200 rounded-sm"></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 relative overflow-hidden">

                        <div className="absolute inset-0 pointer-events-none z-0">
                            {gridHours.map((_, i) => (
                                <div key={i} className="h-[60px] border-b border-gray-100 w-full"></div>
                            ))}
                        </div>

                        {shimmerDays.map((day) => (
                            <div key={day} className="relative border-r border-gray-200 z-10">

                                {day === 1 && (
                                    <div className="absolute top-[80px] left-1 right-1 h-[90px] rounded-md border-l-[3px] border-[#43C17A] bg-[#43C17A]/10 p-2 z-20">
                                        <div className="h-3 w-3/4 bg-[#43C17A]/30 rounded-sm mb-2"></div>
                                        <div className="h-2 w-1/2 bg-[#43C17A]/20 rounded-sm"></div>
                                    </div>
                                )}

                                {day === 3 && (
                                    <div className="absolute top-[200px] left-1 right-1 h-[60px] rounded-md border-l-[3px] border-blue-400 bg-blue-50 p-2 z-20">
                                        <div className="h-3 w-5/6 bg-blue-200 rounded-sm mb-2"></div>
                                        <div className="h-2 w-1/3 bg-blue-100 rounded-sm"></div>
                                    </div>
                                )}

                                {day === 4 && (
                                    <div className="absolute top-[120px] left-1 right-1 h-[120px] rounded-md border-l-[3px] border-amber-400 bg-amber-50 p-2 z-20">
                                        <div className="h-3 w-full bg-amber-200 rounded-sm mb-2"></div>
                                        <div className="h-2 w-1/2 bg-amber-100 rounded-sm"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
