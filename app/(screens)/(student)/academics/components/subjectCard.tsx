"use client";
import { Timer } from "@phosphor-icons/react";
import { SubjectDetailsCard } from "./subjectDetails";
import { useCallback } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type CardProps = {
  profileIcon: string;
  subjectTitle: string;
  subjectCredits: number;
  lecturer: string;
  units: number;
  topicsCovered: number;
  topicsTotal: number;
  nextLesson: string;
  percentage?: number;
  fromDate: string;
  toDate: string;
};

type SubjectCardProps = {
  subjectProps: CardProps[];
};

export default function SubjectCard({ subjectProps }: SubjectCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Size of the ball inside the bar
  const ballSize = "10px";

  const activeSubjectTitle = searchParams.get("subject");
  const activeSubjectData = activeSubjectTitle
    ? subjectProps.find((s) => s.subjectTitle === activeSubjectTitle)
    : null;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleViewDetails = (title: string) => {
    router.push(pathname + "?" + createQueryString("subject", title));
  };

  const handleBack = () => {
    router.push(pathname);
  };

  if (activeSubjectData) {
    return (
      <SubjectDetailsCard details={activeSubjectData} onBack={handleBack} />
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="w-full flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[16px]">Subject :</p>
            <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-sm font-medium">
              All
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[16px]">Semester :</p>
            <div className="relative flex items-center">
              <select className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-sm font-medium appearance-none pr-6 focus:outline-none">
                <option>I</option>
                <option>II</option>
              </select>
              <span className="absolute right-2 pointer-events-none text-[#43C17A] text-xs">
                <FaChevronDown />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[16px]">Year :</p>
            <div className="relative flex items-center">
              <select className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-sm font-medium appearance-none pr-6 focus:outline-none">
                <option>1st Year</option>
                <option>2nd Year</option>
              </select>
              <span className="absolute right-2 pointer-events-none text-[#43C17A] text-xs">
                <FaChevronDown />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {subjectProps.map((item, index) => {
          const percentage = item.percentage ?? 0;

          return (
            <div
              key={index}
              className="bg-white rounded-lg w-full min-h-[230px] p-4 flex flex-col justify-between shadow-md"
            >
              <div className="flex flex-col justify-start h-auto gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h5 className="text-[#282828] font-medium text-[17px] truncate">
                      {item.subjectTitle}
                    </h5>
                    <p className="flex-shrink-0 px-2 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
                      Credits: {item.subjectCredits}
                    </p>
                  </div>
                  <p
                    className="bg-[#7051E1] px-2.5 text-white font-medium py-1 rounded-md text-xs cursor-pointer"
                    onClick={() => handleViewDetails(item.subjectTitle)}
                  >
                    View Details
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[#282828] text-[15px]">Faculty - </h4>
                    <div className="h-[30px] w-[30px] rounded-full overflow-hidden">
                      <img
                        src={item.profileIcon}
                        className="h-full w-full object-cover"
                        alt="faculty"
                      />
                    </div>
                    <p className="text-[#525252] text-[15px]">
                      {item.lecturer}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <h5 className="text-[#525252] text-[15px]">
                      <strong className="text-[#282828] font-medium mr-1.5">
                        Units:
                      </strong>
                      {item.units}
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

              <div className="flex flex-col justify-between mt-1 relative">
                <div className="relative w-full rounded-full h-3 bg-gray-200 mt-3 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7153E1] to-[#2D1A76] transition-all duration-700 ease-out rounded-full"
                    style={{ width: percentage > 0 ? `${percentage}%` : "0%" }}
                  />

                  {percentage > 0 && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm transition-all duration-700 ease-out"
                      style={{
                        left: `calc(${percentage}% - ${ballSize} - 2px)`,
                        height: ballSize,
                        width: ballSize,
                      }}
                    />
                  )}
                </div>

                <div className="relative w-full h-5 mt-0.5">
                  <span
                    className="absolute bg-gradient-to-b from-[#7153E1] to-[#2D1A76] bg-clip-text text-transparent font-medium transition-all duration-700 ease-out text-xs"
                    style={{
                      left: `${percentage}%`,
                      transform:
                        percentage > 90
                          ? "translateX(-100%)"
                          : percentage < 10
                            ? "translateX(0%)"
                            : "translateX(-50%)",
                    }}
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
        })}
      </div>
    </>
  );
}
