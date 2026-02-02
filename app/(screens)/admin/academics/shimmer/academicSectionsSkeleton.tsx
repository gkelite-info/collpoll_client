export const AcademicSectionsSkeleton = () => {
  return (
    <div className="bg-white rounded-[10px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border-l-[8px] border-gray-200 animate-pulse h-full">
      {/* Header: Name and Year */}
      <div className="flex justify-between items-start mb-6">
        {/* Title Bar */}
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        {/* Year Pill */}
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </div>

      {/* Faculty Section */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="flex -space-x-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
            ></div>
          ))}
        </div>
      </div>

      {/* Date / Update Text */}
      <div className="mb-8">
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Footer: Students and Button */}
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          {/* Icon placeholder */}
          <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
          {/* Text placeholder */}
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        {/* Button placeholder */}
        <div className="h-7 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};
