export const StudentTableSkeleton = ({ rowsPerPage = 10 }: { rowsPerPage?: number }) => {
  return (
    <>
      {Array.from({ length: rowsPerPage }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse">
          <td className="whitespace-nowrap px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-20 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-12 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          </td>
          <td className="whitespace-nowrap px-3 md:px-4 py-3">
            <div className="h-6 w-12 rounded border bg-gray-100"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
