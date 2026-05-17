
const AttendanceTableShimmer = () => {
    return (
        <div className="w-full animate-pulse">

            <div className="flex justify-between items-end mb-2.5">
                <div className="h-[24px] w-40 bg-gray-200 rounded" />
                <div className="flex gap-2">
                    <div className="h-[32px] w-[65px] bg-gray-200 rounded" />
                    <div className="h-[32px] w-[65px] bg-gray-200 rounded" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="bg-[#F2F2F2]">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <th key={`th-${i}`} className="py-2.5 px-3">
                                    <div className="h-4 w-20 bg-gray-300 rounded" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 9 }).map((_, rowIndex) => (
                            <tr key={`tr-${rowIndex}`} className="border-b border-gray-100 last:border-none">
                                {Array.from({ length: 8 }).map((_, colIndex) => (
                                    <td key={`td-${colIndex}`} className="py-1.5 px-3">
                                        <div className={`h-4 bg-gray-100 rounded ${colIndex === 0 ? "w-24" : "w-16"}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AttendanceTableShimmer;