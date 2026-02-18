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

  const { collegeEducationType, collegeBranchCode, collegeAcademicYear, role } = useUser();
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
          {role === "Student" && (
            <p className="text-[#EFEFEF] text-sm font-medium">
              {collegeEducationType && collegeBranchCode
                ? `${collegeEducationType} ${collegeBranchCode}`
                : "—"} – {academicYearNumber ? `${academicYearNumber}` : "—"}
            </p>
          )}
          {role === "Faculty" && (
            <p className="text-[#EFEFEF] text-md font-medium">
              {college_branch ? `${college_branch}` : "—"}
            </p>
          )}

          {role === "Finance" && (
            <p className="text-[#EFEFEF] text-md font-medium">
              {college_branch ? `${college_branch}` : "B Tech"}
            </p>
          )}
        </div>
      )}

      <div
        className={`bg-white shadow-md h-[54px] rounded-lg flex items-center ${fullWidth ? "w-full" : "w-[49%]"
          }`}
      >
        <div className="w-[30%] h-full flex flex-col justify-center items-center rounded-l-lg bg-[#16284F]">
          <p className="text-xs text-[#EFEFEF] font-medium">{day}</p>
          <p className="text-xs text-[#FFFFFF]">{month}</p>
        </div>

        <div className="w-[70%] rounded-r-lg flex items-center justify-center">
          <p className="text-[#16284F] text-md font-semibold">{time}</p>
        </div>
      </div>
    </div>
  );
}
