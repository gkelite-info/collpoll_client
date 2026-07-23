"use client";
import { useState, useEffect } from "react";
import { useUser } from "./context/UserContext";
import { extractAcademicYearNumber } from "./academicYear";
import { useFaculty } from "./context/faculty/useFaculty";

type Props = {
  style?: string;
  isVisibile?: boolean;
  department?: string;
  degree?: string;
  year?: string;
  fullWidth?: boolean;
};

export default function CourseScheduleCard({
  style = "",
  isVisibile = true,
  fullWidth = false,
}: Props) {
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const {
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    role,
    loading,
  } = useUser();
  const academicYearNumber = extractAcademicYearNumber(collegeAcademicYear);
  const { college_branch } = useFaculty();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      setTime(`${String(hours).padStart(2, "0")}:${minutes} ${ampm}`);
      setDay(String(now.getDate()).padStart(2, "0"));
      setMonth(now.toLocaleString("en-US", { month: "short" }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex ${isVisibile ? "justify-between" : "justify-end"
        } ${style} ${fullWidth ? "w-full flex-shrink-0" : ""}`}
    >
      {isVisibile && (
        <div className="bg-[#43C17A] w-[49%] h-[54px] shadow-md rounded-lg p-3 flex items-center justify-center">
          {loading ? (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-white/40" />
              <div className="h-2.5 w-14 animate-pulse rounded bg-white/30" />
            </div>
          ) : role === "Student" ? (
            <p className="text-[#EFEFEF] text-sm font-medium">
              {collegeEducationType && collegeBranchCode
                ? `${collegeEducationType} ${collegeBranchCode}`
                : "—"} – {academicYearNumber ? `${academicYearNumber}` : "—"}
            </p>
          ) : role === "Faculty" ? (
            <p className="text-[#EFEFEF] text-md font-medium">
              {college_branch ? `${college_branch}` : "—"}
            </p>
          ) : role === "Finance" || role === "FinanceManager" ? (
            <p className="text-[#EFEFEF] text-md font-medium">
              {collegeEducationType ? `${collegeEducationType}` : "—"}
            </p>
          ) : role === "CollegeHr" ? (
            <p className="text-[#EFEFEF] text-md font-medium">
              {collegeEducationType ? `${collegeEducationType}` : "College HR"}
            </p>
          ) : (
            <div className="h-3.5 w-20 rounded bg-white/30" />
          )}
        </div>
      )}

      <div
        className={`bg-white shadow-md h-[54px] rounded-lg flex items-center ${
          fullWidth ? "w-full" : isVisibile ? "w-[49%]" : "w-[150px]"
        }`}
      >
        <div className="w-[30%] h-full flex flex-col justify-center items-center rounded-l-lg bg-[#16284F]">
          {day && month ? (
            <>
              <p className="text-xs text-[#EFEFEF] font-medium">{day}</p>
              <p className="text-xs text-[#FFFFFF]">{month}</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-3 w-5 animate-pulse rounded bg-white/40" />
              <div className="h-2.5 w-7 animate-pulse rounded bg-white/30" />
            </div>
          )}
        </div>

        <div className="w-[70%] rounded-r-lg flex items-center justify-center">
          {time ? (
            <p className="text-[#16284F] text-md font-semibold">{time}</p>
          ) : (
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          )}
        </div>
      </div>
    </div>
  );
}
