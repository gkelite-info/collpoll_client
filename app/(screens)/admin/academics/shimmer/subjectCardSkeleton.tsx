export const SubjectCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg w-full min-h-[230px] p-4 flex flex-col justify-between shadow-md animate-pulse border border-gray-100">
      {/* Top section */}
      <div className="flex flex-col justify-start gap-3">
        {/* Row 1: Title + Credits + Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            {/* Title Placeholder */}
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            {/* Credits Pill Placeholder */}
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          </div>
          {/* Button Placeholder */}
          <div className="h-7 w-24 bg-gray-200 rounded-md"></div>
        </div>

        {/* Row 2: Faculty */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-3">
            {/* Label "Faculty -" */}
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            {/* Avatar */}
            <div className="h-[30px] w-[30px] rounded-full bg-gray-200"></div>
            {/* Name */}
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Row 3: Stats */}
          <div className="flex items-center gap-5 mt-1">
            {/* Units */}
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            {/* Topics Covered */}
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Row 4: Next Lesson */}
          <div className="h-4 w-48 bg-gray-200 rounded mt-1"></div>
        </div>
      </div>

      {/* Bottom Section: Progress & Date */}
      <div className="flex flex-col mt-4">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full mb-3"></div>

        {/* Date Row */}
        <div className="flex items-center gap-2">
          {/* Icon placeholder */}
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          {/* Date text placeholder */}
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
