"use client";
import { Timer } from "@phosphor-icons/react";
import { SubjectDetailsCard } from "./subjectDetails";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

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
  const ballWidthPx = 16;
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);

  const handleBack = () => {
    setShowDetails(false);
    setSelectedCard(null);
  };

  if (showDetails && selectedCard) {
    return (
      <div className="h-screen overflow-x-scroll">
        <SubjectDetailsCard details={selectedCard} onBack={handleBack} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-00 mb-4 flex flex-col gap-4">
        <div className="w-full flex flex-wrap gap-8">
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[18px]">Subject :</p>
            <p className="px-5 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium">
              All
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[18px]">Semester :</p>
            <div className="relative flex items-center">
              <select className="px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium appearance-none pr-6 focus:outline-none">
                <option>I</option>
                <option>II</option>
              </select>
              <span className="absolute right-2 pointer-events-none text-[#43C17A] text-xs">
                <FaChevronDown />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-[18px]">Year :</p>
            <div className="relative flex items-center">
              <select className="px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium appearance-none pr-6 focus:outline-none">
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
              <span className="absolute right-2 pointer-events-none text-[#43C17A] text-xs">
                <FaChevronDown />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {subjectProps.map((item, index) => {
          const percentage = item.percentage ?? 0;

          let ballLeft: string;
          if (percentage <= 0) {
            ballLeft = `0px`;
          } else if (percentage >= 100) {
            ballLeft = `calc(100% - ${ballWidthPx}px)`;
          } else {
            ballLeft = `calc(${percentage}% - ${ballWidthPx / 2}px)`;
          }

          const filledWidth = `calc(${percentage}% + ${ballWidthPx / 2}px)`;

          return (
            <div
              key={index}
              className="bg-white rounded-lg w-full min-h-[281px] p-4 flex flex-col justify-between shadow-md"
            >
              <div className="flex flex-col justify-start h-auto gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h5 className="text-[#282828] font-medium text-lg whitespace-nowrap overflow-x-auto scrollbar-hide">
                      {item.subjectTitle}
                    </h5>

                    <p className="flex-shrink-0 px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium">
                      Credits: {item.subjectCredits}
                    </p>
                  </div>

                  <p
                    className="bg-[#7051E1] px-2 text-white font-medium py-1 rounded-lg text-[14.73px] cursor-pointer"
                    onClick={() => {
                      setSelectedCard(item);
                      setShowDetails(true);
                    }}
                  >
                    View Details
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[#282828] text-[20px]">Faculty - </h4>
                    <div className="h-[36px] w-[36px] rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={item.profileIcon}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[#525252] text-[18px]">
                      {item.lecturer}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <h5 className="text-[#525252] text-[20px]">
                      <strong className="text-[#282828] font-medium mr-2">
                        Units:
                      </strong>
                      {item.units}
                    </h5>
                    <h5 className="text-[#525252] text-[20px]">
                      <strong className="text-[#282828] font-medium mr-2">
                        Topics Covered :
                      </strong>
                      {item.topicsCovered}/{item.topicsTotal}
                    </h5>
                  </div>
                  <h5 className="text-[#525252] text-[20px]">
                    <strong className="text-[#282828] font-medium mr-2">
                      Next lesson :
                    </strong>
                    {item.nextLesson}
                  </h5>
                </div>
              </div>

              <div className="flex flex-col justify-between mt-2 relative">
                <div className="relative lg:w-full rounded-full h-[17px] bg-gray-200 mt-4 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7153E1] to-[#2D1A76] transition-all duration-700 ease-out rounded-full"
                    style={{ width: filledWidth }}
                  ></div>

                  <div
                    className="absolute top-0 h-4 w-4 bg-white rounded-full shadow-lg transition-all duration-700 ease-out"
                    style={{ left: ballLeft }}
                  ></div>
                </div>

                <div className="relative w-full h-6 mt-1">
                  <span
                    className="absolute bg-gradient-to-b from-[#7153E1] to-[#2D1A76] bg-clip-text text-transparent font-medium transition-all duration-700 ease-out text-xs"
                    style={{ left: ballLeft, transform: "translateX(-10%)" }}
                  >
                    {percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <Timer size={16} weight="fill" className="text-[#9880F3]" />
                  <p className="text-[13px] text-[#7153E1]">
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
