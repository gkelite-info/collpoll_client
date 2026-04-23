export default function ViewClubDetailsShimmer() {
    return (
        <div className="w-full flex flex-col items-center relative animate-pulse">
            <div className="w-full flex justify-start mb-2">
                <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
            </div>
            
            <div className="bg-[#E9E9E9] p-2 rounded-full inline-flex gap-2 mx-auto self-center mb-8">
                <div className="w-36 h-9 bg-gray-300 rounded-full"></div>
                <div className="w-36 h-9 bg-gray-300 rounded-full"></div>
            </div>

            <div className="w-full bg-white min-h-[70vh] rounded-2xl shadow-sm border border-gray-100 p-8 pt-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-64 bg-gray-200 rounded-md"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="w-[380px] h-11 bg-gray-200 rounded-full"></div>
                    <div className="flex items-center gap-5">
                        <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
                        <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
                        <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 w-full bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}