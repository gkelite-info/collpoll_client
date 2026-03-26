export function AdminDiscussionShimmer() {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-2/3">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
                </div>
            </div>

            <div className="grid grid-cols-[1.3fr_1.5fr] gap-6 pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="flex gap-2">
                        <div className="w-24 h-8 bg-gray-100 rounded-md"></div>
                        <div className="w-24 h-8 bg-gray-100 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}