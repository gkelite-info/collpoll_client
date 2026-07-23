export function FilterBarSkeleton() {
    return (
        <div className="flex gap-4 mt-4 animate-pulse">
            {/* Education filter skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-[120px] bg-gray-200 rounded-full" />
            </div>

            {/* Branch filter skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-4 w-14 bg-gray-200 rounded" />
                <div className="h-8 w-[120px] bg-gray-200 rounded-full" />
            </div>

            {/* Year filter skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-4 w-10 bg-gray-200 rounded" />
                <div className="h-8 w-[120px] bg-gray-200 rounded-full" />
            </div>
        </div>
    );
}
