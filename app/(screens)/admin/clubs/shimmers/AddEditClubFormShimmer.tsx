"use client";

export default function AddEditClubFormShimmer() {
    return (
        <div className="relative max-w-3xl mx-auto pb-4 w-full animate-pulse">
            <div className="absolute -right-4 -top-4 w-10 h-10 bg-gray-200 rounded-full shadow-sm"></div>
            <div className="flex justify-center mb-8 mt-2">
                <div className="w-[152px] h-[152px] rounded-full bg-gray-200 border-4 border-white shadow-md"></div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                    <div className="w-full h-[45px] bg-gray-100 rounded-lg border border-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                        <div className="w-full h-[45px] bg-gray-100 rounded-lg border border-gray-200"></div>
                    </div>
                    <div>
                        <div className="h-4 w-28 bg-gray-200 rounded mb-3"></div>
                        <div className="w-full h-[45px] bg-gray-100 rounded-lg border border-gray-200"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                    <div>
                        <div className="h-4 w-16 bg-gray-200 rounded mb-3"></div>
                        <div className="w-full h-[45px] bg-gray-100 rounded-lg border border-gray-200"></div>
                    </div>
                    <div>
                        <div className="h-4 w-36 bg-gray-200 rounded mb-3"></div>
                        <div className="w-full h-[45px] bg-gray-100 rounded-lg border border-gray-200"></div>
                    </div>
                </div>

                <div className="flex justify-center mt-6 pt-4">
                    <div className="w-[300px] h-[52px] bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}