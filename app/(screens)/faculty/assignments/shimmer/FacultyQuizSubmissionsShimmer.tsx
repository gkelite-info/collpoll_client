export default function FacultyQuizSubmissionsShimmer() {
    return (
        <div className="bg-white rounded-md px-4 py-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
        </div>
    );
}