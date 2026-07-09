"use client";

export default function ProfileShimmer() {
  return (
    <div className="w-[60%] flex items-center bg-[#43C17A] cursor-pointer rounded-l-full py-3 px-3 xl:px-0 animate-pulse">
      <div className="w-[25%] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/40 bg-white/20 shrink-0"></div>
      </div>
      
      <div className="w-[75%] flex flex-col justify-center px-2 gap-[6px] min-w-0">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="w-[70%] h-3.5 bg-white/30 rounded-md"></div>
          <div className="w-4 h-4 bg-white/20 rounded-full shrink-0 mr-1"></div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 mt-1">
          <div className="w-[40%] h-2.5 bg-white/20 rounded-md"></div>
          <div className="w-[30%] h-2.5 bg-white/20 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}