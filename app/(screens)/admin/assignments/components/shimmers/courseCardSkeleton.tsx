export function DiscussionCourseCardSkeleton() {
    return (
        <div className="bg-white w-full rounded-[10px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col animate-pulse">
            <div className="flex flex-col items-center mb-4 gap-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-px w-full bg-gray-100" />
            </div>

            <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6 px-1">
                <div className="flex gap-2 items-center">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-5 w-8 bg-gray-100 rounded-full" />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-5 w-8 bg-gray-100 rounded-full" />
                </div>
            </div>

            <div className="w-full h-10 bg-gray-200 rounded-full mt-auto" />
        </div>
    );
}