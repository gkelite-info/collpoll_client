interface TableShimmerProps {
  columns: number;
  rows?: number;
}

export const TableShimmer: React.FC<TableShimmerProps> = ({ columns, rows = 8 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-gray-50 last:border-0">
          <td className="py-2 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto"></div>
          </td>
          
          {Array.from({ length: columns - 1 }).map((_, colIndex) => (
            <td key={colIndex} className="py-2 px-2 text-center">
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardValueShimmer = () => {
  return (
    <div className="animate-pulse w-12 h-7 bg-black/10 rounded-md inline-block align-middle"></div>
  );
};