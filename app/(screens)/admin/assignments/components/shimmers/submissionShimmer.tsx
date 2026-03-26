const SubmissionShimmer = () => {
    return (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-3 animate-pulse">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                    </div>

                    <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-7 bg-gray-200 rounded-md w-[70px]" />
                        </div>

                        <div className="flex justify-between mt-4">
                            <div className="flex flex-col gap-3 text-sm w-full">
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/5" />
                            </div>

                            <div className="flex flex-col gap-3 items-end w-[280px]">
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubmissionShimmer;