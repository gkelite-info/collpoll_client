export default function FacultyDiscussionShimmer() {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-1 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-[70%]">
                    <div className="h-5 bg-gray-200 rounded-md w-[50%]" />
                    <div className="h-3 bg-gray-200 rounded-md w-full" />
                    <div className="h-3 bg-gray-200 rounded-md w-[80%]" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full" />
                    <div className="w-32 h-9 bg-gray-200 rounded-md" />
                </div>
            </div>

            <div className="grid grid-cols-[1.3fr_1.5fr] gap-6 pt-4 border-t border-gray-50 mt-2">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full" />
                        <div className="h-3 bg-gray-200 rounded-md w-[60%]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full" />
                        <div className="h-3 bg-gray-200 rounded-md w-[50%]" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="h-3 bg-gray-200 rounded-md w-[30%]" />
                    <div className="flex gap-2">
                        <div className="h-7 bg-gray-200 rounded-md w-20" />
                        <div className="h-7 bg-gray-200 rounded-md w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}