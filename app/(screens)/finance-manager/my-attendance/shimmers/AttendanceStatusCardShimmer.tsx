const AttendanceStatusCardShimmer = () => {

    return (
        <div className="bg-white overflow-auto rounded-xl p-4 w-[30%] shadow-sm flex flex-col justify-between border border-gray-100/50 animate-pulse text-[12.5px] min-h-[175px]">

            <div>
                <div className="h-3.5 w-36 bg-gray-200 rounded mb-2" />
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-4 h-4 rounded bg-gray-200" />
                    <div className="h-3.5 w-16 bg-gray-200 rounded" />
                </div>
            </div>

            <div className="mb-1.5">
                <div className="h-3.5 w-28 bg-gray-200 rounded mb-1.5" />
                <div className="h-3.5 w-8 bg-gray-200 rounded" />
            </div>

            <div className="mb-1.5">
                <div className="h-3.5 w-20 bg-gray-200 rounded mb-1.5" />
                <div className="h-3.5 w-8 bg-gray-200 rounded" />
            </div>

            <div>
                <div className="h-3.5 w-28 bg-gray-200 rounded mb-1.5" />
                <div className="h-3.5 w-8 bg-gray-200 rounded" />
            </div>

        </div>
    );
};

export default AttendanceStatusCardShimmer;