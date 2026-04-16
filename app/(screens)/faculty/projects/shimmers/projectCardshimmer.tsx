const ProjectCardShimmer = () => (
    <div className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7 animate-pulse">
        <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
                <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded-full w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded-full w-5/6" />
            </div>
            <div className="h-9 w-24 bg-gray-200 rounded-full shrink-0" />
        </div>
        <div className="space-y-4 mt-5">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="h-4 bg-gray-200 rounded-full w-24 shrink-0" />
                    <div className="h-4 bg-gray-200 rounded-full w-40" />
                </div>
            ))}
        </div>
    </div>
);

export default ProjectCardShimmer;