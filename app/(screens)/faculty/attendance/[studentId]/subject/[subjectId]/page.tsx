"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SubjectAttendanceTable from "../../../components/subjectAttendanceTable";
import { getStudentAttendanceDetails } from "@/lib/helpers/faculty/attendance/getStudentAttendanceDetails";
import { getSubjectAttendanceDetails } from "@/lib/helpers/faculty/attendance/getSubjectAttendanceDetails";
import { CaretLeft } from "@phosphor-icons/react";
import StudentProfileCard from "../../../components/stuProfileCard";
import AiBotCard from "../../../components/aiBotCard";
import { useQuery } from "@tanstack/react-query";
import SubjectDetailsSkeleton from "../../shimmer/subjectDetailsSkeleton";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type SubjectAttendanceDetails = NonNullable<
  Awaited<ReturnType<typeof getSubjectAttendanceDetails>>
>;
type StudentAttendanceDetails = NonNullable<
  Awaited<ReturnType<typeof getStudentAttendanceDetails>>
>;

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const studentId = Array.isArray(params?.studentId)
    ? params.studentId[0]
    : params?.studentId;
  const subjectId = Array.isArray(params?.subjectId)
    ? params.subjectId[0]
    : params?.subjectId;

  const [filter, setFilter] = useState<"ALL" | "Present" | "Absent" | "Leave">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["subjectAttendanceDetails", studentId, subjectId, filter, page, limit],
    queryFn: () => getSubjectAttendanceDetails(studentId as string, subjectId as string, filter, page, limit),
    enabled: !!studentId && !!subjectId,
  });

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["studentAttendanceDetails", studentId],
    queryFn: () => getStudentAttendanceDetails(studentId as string),
    enabled: !!studentId,
  });

  const loading = dataLoading || studentLoading;

  if (loading) {
    return <SubjectDetailsSkeleton />;
  }

  if (!data || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Subject records not found.
      </div>
    );
  }

  const subjectSummary = {
    total: data.summary.totalClasses,
    present: data.summary.attended,
    absent: data.summary.absent,
    leave: data.summary.leave,
  };

  const filteredRecords = data.records;

  return (
    <main className="px-3 md:px-4 py-4 min-h-screen space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      <section className="flex items-center justify-between">
        <div className="flex text-black items-start gap-2">
          <button
            onClick={() => router.back()}
            className="mt-1 md:mt-0.5 text-gray-600 cursor-pointer hover:text-black shrink-0"
          >
            <CaretLeft
              size={24}
              className="md:w-[25px] md:h-[25px]"
              weight="bold"
            />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              Attendance
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
              Track, Verify and Manage Attendance Records.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <StudentProfileCard
            name={student.fullName}
            department={student.department}
            studentId={student.studentsId.toString()}
            phone={student.mobile}
            email={student.email}
            address={student.address}
            photo={student.photo || ""}
            isSubjectMode={true}
            subjectSummary={subjectSummary}
            activeFilter={filter}
            onFilterChange={(newFilter) => {
              setFilter(newFilter);
              setPage(1);
            }}
            attendanceDays={0}
            absentDays={0}
            leaveDays={0}
          />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <AiBotCard
            response={
              student.attendancePrompt ||
              "Attendance criteria will appear here once records are available."
            }
          />
        </div>
      </section>

      <section className="w-full overflow-hidden">
        <h2 className="text-base md:text-lg font-bold text-[#1A1C1E] mb-3 md:mb-4">
          Subject Detail View
        </h2>

        <div className="flex flex-wrap items-center gap-3 md:gap-x-8 md:gap-y-4 text-[11px] md:text-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-[10px] md:text-xs">
              Subject :
            </span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 md:px-4 md:py-1 rounded-full font-bold md:font-medium whitespace-nowrap">
              {data.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-[10px] md:text-xs">
              Faculty :
            </span>
            <span className="bg-[#E6F4FF] text-[#007AFF] px-3 py-1 md:px-4 md:py-1 rounded-full font-bold md:font-medium whitespace-nowrap">
              {data.facultyName}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <span className="text-[#64748B] font-medium uppercase tracking-wide text-[10px] md:text-xs shrink-0">
              Summary :
            </span>
            <span className="text-gray-700 font-medium bg-white md:bg-gray-50 px-2 md:px-3 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5 md:gap-2 flex-wrap sm:flex-nowrap min-w-0 text-[10px] md:text-sm">
              Held:{" "}
              <span className="font-bold md:font-medium">
                {data.summary.totalClasses}
              </span>
              <span className="text-gray-300">|</span>
              Present:{" "}
              <span className="text-green-600 font-bold md:font-medium">
                {data.summary.attended}
              </span>
              <span className="text-gray-300">|</span>
              Percent:{" "}
              <span className="text-blue-600 font-bold md:font-medium">
                {data.summary.percentage}%
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="w-full min-w-0">
        {filteredRecords.length > 0 ? (
          <SubjectAttendanceTable records={filteredRecords} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-medium">
            No attendance records found for the selected filter.
          </div>
        )}
        
        <div className="mt-6 flex justify-center mb-6">
          <Pagination
            currentPage={page}
            totalItems={data.totalCount}
            itemsPerPage={limit}
            onPageChange={setPage}
            alwaysShow={true}
          />
        </div>
      </section>
    </main>
  );
}
