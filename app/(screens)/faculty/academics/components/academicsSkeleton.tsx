
const ShimmerCard = () => (
  <div className="bg-white rounded-2xl max-md:rounded-lg w-full p-6 max-md:p-4 flex flex-col max-md:min-h-[230px] shadow-sm border border-gray-100 animate-pulse">
    {/* Title + Button row */}
    <div className="flex justify-between items-start max-md:items-center mb-4 max-md:mb-3">
      <div className="h-6 w-48 max-md:w-36 bg-gray-200 rounded-md shimmer-bg" />
      <div className="h-7 w-24 max-md:w-20 bg-gray-200 rounded-md shimmer-bg" />
    </div>

    {/* Units + Topics row */}
    <div className="flex gap-6 max-md:gap-5 mb-3 max-md:mb-2">
      <div className="h-5 w-24 bg-gray-200 rounded shimmer-bg" />
      <div className="h-5 w-36 bg-gray-200 rounded shimmer-bg" />
    </div>

    {/* Next lesson */}
    <div className="h-5 w-64 max-md:w-48 bg-gray-200 rounded shimmer-bg mb-3 max-md:mb-2" />

    {/* Students */}
    <div className="h-5 w-28 bg-gray-200 rounded shimmer-bg mb-4 max-md:mb-2" />

    {/* Progress bar */}
    <div className="max-md:hidden">
      <div className="h-[17px] w-full bg-gray-200 rounded-full shimmer-bg mt-1" />
      <div className="h-4 w-10 bg-gray-200 rounded shimmer-bg mt-1" />
    </div>
    <div className="hidden max-md:block">
      <div className="h-3 w-full bg-gray-200 rounded-full shimmer-bg mt-2" />
      <div className="h-4 w-8 bg-gray-200 rounded shimmer-bg mt-1" />
    </div>
  </div>
);

export default function AcademicsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{`
        .shimmer-bg {
          position: relative;
          overflow: hidden;
        }
        .shimmer-bg::after {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(count)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    </>
  );
}
