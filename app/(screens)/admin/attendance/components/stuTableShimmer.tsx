export default function StuTableShimmer() {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm whitespace-nowrap min-w-max">
          <thead className="bg-[#FAFAFA] text-[#282828] border-b border-gray-100">
            <tr>
              <th className="px-4 py-4 text-left w-[40px]">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">S.No</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Roll No.</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Photo</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Attendance</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Attendance %</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[20%]">Reason</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="text-[#515151]">
                <td className="px-4 py-4">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-6"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-green-100 rounded w-6"></div>
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-8 w-8 rounded-full bg-gray-100"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-7 rounded-full bg-gray-100 w-24"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-12"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-4"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 rounded-sm bg-gray-100 w-12"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
