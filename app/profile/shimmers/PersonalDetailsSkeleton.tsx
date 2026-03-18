export default function PersonalDetailsSkeleton() {
  return (
    <div className="w-full bg-[#f6f7f9] mt-2 mb-4 animate-pulse">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-40 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 mb-2 rounded"></div>
              <div className="h-10 w-full bg-gray-100 border border-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-4 w-24 bg-gray-200 mb-3 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 w-full bg-gray-100 rounded-md border border-gray-200"></div>
            <div className="h-24 w-full bg-gray-100 rounded-md border border-gray-200"></div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}