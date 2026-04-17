"use client";

export default function ProfileShimmer() {
  return (
    <div className="w-[60%] shrink-0 max-h-[90%] flex items-center bg-[#43C17A]/60 animate-pulse cursor-pointer rounded-l-full p-2">
      <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-full bg-[#E5E5E5]/40 border-2 border-white/50"></div>
      <div className="flex flex-col justify-center gap-1.5 px-3 min-w-0 flex-1">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="w-[60%] lg:w-[70%] h-3 lg:h-4 bg-[#E5E5E5]/50 rounded-md"></div>
          <div className="w-4 h-4 shrink-0 bg-[#E5E5E5]/50 rounded-sm"></div>
        </div>
        <div className="flex items-center justify-between w-full gap-4 mt-0.5">
          <div className="w-[40%] h-2.5 lg:h-3 bg-[#E5E5E5]/40 rounded-md"></div>
          <div className="w-[45%] h-2.5 lg:h-3 bg-[#E5E5E5]/40 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}