import { DiscussionCourseCardSkeleton } from "./courseCardSkeleton";

export function AssignmentPageShimmer() {
  return (
    <>
      <div className="mt-0 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-[50%] h-11 bg-gray-200 animate-pulse rounded-full" />
        <div className="bg-white rounded-xl p-2 px-4 shadow-sm flex flex-wrap justify-end gap-4 border border-gray-100 flex-1">
          <div className="flex-1 max-w-[120px]">
            <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-[34px] w-full bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="flex-1 max-w-[120px]">
            <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-[34px] w-full bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="flex-1 max-w-[120px]">
            <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-[34px] w-full bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      <div className="bg-[#F3F6F9] min-h-[500px] rounded-xl flex flex-col p-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          <DiscussionCourseCardSkeleton />
          <DiscussionCourseCardSkeleton />
          <DiscussionCourseCardSkeleton />
          <DiscussionCourseCardSkeleton />
          <DiscussionCourseCardSkeleton />
          <DiscussionCourseCardSkeleton />
        </div>
      </div>
    </>
  );
}
