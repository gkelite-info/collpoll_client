export function DiscussionDeptCardSkeleton() {
    return (
        <div className="bg-white rounded-[10px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border-l-[8px] border-gray-200 flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="flex -space-x-2.5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-6 w-8 bg-gray-100 rounded-full"></div>
            </div>

            <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-7 w-24 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    );
}