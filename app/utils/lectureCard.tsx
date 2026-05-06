"use client";

type LectureCardProps = {
  time: string;
  title: string;
  professor: string;
  description: string;
  status?: string;
};

export default function LectureCard({
  time,
  title,
  professor,
  description,
  status,
}: LectureCardProps) {
  return (
    <div className="flex gap-1 mb-2 max-md:gap-3">
      <div className="w-[20%] max-md:w-[22%] flex items-center justify-center bg-pink-00 max-md:justify-start">
        <p className="text-xs font-semibold text-black whitespace-pre-line text-center max-md:text-[12px] max-md:text-left max-md:text-[#16284F]">
          {time}
        </p>
      </div>

      <div className="w-[80%] max-md:w-[78%] flex justify-end bg-[#16284F] max-md:bg-white rounded-md rounded-r-lg max-md:justify-start max-md:border-l-4 max-md:border-[#16284F] max-md:shadow-sm">
        <div className="bg-[#E8E9ED] w-[98%] rounded-r-md flex flex-col justify-between gap-1 px-2 py-1  max-md:w-full max-md:px-3 max-md:py-2.5 max-md:gap-1.5">
          <div className="flex justify-between items-center max-md:justify-start max-md:gap-2">
            <p className="text-[#16284F] text-[14px] font-semibold">{title}</p>
            <p className="text-[#43C17A] text-[10px] max-md:text-[11px]">
              ({professor})
            </p>
          </div>

          <>
            <p className="text-[#454545] text-[10px] max-md:text-[12px] max-md:leading-snug">
              {description.split(" • ")[0]}
            </p>

            <p className="text-[#454545] text-[10px] hidden md:block">
              {description.split(" • ")[1]}
            </p>
          </>

          {status && (
            <p className="text-red-500 text-xs font-semibold max-md:mt-1">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
