"use client";

export function RequestsCardsShimmer() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-gray-50 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 rounded bg-gray-200" />
                            <div className="h-3 w-20 rounded bg-gray-200" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-20 rounded-md bg-gray-200" />
                        <div className="h-9 w-20 rounded-md bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function RequestsListShimmer() {
    return (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-[#ffffff] shadow-2xl p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                    <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
                </div>
                <div className="h-10 w-full max-w-sm rounded-full bg-gray-200 animate-pulse" />
            </div>
            
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 animate-pulse" />

            <RequestsCardsShimmer />
        </div>
    );
}