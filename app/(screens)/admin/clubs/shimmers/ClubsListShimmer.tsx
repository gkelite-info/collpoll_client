"use client";

export default function ClubsListShimmer() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-20 content-start w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#FB800024] rounded-xl flex flex-col items-center px-5 pb-5 pt-[65px] relative h-[250px] animate-pulse">
                    <div className="absolute -top-[55px] w-[150px] h-[150px] rounded-full bg-gray-200 border-4 border-white shadow-sm"></div>

                    <div className="h-12 bg-gray-300 rounded w-3/4 mb-4 mt-10"></div>

                    <div className="flex flex-col md:flex-row gap-3 w-full mb-3 mt-auto">
                        <div className="flex-1 h-8 bg-[#43C17A2E] rounded-md"></div>
                        <div className="flex-1 h-8 bg-[#FF2A2A2E] rounded-md"></div>
                    </div>

                    <div className="flex w-full gap-3 mt-auto">
                        <div className="flex-1 h-[45px] bg-[#16284F] opacity-20 rounded-lg"></div>
                        <div className="w-[45px] h-[45px] shrink-0 bg-[#43C17A] opacity-20 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}