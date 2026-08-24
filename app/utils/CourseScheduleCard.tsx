"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { extractAcademicYearNumber } from "@/app/utils/academicYear";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useAssignedAdminEducationTypes } from "@/app/(screens)/admin/my-attendance/useAssignedAdminEducationTypes";

type Props = {
  style?: string;
  isVisibile?: boolean;
  department?: string;
  degree?: string;
  year?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
};

const formatSchoolClass = (year?: string) => {
  if (!year) return "";
  const num = Number(year);
  if (isNaN(num)) return year; 
  const j = num % 10,
        k = num % 100;
  if (j === 1 && k !== 11) {
      return num + "st Class";
  }
  if (j === 2 && k !== 12) {
      return num + "nd Class";
  }
  if (j === 3 && k !== 13) {
      return num + "rd Class";
  }
  return num + "th Class";
};

export default function CourseScheduleCard({
  style = "",
  isVisibile = true,
  fullWidth = false,
  department,
  degree,
  year,
  isLoading = false,
}: Props) {
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const {
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    role,
    adminId,
    loading: userLoading,
  } = useUser();
  const assignedAdminEducationTypes = useAssignedAdminEducationTypes(
    role === "Admin" ? adminId : null,
    collegeEducationType || "",
  );
  const academicYearNumber = extractAcademicYearNumber(collegeAcademicYear);
  const { college_branch, faculty_edu_type, sections, selectedSectionIndex, loading: facultyLoading } = useFaculty();

  const loading = isLoading || userLoading || facultyLoading;

  let displayEducation = collegeEducationType;
  let displayBranch = collegeBranchCode || college_branch;
  const isSchool = isSchoolEducation(collegeEducationType);

  if (role === "Faculty") {
    if (department || degree || year) {
      if (isSchool || (degree && degree.toLowerCase().includes("school"))) {
        displayBranch = year ? formatSchoolClass(year) : (displayEducation || "");
      } else {
        displayBranch = department || degree || displayEducation || "";
      }
    } else if (sections && sections.length > 0) {
      const activeSection = sections[selectedSectionIndex];
      if (activeSection) {
        displayBranch = activeSection.college_branch?.collegeBranchCode || college_branch || "";
        displayEducation = faculty_edu_type || collegeEducationType || "";
      }
    }
  }

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
            <p className="text-[#EFEFEF] text-md font-medium text-center">
              {displayEducation || "—"}
            </p>
          ) : role === "Admin" ? (
            <p className="max-w-full break-words text-center text-sm font-medium leading-tight text-[#EFEFEF]" title={assignedAdminEducationTypes}>
              {assignedAdminEducationTypes || "—"}
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
            <p className="text-[#EFEFEF] text-md font-medium text-center">
              {collegeEducationType || displayEducation || "—"}
            </p>
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
