export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-[156px] w-full rounded-2xl bg-white/50 border border-gray-100 shadow-sm p-5 flex flex-col justify-between"
        >
          <div className="w-full h-full flex flex-col justify-between animate-pulse">
            
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            
            <div className="flex flex-col gap-2">
              <div className="w-14 h-7 rounded-lg bg-gray-200" />
              
              <div className="w-3/4 h-4 rounded-md bg-gray-200" />
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
}