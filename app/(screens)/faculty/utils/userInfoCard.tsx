"use client";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type UserInfoCardProps = {
  show?: boolean;
  studentId?: number;
  studentBranch?: string;
  user: string;
  studentName?: string;
  facultySubject?: string;
  studentsTaskPercentage?: number;
  childPerformance?: string;
  image?: string;
  studentAcademicYear?: string;
};

type UserInfoProps = {
  cardProps: UserInfoCardProps[];
};

export function UserInfoCard({ cardProps }: UserInfoProps) {
  const [today, setToday] = useState("");
  const t = useTranslations("Dashboard.parent");

  const { faculty_subject } = useFaculty();
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      className="w-full relative rounded-2xl h-[160px] md:h-[175px] shadow-sm flex items-center z-0"
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      {cardProps.map((item, index) => (
        <div
          className="relative flex w-full h-full items-center justify-between px-4 py-3 md:px-8 md:py-0 z-10"
          key={index}
        >
          <div className="flex flex-col w-[60%] md:w-[68%] gap-1 md:gap-2">
            {item.show && (
              <p className="text-[10px] md:text-xs text-[#282828] leading-tight font-medium opacity-80 truncate w-full">
                {t("StudentID:")} {item.studentId}, {item.studentBranch},{" "}
                {item.studentAcademicYear}
              </p>
            )}

            <p className="text-sm md:text-lg text-[#282828] leading-tight mt-1 md:mt-3">
              {t("Welcome Back,")}
            </p>

            <div className="flex items-center md:items-baseline flex-wrap gap-1 md:gap-1.5">
              <h1 className="text-base md:text-lg font-bold md:font-semibold text-[#089144] leading-tight">
                {!item.show ? `${t("Prof")} ${item.user}` : item.user}
              </h1>

              {!item.show && faculty_subject?.length > 0 && (
                <span className="text-[#454545] text-xs md:text-sm font-medium whitespace-nowrap">
                  ({faculty_subject.map((s) => s.subjectName).join(", ")})
                </span>
              )}

              {item.show && item.studentName && (
                <p className="text-[#454545] italic text-[11px] md:text-sm font-medium">
                  {t("Parent of")}{" "}
                  <span className="text-[#089144] font-semibold">
                    {item.studentName}
                  </span>
                </p>
              )}
            </div>

            {!item.show ? (
              <p className="text-xs md:text-base text-[#454545] mt-1 md:mt-0 font-medium">
                Your Students Completed{" "}
                <span className="text-[#089144] font-bold">
                  {item.studentsTaskPercentage}%
                </span>{" "}
                {t("of the tasks")}
              </p>
            ) : (
              <p className="text-[10px] md:text-sm text-[#454545] mt-1 md:mt-0 leading-snug max-w-[95%]">
                {item.childPerformance}
              </p>
            )}
          </div>

          {item.image && (
            <div className="absolute right-4 bottom-0 h-[95%] w-[130px] md:h-[100%] md:w-[150px] lg:h-[100%] lg:w-[180px] lg:right-6 pointer-events-none z-20">
              <Image
                src={item.image}
                alt="Avatar"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          )}
        </div>
      ))}

      <svg
        className="absolute right-0 bottom-0 z-0 h-full w-auto opacity-60 md:opacity-100 rounded-br-2xl pointer-events-none"
        width="186"
        height="170"
        viewBox="0 0 186 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
          fill="#BCE6D0"
        />
      </svg>
    </div>
  );
}
