export default function CreateFeeSkeleton() {
  return (
    <div className="bg-white mt-1 rounded-md p-6 flex flex-wrap justify-between gap-2 shadow-sm animate-pulse">
      {/* Header Inputs Shimmer */}
      <div className="flex flex-wrap justify-between w-[100%] gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col w-[49%]">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-md border border-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Fee Components Header Shimmer */}
      <div className="mt-4 flex flex-col w-full mb-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-1/2"></div>
        </div>
      </div>

      {/* Fee Inputs Shimmer */}
      <div className="flex flex-wrap justify-between mt-3 gap-4 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col w-[49%]">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-10 bg-gray-100 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Footer / Meta Data Shimmer */}
      <div className="w-full mt-8 flex flex-col items-start">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="w-full flex flex-wrap justify-between">
          <div className="flex flex-col w-[49%]">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-md"></div>
          </div>
          <div className="flex flex-col w-[49%]">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
