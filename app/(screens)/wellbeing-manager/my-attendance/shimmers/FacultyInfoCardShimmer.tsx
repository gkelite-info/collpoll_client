import { Fragment } from 'react'

const FacultyInfoCardShimmer = () => {
    return (
        <div className="flex bg-white rounded-xl p-4 w-[70%] overflow-auto shadow-sm items-center gap-8 border border-gray-100/50 animate-pulse">

            <div className="flex flex-col items-center gap-2 pl-2">
                <div className="w-[85px] h-[85px] rounded-full bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200 rounded mt-1" />
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-y-2 w-full text-[13px]">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Fragment key={i}>
                        <div className="h-3.5 w-20 bg-gray-200 rounded my-0.5" />
                        <div className="h-3.5 w-40 bg-gray-100 rounded my-0.5" />
                    </Fragment>
                ))}
            </div>
        </div>
    );
};

export default FacultyInfoCardShimmer;