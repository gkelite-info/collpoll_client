
export default function AnalyticsFacultyInfoShimmer() {
  return (
    <div className="w-full mb-5 text-[14px]">
      {/* Header Skeleton ("Faculty Information") */}
      <div className="h-[20px] w-[160px] bg-gray-200 rounded mb-4 animate-pulse" />

      <div className="grid grid-cols-3 gap-y-3.5 w-full">
        {/* Name Block */}
        <div className="flex items-center gap-2">
          {/* Label skeleton ("Name :") */}
          <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
          {/* Value skeleton (e.g., "Harsha Sharma") */}
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Branch/Group Block */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Employee ID Block */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Experience Block */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Leaves Taken Block */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Working Days Block */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}