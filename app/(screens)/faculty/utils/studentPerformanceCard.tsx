import { CaretRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/utils/Avatar";
import React, { useEffect, useRef } from "react";
import type { FacultyStudentProgressRow } from "@/lib/helpers/faculty/studentProgress/getFacultyStudentProgressSummary";

interface StudentPerformanceCardProps {
  students: FacultyStudentProgressRow[];
  loading: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const StudentPerformanceShimmer = () => (
  <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0 gap-3 md:gap-4 animate-pulse">
    <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200" />
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="flex items-center gap-3 w-full mt-1">
        <div className="h-1.5 md:h-2 w-full bg-gray-200 rounded-full" />
        <div className="h-3 w-8 bg-gray-200 rounded shrink-0" />
      </div>
    </div>
  </div>
);

const StudentRow: React.FC<{ student: FacultyStudentProgressRow }> = ({ student }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0 gap-3 md:gap-4">
      <div className="w-10 h-10 shrink-0 overflow-hidden rounded-full border border-gray-100">
        <Avatar src={student.profileUrl} size={40} alt={student.studentName} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h4
          className="text-[13px] md:text-sm font-semibold text-gray-800 truncate"
          title={student.studentName}
        >
          {student.studentName}
        </h4>
        <span
          className="text-[10px] md:text-[11px] text-gray-500 font-medium truncate"
          title={student.sectionName ? `${student.rollNo} | ${student.sectionName}` : student.rollNo}
        >
          {student.sectionName ? `${student.rollNo} | Section - ${student.sectionName}` : student.rollNo}
        </span>
        <div className="flex items-center gap-3 w-full mt-1.5">
          <div className="h-1.5 md:h-2 w-full bg-[#16284F] rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-[#43C17A] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${student.progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] md:text-xs font-bold text-gray-700 w-8 text-right shrink-0">
            {student.progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default function StudentPerformanceCard({
  students,
  loading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: StudentPerformanceCardProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      e.currentTarget.clientHeight + 10;
    if (bottom && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (!scrollRef.current || !hasNextPage || isFetchingNextPage || loading) return;

    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight <= clientHeight + 5 && fetchNextPage) {
          fetchNextPage();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [students, hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

  return (
    <>
      <div
        className={`bg-white relative overflow-hidden rounded-2xl shadow-lg p-5 lg:p-6 w-full h-full font-sans flex flex-col min-h-0`}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base lg:text-lg font-bold text-gray-900">
            My Students Performance
          </h2>
          <button
            onClick={() => router.push("/faculty/student-progress")}
            className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <CaretRight weight="bold" size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex flex-col overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2 lg:pr-3"
          onScroll={handleScroll}
        >
          {loading && students.length === 0 ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <StudentPerformanceShimmer key={`shimmer-init-${i}`} />
              ))}
            </>
          ) : (
            <>
              {students.map((student) => (
                <StudentRow key={`${student.studentId}`} student={student} />
              ))}
              {students.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  No student performance data available.
                </div>
              )}
              {isFetchingNextPage && (
                <>
                  {[1, 2, 3].map((i) => (
                    <StudentPerformanceShimmer key={`shimmer-next-${i}`} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
