"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import { getSubjectAttendanceDetails } from "@/lib/helpers/faculty/attendance/getSubjectAttendanceDetails";
import StudentProfileCard from "@/app/(screens)/faculty/attendance/components/stuProfileCard";
import AiBotCard from "@/app/(screens)/faculty/attendance/components/aiBotCard";
import SubjectAttendanceTable from "@/app/(screens)/faculty/attendance/components/subjectAttendanceTable";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import SubjectDetailShimmer from "./shimmer";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type StudentAttendanceDetails = Awaited<
  ReturnType<typeof getStudentAttendanceDetails>
>;
type SubjectAttendanceDetails = Awaited<
  ReturnType<typeof getSubjectAttendanceDetails>
>;

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter()
  
  const { collegeEducationType } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);

  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;
  const subjectId = Array.isArray(params?.subjectId)
    ? params.subjectId[0]
    : params?.subjectId;

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">("ALL");
  const [data, setData] = useState<SubjectAttendanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentAttendanceDetails | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    if (!studentId || !subjectId) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      const [attendanceRes, studentRes] = await Promise.allSettled([
        getSubjectAttendanceDetails(studentId, subjectId, filter, currentPage, itemsPerPage),
        getStudentAttendanceDetails(studentId),
      ]);

      if (!isMounted) return;

      if (attendanceRes.status === "fulfilled") {
        setData(attendanceRes.value);
      }

      if (studentRes.status === "fulfilled") {
        setStudent(studentRes.value);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [studentId, subjectId, filter, currentPage, itemsPerPage]);

  if (loading) {
    return <SubjectDetailShimmer />;
  }

  if (!data || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Subject records not found.
      </div>
    );
  }

  const leaveCount = data.summary.leave;

  const subjectSummary = {
    total: data.summary.totalClasses,
    present: data.summary.attended,
    absent: data.summary.absent,
    leave: leaveCount,
  };

  const filteredRecords = data.records;

  return (
    <main className="px-4 py-4 min-h-screen space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <CaretLeftIcon className="h-6 w-6 -ml-1 cursor-pointer mr-1 text-[#282828]" onClick={() => router.back()} />
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track, Verify and manage attendance records.
          </p>
        </div>
        <CourseScheduleCard style="w-[320px]" isVisibile={false} />
      </section>

      <section className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentProfileCard
            name={student.fullName}
            department={student.department}
            studentId={student.studentsId.toString()}
            phone={student.mobile}
            email={student.email}
            address={student.address}
            photo={student.photo || ""}
            isSchool={isSchool}
            isSubjectMode={true}
            subjectSummary={subjectSummary}
            activeFilter={filter}
            onFilterChange={setFilter}
            attendanceDays={0}
            absentDays={0}
            leaveDays={0}
          />
        </div>

        <div className="lg:col-span-1">
          <AiBotCard
            response={
              student.attendancePrompt ||
              "Attendance criteria will appear here once records are available."
            }
          />
        </div>
      </section>

      <section className="">
        <h2 className="text-lg font-bold text-[#1A1C1E] mb-4">
          Subject Detail View
        </h2>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-4 py-1 rounded-full font-medium">
              {data.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Faculty :
            </span>
            <span className="bg-[#E6F4FF] text-[#007AFF] px-4 py-1 rounded-full font-medium">
              {data.facultyName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-xs">
              Summary :
            </span>
            <span className="text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
              Held:{" "}
              <span className="font-medium">{data.summary.totalClasses}</span>
              <span className="mx-2 text-gray-300">|</span>
              Present:{" "}
              <span className="text-green-600 font-medium">
                {data.summary.attended}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              Percentage:{" "}
              <span className="text-blue-600 font-medium">
                {data.summary.percentage}%
              </span>
            </span>
          </div>
        </div>
      </section>

      <section>
        <SubjectAttendanceTable records={filteredRecords} />
        <div className="flex justify-center items-center mt-2 w-full rounded-lg shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalItems={data.totalCount ?? 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemsPerPageOptions={[10, 20, 50, 100]}
            onItemsPerPageChange={(newLimit) => {
              setItemsPerPage(newLimit);
              setCurrentPage(1);
            }}
            roundedBottom="rounded-lg"
          />
        </div>
      </section>
    </main>
  );
}
