export default function FormSkeleton() {
  return (
    <div className="w-[68%] mx-1 max-w-3xl animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100">
        {/* Subject Skeleton */}
        <div className="mb-4">
          <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>

        {/* Topic & Marks Row Skeleton */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-24 w-full bg-gray-200 rounded" />{" "}
            {/* Textarea height */}
          </div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
        </div>

        {/* Dropdowns Row Skeleton (Branch, Section, Year) */}
        <div className="flex gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1">
              <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Schedule Row Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded" />
          <div className="flex-1 h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
