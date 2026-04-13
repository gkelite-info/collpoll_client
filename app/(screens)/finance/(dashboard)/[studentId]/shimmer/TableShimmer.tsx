// shimmer/TableShimmer.tsx

export const TableShimmer = ({
  columns,
  rows = 3,
}: {
  columns: number;
  rows?: number;
}) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr
        key={`shimmer-row-${rowIdx}`}
        className="border-b border-gray-50 last:border-0 animate-pulse"
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <td key={`shimmer-col-${colIdx}`} className="py-4 px-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const ProfileShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6 animate-pulse">
    <div className="w-24 h-24 rounded-full bg-gray-200 shrink-0"></div>
    <div className="flex-1 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-100 rounded w-1/4"></div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
      </div>
    </div>
  </div>
);

export const QuickActionsShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse h-full flex flex-col justify-center gap-4">
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-10 bg-gray-100 rounded w-full"></div>
    <div className="h-10 bg-gray-100 rounded w-full"></div>
  </div>
);

export const StatCardShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
  </div>
);
