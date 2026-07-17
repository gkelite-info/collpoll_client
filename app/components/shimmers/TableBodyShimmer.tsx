import React from 'react';

interface TableBodyShimmerProps {
  rowCount?: number;
  colCount?: number;
}

const TableBodyShimmer: React.FC<TableBodyShimmerProps> = ({ rowCount = 15, colCount = 8 }) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={`shimmer-row-${rowIndex}`} className="border-b border-gray-100 last:border-none animate-pulse">
          {Array.from({ length: colCount }).map((_, colIndex) => (
            <td key={`shimmer-col-${colIndex}`} className="py-2.5 px-3">
              <div className={`h-4 bg-gray-100 rounded ${colIndex === 0 ? "w-24" : "w-16"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableBodyShimmer;
