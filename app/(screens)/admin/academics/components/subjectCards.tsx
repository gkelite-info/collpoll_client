"use client";

import { Timer } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type CardProps = {
  subjectId?: number;
  facultyName?: string;
  facultyProfile?: string;
  subjectTitle: string;
  year: string | number;
  units: number;
  topicsCovered: number;
  topicsTotal: number;
  nextLesson: string;
  percentage?: number;
  students: number;
  fromDate: string;
  toDate: string;
  credits?: number;
};

type SubjectCardProps = { subjectProps: CardProps[] };

export default function SubjectCard({ subjectProps }: SubjectCardProps) {
  const [cards] = useState<CardProps[]>(subjectProps);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((item, index) => (
          <IndividualCard key={index} item={item} />
        ))}
      </div>
    </>
  );
}

const IndividualCard = ({ item }: { item: CardProps }) => {
  const router = useRouter();
  const percentage = item.percentage ?? 0;
  const ballWidthPx = 16;
  const ballLeft =
    percentage <= 0
      ? "0px"
      : percentage >= 100
        ? `calc(100% - ${ballWidthPx}px)`
        : `calc(${percentage}% - ${ballWidthPx / 2}px)`;
  const filledWidth = `calc(${percentage}% + ${ballWidthPx / 2}px)`;

  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const yearQuery = searchParams.get("year");

  const handleClick = () => {
    if (item.subjectId) {
      router.push(
        `/admin/academics/${params.category}/${item.subjectId}?year=${yearQuery}`,
      );
    } else {
      // Fallback for mock data
      const slug = item.subjectTitle.toLowerCase().replace(/\s+/g, "-");
      router.push(
        `/admin/academics/${params.category}/${slug}?year=${yearQuery}`,
      );
    }
  };

  return (
    <div className="bg-white rounded-lg w-full min-h-[230px] p-4 flex flex-col justify-between shadow-md">
      {/* Top section */}
      <div className="flex flex-col justify-start gap-1.5">
        {/* Title + Credits + Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h5 className="text-[#282828] font-medium text-[17px] truncate">
              {item.subjectTitle}
            </h5>
            <p className="flex-shrink-0 px-2 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
              Credits: {item.credits ?? 4}
            </p>
          </div>

          <p
            onClick={handleClick}
            className="bg-[#7051E1] px-2.5 py-1 text-white font-medium rounded-md text-xs cursor-pointer"
          >
            View Details
          </p>
        </div>

        {/* Faculty */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[#282828] font-medium text-[15px]">
              Faculty -
            </h4>
            <div className="h-[30px] w-[30px] rounded-full overflow-hidden">
              <img
                src={`https://i.pravatar.cc/100?u=${item.facultyProfile}`}
                alt="faculty"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-[#525252] text-[15px]">{item.facultyName}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5">
            <h5 className="text-[#525252] text-[15px]">
              <strong className="text-[#282828] font-medium mr-1.5">
                Units:
              </strong>
              {item.units.toString().padStart(2, "0")}
            </h5>
            <h5 className="text-[#525252] text-[15px]">
              <strong className="text-[#282828] font-medium mr-1.5">
                Topics Covered :
              </strong>
              {item.topicsCovered}/{item.topicsTotal}
            </h5>
          </div>

          <h5 className="text-[#525252] text-[15px] truncate">
            <strong className="text-[#282828] font-medium mr-1.5">
              Next lesson :
            </strong>
            {item.nextLesson}
          </h5>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col justify-between mt-1 relative">
        <div className="relative w-full rounded-full h-3 bg-gray-200 mt-3 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#9B83F4] to-[#6D4EE0] transition-all duration-700 ease-out rounded-full"
            style={{ width: filledWidth }}
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm transition-all duration-700 ease-out"
            style={{
              left: ballLeft,
              height: "12px",
              width: "12px",
            }}
          />
        </div>

        <div className="relative w-full h-5 mt-0.5">
          <span
            className="absolute bg-gradient-to-b from-[#7153E1] to-[#2D1A76] bg-clip-text text-transparent font-medium text-xs"
            style={{ left: ballLeft, transform: "translateX(-50%)" }}
          >
            {percentage}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Timer size={15} weight="fill" className="text-[#9880F3]" />
          <p className="text-xs text-[#7153E1]">
            {item.fromDate} - {item.toDate}
          </p>
        </div>
      </div>
    </div>
  );
};
