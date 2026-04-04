'use client';

export default function MeetingCardShimmer({
    role,
    category,
    type = "upcoming",
    count = 8
}: {
    role?: string | null;
    category?: string | null;
    type?: string;
    count?: number;
}) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse"
                >
                    <div className="bg-[#43C17A26] px-4 py-2 flex items-center justify-between gap-3 border-b-2 border-dotted border-[#43C17A]">
                        <div className="flex gap-2 items-center justify-center">
                            <div className="bg-[#43C17A] w-7 h-7 rounded-full opacity-40"></div>
                            <div className="h-5 w-32 bg-[#43C17A] rounded-md opacity-40"></div>
                        </div>

                        {(type === "upcoming" && role === "Finance") && (
                            <div className="flex gap-2 items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shadow-sm">
                                </div>
                                <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shadow-sm">
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="w-[80%]">
                                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                            </div>

                            {((category && category !== "Admin") || (role && (!["Admin", "Finance"].includes(role)))) && (
                                <div className="h-6 w-20 bg-green-200 rounded-full"></div>
                            )}
                        </div>

                        <div className="space-y-3 mt-1">
                            <div className="flex items-center gap-1">
                                <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
                                <div className="h-5 flex-1 bg-gray-100 rounded-md"></div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1">
                                    <div className="h-5 w-12 bg-gray-200 rounded-md"></div>
                                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-8 w-28 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}