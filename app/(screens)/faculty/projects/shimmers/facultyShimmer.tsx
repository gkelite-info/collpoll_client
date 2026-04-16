const FacultyShimmer = () => {
    return (
        <div className="flex items-center gap-3 p-2 border rounded-md animate-pulse">
            {/* Profile Picture Shimmer */}
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>

            <div className="flex flex-col gap-2 flex-1">
                {/* Name Shimmer */}
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                {/* Designation/ID Shimmer */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Square Box (Checkbox/Action) Shimmer */}
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
    );
};

export default FacultyShimmer;