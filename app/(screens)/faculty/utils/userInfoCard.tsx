"use client";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useEffect, useState } from "react";

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
  imageHeight?: string;
  imageAlign?: "center" | "bottom";
  top?: string;
  right?: string;
};

type UserInfoProps = {
  cardProps: UserInfoCardProps[];
};


export function UserInfoCard({ cardProps }: UserInfoProps) {
  const [today, setToday] = useState("");

  const { faculty_subject } = useFaculty();

  useEffect(() => {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    setToday(`${day}/${month}/${year}`);
  }, []);

  return (
    <div className="w-full relative bg-[#DAEEE3] rounded-2xl h-[170px] shadow-sm">
      {/* <div className="w-full relative bg-[#DAEEE3] rounded-2xl h-[170px] shadow-sm overflow-hidden"> */}
      {cardProps.map((item, index) => (
        <div
          className="relative z-10 flex h-full items-center px-8"
          key={index}
        >
          <div className="bg-blue-00 flex flex-col max-w-[65%] gap-2">
            <p className="text-xs text-[#282828] leading-tight">
              {item.show && "ID:"} {item.studentId}
              {item.show && ","} {item.studentBranch}
            </p>

            <p className="text-lg text-[#282828] leading-tight mt-3">
              Welcome Back,
            </p>

            <div className="bg-red-00 flex items-baseline flex-wrap gap-2">
              <h1 className="text-lg font-semibold text-[#089144] leading-tight">
                {!item.show && "Prof."} {item.user}
              </h1>
              <span className="text-[#454545] lg:ml-3 text-md font-medium">
                {faculty_subject.map(s => s.subjectName).join(", ")}
              </span>
              <p className="text-[#454545] italic text-sm font-medium">
                {item.show && "Parent of"}{" "}
                <span className="text-[#089144] font-semibold">
                  {item.studentName}
                </span>
              </p>
            </div>

            <p className="text-md text-[#454545] mt-0 font-medium">
              {!item.show && "Your Students Completed "}
              <span className="text-[#089144] font-bold">
                {item.studentsTaskPercentage}
                {!item.show && "%"}
              </span>{" "}
              {!item.show && "of the the tasks."}
            </p>
            <p className="text-sm text-[#454545] mt-0">
              {item.childPerformance}
            </p>
          </div>

          {item.image && (
            <img
              src={item.image}
              alt="User"
              className={`${item.imageHeight ?? "110px"} ${item.top} relative ${item.right}`}
            />
          )}

        </div>
      ))}

      <div className="absolute top-4 right-4 z-20">
        <div className="bg-gradient-to-b from-[#C1FFDC] to-[#028039] text-white px-2 py-1 rounded-lg font-semibold text-sm tracking-wide">
          {today ? today : "Loading..."}
        </div>
      </div>

      <svg
        className="absolute right-0 bottom-0 z-0 h-full w-auto"
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
