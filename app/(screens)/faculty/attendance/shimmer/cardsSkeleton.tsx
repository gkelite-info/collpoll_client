"use client";

export function CardsSkeleton() {
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
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: table-sweep 1.5s infinite;
        }
        @keyframes table-sweep {
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full h-full">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl shadow-sm px-3 md:px-4 py-3 md:py-4 flex items-center md:flex-col md:items-start justify-start md:justify-between h-[80px] md:h-[130px] w-full bg-gray-50/50 border border-gray-100"
          >
            <div className="w-10 h-10 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center bg-gray-200 mr-3 md:mr-0 md:mb-4 shimmer-bg" />
            
            <div className="flex flex-col justify-center text-left w-full">
              <div className="h-[17px] md:h-6 w-1/2 bg-gray-200 rounded shimmer-bg mb-1.5 md:mb-2" />
              <div className="h-[11px] md:h-3 w-3/4 bg-gray-200 rounded shimmer-bg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
