"use client";

export default function ManageTaxShimmer() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-40 bg-gray-100 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="h-4 w-12 bg-gray-200 rounded ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
