export default function FacultyQuizShimmer() {
    return (
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-3 animate-pulse">
            <div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded-md w-1/2" />
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex items-center gap-4">
                    <div className="h-3 bg-gray-200 rounded-md w-28" />
                    <div className="h-5 bg-gray-200 rounded-md w-24" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-3 bg-gray-200 rounded-md w-28" />
                    <div className="h-3 bg-gray-200 rounded-md w-10" />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-3 bg-gray-200 rounded-md w-28" />
                        <div className="h-3 bg-gray-200 rounded-md w-10" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded-md w-24" />
                </div>
            </div>
        </div>
    );
}