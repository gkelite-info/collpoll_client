export const AssignmentCardShimmer = () => {
  return (
    <div className="bg-white w-full h-[170px] rounded-xl flex items-center p-3 gap-3 mb-3 animate-pulse">
      {/* Image placeholder */}
      <div className="h-[139px] w-[145px] rounded-lg bg-gray-300 flex-shrink-0" />

      <div className="h-[139px] w-[520px] flex flex-col justify-between">
        <div className="w-full h-[75%] flex">
          {/* Left side */}
          <div className="w-[60%] flex flex-col pt-1 gap-2">
            <div className="h-5 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex items-center gap-2 mt-auto pb-2">
              <div className="rounded-full bg-gray-200 p-1.5 w-7 h-7" />
              <div className="h-3 bg-gray-200 rounded w-40" />
            </div>
          </div>

          {/* Right side */}
          <div className="w-[40%] flex flex-col justify-between">
            <div className="flex items-center justify-center gap-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-200 w-8 h-8" />
                <div className="rounded-full bg-gray-200 w-8 h-8" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-200 w-7 h-7" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-200 w-7 h-7" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex items-center rounded-full px-3 py-1 bg-gray-200 w-24 h-6" />
        </div>
      </div>
    </div>
  );
};

export const AssignmentCardSkeletonGroup = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <AssignmentCardShimmer key={i} />
      ))}
    </>
  );
};