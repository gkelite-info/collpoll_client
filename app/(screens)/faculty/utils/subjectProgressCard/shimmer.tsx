const SubjectShimmer = () => {
    return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3].map((_, index) => (
                <div
                    key={index}
                    className="h-20 flex items-center rounded-lg p-2 gap-1 bg-gray-100 animate-pulse"
                >
                    <div className="h-full w-[22%] rounded-md bg-gray-200" />

                    <div className="h-full w-[78%] rounded-md p-2 flex justify-between items-center">
                        <div className="flex flex-col gap-3 w-full">
                            <div className="h-2 w-24 bg-gray-200 rounded" />
                            <div className="h-2 w-16 bg-gray-200 rounded" />
                        </div>

                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-2" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubjectShimmer;