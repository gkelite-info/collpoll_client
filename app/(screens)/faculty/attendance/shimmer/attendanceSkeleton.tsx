export default function AttendanceSkeleton() {
  return (
    <div className="px-4 py-4 min-h-screen animate-pulse space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
        </div>
        <div className="h-24 w-80 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Cards Area */}
      <div className="flex flex-row items-stretch gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-32 bg-gray-200 rounded-2xl"></div>
        ))}
        <div className="flex-[1.6] h-32 bg-gray-200 rounded-2xl"></div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center py-2">
        <div className="h-8 w-40 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Table Area */}
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
        {/* Table Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 p-4 border-b border-gray-50"
          >
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
