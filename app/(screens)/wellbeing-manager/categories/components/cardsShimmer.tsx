export const CategoryShimmer = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[16px] border border-gray-100 p-5 h-[280px] animate-pulse">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200" />
              <div className="w-7 h-7 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-gray-200 rounded mb-1.5" />
                  <div className="h-2.5 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

export const SubCategoryShimmer = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-[16px] border border-gray-100 p-5 h-[280px] animate-pulse">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200" />
            <div className="w-7 h-7 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((j) => (
            <div key={j} className="h-[38px] w-full bg-gray-200 rounded-[8px]" />
          ))}
        </div>
      </div>
    ))}
  </div>
);