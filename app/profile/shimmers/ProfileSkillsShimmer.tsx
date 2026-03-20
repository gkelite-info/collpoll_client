export default function ProfileSkillsShimmer() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-32 bg-gray-200 rounded" />

                <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
            </div>

            {[1, 2, 3].map((section) => (
                <div key={section} className="mb-6">
                    <div className="h-5 w-40 bg-gray-200 rounded mb-3" />

                    <div className="border border-[#CCCCCC] rounded-md p-3 flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-6 w-20 bg-gray-200 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}