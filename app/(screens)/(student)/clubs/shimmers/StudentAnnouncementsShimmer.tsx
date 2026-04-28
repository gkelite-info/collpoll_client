export function StudentAnnouncementsShimmer() {
    return (
        <div className="mx-auto flex h-[650px] w-full max-w-2xl flex-col bg-transparent">
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 pb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex items-start gap-4 px-1 animate-pulse">
                            <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm border-2 border-gray-100">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="h-3 w-16 rounded bg-gray-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-16 rounded bg-gray-200" />
                                        <div className="h-4 w-24 rounded bg-gray-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full rounded bg-gray-200" />
                                    <div className="h-3 w-5/6 rounded bg-gray-200" />
                                </div>
                            </div>
                            <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2 pb-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-12 shrink-0" />
                </div>
            </div>
        </div>
    );
}