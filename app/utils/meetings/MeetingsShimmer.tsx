export default function MeetingsShimmer() {

    const gridHours = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM

    const shimmerDays = [0, 1, 2, 3, 4, 5, 6];

    return (
        <>
        <div className="w-full flex flex-col h-[calc(100vh-40px)] min-h-[850px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative mb-5 shrink-0 animate-pulse">

            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white z-40 relative shadow-sm">
                
                <div className="flex items-center justify-between w-full xl:w-auto gap-2 sm:gap-4">
                    <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-lg hidden sm:block"></div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full xl:w-auto">
                    <div className="h-10 w-full sm:w-[280px] bg-gray-200 rounded-xl"></div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 w-[115px] sm:w-[130px] bg-gray-200 rounded-lg"></div>
                        <div className="h-10 flex-1 sm:w-32 bg-emerald-200 rounded-lg"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative bg-white">
                <div className="min-w-[800px] flex flex-col relative w-full">

                    <div className="flex border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm pr-4">
                        <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white"></div>
                        <div className="flex-1 grid grid-cols-7">
                            {shimmerDays.map(day => (
                                <div key={day} className="pt-3 pb-6 border-r border-gray-200 flex flex-col items-center justify-center relative bg-white">
                                    <div className="h-3 w-8 bg-gray-200 rounded-full mb-1"></div>
                                    <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 relative bg-white pr-4 pb-4">

                        <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white relative z-20 sticky left-0">
                            {gridHours.map(hour => (
                                <div key={hour} className="h-[160px] relative">
                                    <div className="absolute -top-2 right-2 h-3 w-8 bg-gray-200 rounded-sm"></div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 grid grid-cols-7 relative overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none z-0">
                                {gridHours.map((_, i) => (
                                    <div key={i} className="h-[160px] border-b border-gray-100 w-full"></div>
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
        </div>
        {/* Spacer to guarantee scroll padding at the bottom of the page */}
        <div className="h-8 shrink-0 w-full"></div>
        </>
    );
}
