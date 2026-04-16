const TableShimmer = ({ columnCount, rowCount = 6 }: { columnCount: number; rowCount?: number }) => {
    return (
        <>
            {[...Array(rowCount)].map((_, rowIndex) => (
                <tr key={`shimmer-row-${rowIndex}`} className="border-b border-gray-50 animate-pulse">
                    {[...Array(columnCount)].map((_, colIndex) => (
                        <td key={`shimmer-col-${colIndex}`} className="px-4 py-4">
                            <div
                                className={`h-4 bg-gray-200 rounded-md mx-auto ${colIndex === 0 ? "w-8" : "w-full"
                                    }`}
                            ></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableShimmer;