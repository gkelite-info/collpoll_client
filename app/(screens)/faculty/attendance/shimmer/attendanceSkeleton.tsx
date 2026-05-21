export default function AttendanceSkeleton() {
  return (
    <div className="px-4 py-4 md:py-6 min-h-screen animate-pulse space-y-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="h-8 w-48 max-w-full bg-gray-200 rounded-md"></div>
          <div className="h-4 w-64 max-w-full bg-gray-200 rounded-md"></div>
        </div>
        <div className="h-20 sm:h-24 w-full sm:w-80 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Cards Area */}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-2xl"></div>
        ))}
        <div className="col-span-2 lg:col-span-1 h-28 md:h-32 bg-gray-200 rounded-2xl"></div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2">
        <div className="h-8 w-40 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-lg self-end sm:self-auto"></div>
      </div>

      {/* Table Area */}
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
        {/* Table Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
          <div className="h-4 w-4 bg-gray-200 rounded shrink-0"></div>
          <div className="h-4 w-20 bg-gray-200 rounded shrink-0"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0"></div>
          <div className="h-4 w-32 bg-gray-200 rounded flex-1 sm:flex-initial"></div>
          <div className="hidden sm:block h-4 w-24 bg-gray-200 rounded"></div>
          <div className="hidden md:block h-4 w-16 bg-gray-200 rounded"></div>
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 p-4 border-b border-gray-50"
          >
            <div className="h-4 w-4 bg-gray-200 rounded shrink-0"></div>
            <div className="h-4 w-20 bg-gray-200 rounded shrink-0"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0"></div>
            <div className="h-4 w-32 bg-gray-200 rounded flex-1 sm:flex-initial"></div>
            <div className="hidden sm:block h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="hidden md:block h-4 w-12 bg-gray-200 rounded"></div>
            <div className="hidden lg:block h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
