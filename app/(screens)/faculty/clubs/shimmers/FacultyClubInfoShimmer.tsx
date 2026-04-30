"use client";

interface FacultyClubInfoShimmerProps {
    isCollegeAdmin?: boolean;
}

export default function FacultyClubInfoShimmer({ isCollegeAdmin = false }: FacultyClubInfoShimmerProps) {
    return (
        <div className="mb-8 flex flex-col items-center animate-pulse">
            <div className="mb-4 flex h-[150px] w-[150px] rounded-full bg-gray-200 border border-gray-100 shadow-sm" />
            <div className="h-6 w-48 rounded bg-gray-200 mb-8" />
            {isCollegeAdmin && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-10 px-2 md:px-4">
                    <div className="h-24 rounded-2xl bg-gray-100 border border-gray-200 shadow-sm" />
                    <div className="h-24 rounded-2xl bg-gray-100 border border-gray-200 shadow-sm" />
                </div>
            )}
            <div className="flex w-full max-w-2xl flex-col justify-between gap-8 px-2 md:flex-row md:px-4">
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div className="h-4 w-28 rounded bg-gray-200" />
                            <div className="h-6 w-24 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-start md:items-center">
                    <span className="mb-3 text-sm font-semibold text-gray-300 flex self-start">Mentors :</span>
                    <div className="flex flex-wrap gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                <div className="h-3 w-16 rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}