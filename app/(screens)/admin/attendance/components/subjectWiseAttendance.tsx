"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { BookOpenText, Calendar, CaretLeft, CaretRight, User, UsersThree, } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AttendanceTable from "../tables/attendanceTable";
import CardComponent from "./cards";
import StudentAttendanceDetailsPage from "./stuSubjectWise";
import { fetchSectionStudents, fetchSubjectsByContext } from "@/lib/helpers/admin/attendance/fetchStudentsBySectionsAPI";
import toast from "react-hot-toast";
interface SubjectWiseAttendanceProps {
  onBack: () => void;
}

type SectionStudent = {
  studentId: number;
  fullName: string;
  email: string;
  attendance: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "CLASS_CANCEL" | "NA";
  reason: string;
  percentage: number;
  status: "Top" | "Good" | "Low";
};

export const SubjectWiseAttendance = ({ onBack }: SubjectWiseAttendanceProps) => {
  const STUDENTS_PER_PAGE = 10;
  const [students, setStudents] = useState<SectionStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [subjects, setSubjects] = useState<{ collegeSubjectId: number; subjectName: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch");
  const section = searchParams.get("section");
  const year = searchParams.get("year")
  const totalStudents = searchParams.get("students");
  const totalSubjects = searchParams.get("subjects");
  const below75 = searchParams.get("below75");
  const selectedStudentId = searchParams.get("studentId");
  const totalFaculties = searchParams.get("faculties");
  const collegeId = Number(searchParams.get("collegeId"));
  const collegeEducationId = Number(searchParams.get("collegeEducationId"));
  const collegeBranchId = Number(searchParams.get("collegeBranchId"));
  const collegeAcademicYearId = Number(searchParams.get("collegeAcademicYearId"));
  const collegeSectionsId = Number(searchParams.get("collegeSectionsId"));
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState({
    year: year ?? "",
    section: section ?? "",
    subject: ""
    // date: "12 Aug 2025",
  });

  useEffect(() => {
    if (
      !collegeId ||
      !collegeEducationId ||
      !collegeBranchId ||
      !collegeAcademicYearId ||
      !collegeSectionsId
    )
      return;
    loadStudents();
  }, [currentPage, selectedSubjectId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetchSectionStudents({
        collegeId,
        collegeEducationId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSectionsId,
        page: currentPage,
        limit: STUDENTS_PER_PAGE,
        collegeSubjectId: selectedSubjectId,
      });
      setStudents(res.data);
      setTotalRecords(res.totalCount);
    } catch (err: any) {
      toast.error(err?.message || "Unable to load students. Please refresh and try again.");
      setStudents([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [collegeSectionsId, collegeAcademicYearId, selectedSubjectId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId || !collegeBranchId || !collegeAcademicYearId) return;

    fetchSubjectsByContext({
      collegeId,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
    })
      .then(setSubjects)
      .catch(() => toast.error("Unable to load subjects"));
  }, [collegeAcademicYearId, collegeBranchId]);


  const closeStudentOverlay = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("studentId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openStudentDetail = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("studentId", id);
    router.push(`${pathname}?${params.toString()}`);
  };



  const handleAttendanceChange = (
    rollNo: string,
    status: "Present" | "Absent"
    // status: "Present" | "Absent" | "Leave" | "Cancel Class" | "Late"
  ) => {
    // setData((prev) =>
    //   prev.map((s) => (s.rollNo === rollNo ? { ...s, attendance: status } : s))
    // );
  };

  const handleViewDetails = (rollNo: string) => {
    console.log("View details for:", rollNo);
  };

  const filteredData = useMemo(() => {
    if (!students.length) return [];
    return students.map((s, index) => ({
      sNo: String((currentPage - 1) * STUDENTS_PER_PAGE + index + 1),
      rollNo: String(s.studentId),
      photo: `https://i.pravatar.cc/100?u=${s.email}`,
      name: s.fullName,
      attendance:
        s.attendance,
      percentage: s.percentage,
      reason: s.reason || "-",
      status: s.status,
    }));
  }, [students, currentPage]);


  const currentFilters = {
    year: "1 st year",
    section: "A",
    sem: "III",
    subject: "Data Structures",
    date: "12/10/2023",
  };

  if (selectedStudentId) {
    return (
      <StudentAttendanceDetailsPage
        manualId={selectedStudentId}
        onBack={closeStudentOverlay}
      />
    );
  }

  const cardData = [
    {
      id: "1",
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FFBB70",
      value: totalStudents || 0,
      label: "Total Students",
    },
    {
      id: "2",
      style: "bg-[#E6FBEA]",
      icon: <BookOpenText size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#43C17A",
      value: totalSubjects || 0,
      label: "Total Subjects",
    },
    {
      id: "3",
      style: "bg-[#FFE0E0] ",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#FF2020",
      value: below75 || 0,
      label: "Students below 75%",
    },
    {
      id: "4",
      style: "bg-[#CEE6FF]",
      icon: <User size={23} weight="fill" color="#EFEFEF" />,
      iconBgColor: "#60AEFF",
      value: totalFaculties || 0,
      label: "Total Faculties",
    },
  ];

  const totalPages = Math.ceil(totalRecords / STUDENTS_PER_PAGE);

  return (
    <div className="flex flex-col m-4 relative">
      <div className="mb-3 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit">
            <div
              className="flex items-center gap-2 group w-fit "
            >
              <CaretLeft
                size={20}
                weight="bold"
                onClick={onBack}
                className="text-[#2D3748] cursor-pointer hover:-translate-x-1 transition-transform"
              />
              <h1 className="text-xl font-bold text-[#282828]">
                {branch} Branch — Subject-wise Attendance
              </h1>
            </div>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            View attendance reports across the {branch} Branch.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>
      <div className="flex mb-3 items-center gap-3 bg-gray-100 rounded-md">
        <span
          onClick={onBack}
          className="text-green-500 text-sm font-medium cursor-pointer"
        >
          Attendance Overview
        </span>

        <svg className="w-4 h-4 fill-green-500" viewBox="0 0 24 24">
          <path d="M8 5l8 7-8 7" />
        </svg>

        <span className="text-slate-800 text-sm font-medium">
          {branch} Branch
        </span>
      </div>

      <div className="flex gap-4 w-full h-full mb-3">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            style={`${item.style} w-[156px] h-[156px]`}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            value={item.value}
            label={item.label}
          />
        ))}
        <div>
          <WorkWeekCalendar style="h-full w-[350px]" />
        </div>
      </div>

      {/* <div className="mt-3 overflow-hidden">
        <AttendanceTable
          data={filteredData}
          onViewDetails={(rollNo) => {
            const params = new URLSearchParams(searchParams);
            params.set("studentId", rollNo);
            router.push(`${pathname}?${params.toString()}`);
          }}
          filters={filters}
          onAttendanceChange={handleAttendanceChange}
        />
      </div> */}
      <div className="mt-3 overflow-hidden">
        <AttendanceTable
          data={filteredData}
          loading={loading}
          year={year}
          section={section}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
          onViewDetails={(rollNo) => {
            const params = new URLSearchParams(searchParams);
            params.set("studentId", rollNo);
            router.push(`${pathname}?${params.toString()}`);
          }}
          filters={filters}
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSubjectChange={(id) => {
            setSelectedSubjectId(id);
          }}
          onAttendanceChange={handleAttendanceChange}
        />
      </div>
    </div>
  );
};
