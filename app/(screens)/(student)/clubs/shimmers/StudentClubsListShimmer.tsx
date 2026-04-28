"use client";

export default function StudentClubsListShimmer() {
    return (
        <div className="flex flex-col w-full min-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-16 content-start flex-1 mb-16 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="bg-[#FB8000]/10 rounded-2xl flex flex-col items-center px-5 pb-5 pt-[70px] relative animate-pulse h-full min-h-[260px]">
                        <div className="absolute -top-[60px] w-[140px] h-[140px] rounded-full bg-gray-200 border-4 border-white shadow-md"></div>
                        <div className="h-6 bg-gray-300 rounded w-2/3 mb-4 mt-8"></div>
                        <div className="flex gap-3 w-full mb-6 mt-auto">
                            <div className="flex-1 h-[34px] bg-[#43C17A]/20 rounded-md"></div>
                            <div className="flex-1 h-[34px] bg-[#FF2A2A]/20 rounded-md"></div>
                        </div>
                        <div className="w-full h-[48px] bg-[#16284F] opacity-20 rounded-xl mt-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}