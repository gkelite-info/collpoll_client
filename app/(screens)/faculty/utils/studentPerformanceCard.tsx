import { CaretRight } from "@phosphor-icons/react";
import React from "react";
import { useRouter } from "next/navigation";

export interface StudentPerformance {
  id: string;
  name: string;
  imageUrl: string;
  percentage: number;
}

interface StudentPerformanceCardProps {
  students: StudentPerformance[];
}

export const DefaultAvatar = () => (
  <div className="w-10 h-10 rounded-full border border-[#43C17A] bg-gray-200 flex items-center justify-center text-gray-400">
    <svg
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

const StudentRow: React.FC<{ student: StudentPerformance, number: number }> = ({ student, number }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="mr-4 shrink-0">
        <DefaultAvatar />
      </div>

      <div className="flex-1 font-medium text-gray-800 text-xs">
        Student {number + 1}
      </div>

      <div className="flex items-center ml-4 w-[180px]">
        <div className="h-2 bg-[#16284F] rounded-full flex-1 overflow-hidden mr-3 relative">
          <div
            className="h-full bg-emerald-500 rounded-full absolute left-0 top-0 transition-all duration-500 ease-out"
            style={{ width: `${0}%` }}
          ></div>
        </div>

        <span className="text-gray-700 font-medium text-sm w-8 text-right">
          {0}%
        </span>
      </div>
    </div>
  );
};

export default function studentPerformanceCard({
  students,
}: StudentPerformanceCardProps) {
  const router = useRouter();

  return (
    <>
      <div
        className={`bg-white relative overflow-hidden rounded-2xl shadow-lg p-6 w-full lg:max-w-[420px] font-sans flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            My Students Performance
          </h2>
          <button
            onClick={() => router.push("/faculty/student-progress")}
            className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <CaretRight weight="bold" size={20} />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto custom-scrollbar max-h-[355px] pr-3 md:pr-3 lg:pr-2">
          {students.map((student, index) => (
            <StudentRow key={student.id} student={student} number={index} />
          ))}
        </div>
      </div>
    </>
  );
}
