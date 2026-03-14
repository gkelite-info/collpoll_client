export const LessonShimmer = () => (
  <div className="shimmer-card relative flex bg-[#f6f5f5] rounded-r-md rounded-l overflow-hidden min-h-[100px] shrink-0">
    <style jsx>{`
      .shimmer-card::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer-sweep 2s infinite;
      }

      @keyframes shimmer-sweep {
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>

    <div className="w-1.5 bg-gray-300 absolute left-0 top-0 bottom-0 rounded-l-sm" />

    <div className="flex-1 py-3 px-4 ml-2 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="h-4 bg-gray-300/60 rounded w-3/4" />

        <div className="h-3 bg-gray-300/40 rounded w-1/2" />

        <div className="space-y-1.5">
          <div className="h-2.5 bg-gray-200 rounded w-full" />
          <div className="h-2.5 bg-gray-200 rounded w-5/6" />
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <div className="h-3 bg-gray-300/40 rounded w-12" />
      </div>
    </div>
  </div>
);

export const UpcomingClassesSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <LessonShimmer key={i} />
    ))}
  </div>
);
