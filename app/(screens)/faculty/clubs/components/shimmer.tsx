export default function ClubShimmer() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        {/* Header Shimmer */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="h-8 w-48 rounded-md bg-gray-300"></div>
            <div className="h-4 w-96 rounded-md bg-gray-300"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 rounded-md bg-gray-300"></div>
            <div className="h-10 w-32 rounded-md bg-gray-300"></div>
          </div>
        </div>

        {/* Main Content Area Shimmer */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          {/* Main Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="h-12 w-80 rounded-full bg-gray-200"></div>
          </div>

          {/* Club Info Section */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-gray-200"></div>
            <div className="h-6 w-48 rounded-md bg-gray-200"></div>
            <div className="flex w-full max-w-2xl justify-between px-8">
               <div className="space-y-3"><div className="h-10 w-40 rounded-md bg-gray-200"></div></div>
               <div className="flex gap-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-12 w-12 rounded-full bg-gray-200"></div>)}
               </div>
            </div>
          </div>

          {/* List Area */}
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-6">
            <div className="mb-6 flex gap-3">
               {[1, 2, 3].map(i => <div key={i} className="h-10 w-24 rounded-full bg-gray-200"></div>)}
            </div>
            <div className="h-4 w-32 rounded-md bg-gray-200 mb-4"></div>
            
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded-md bg-gray-200"></div>
                      <div className="h-3 w-48 rounded-md bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-20 rounded-md bg-gray-200"></div>
                    <div className="h-9 w-20 rounded-md bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}