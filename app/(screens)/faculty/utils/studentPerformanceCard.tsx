import { CaretRight } from "@phosphor-icons/react";
import Router from "next/router";
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

const StudentRow: React.FC<{ student: StudentPerformance }> = ({ student }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 mr-4 bg-gray-200">
        <img
          src={student.imageUrl}
          alt={student.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 font-medium text-gray-800 text-xs">
        {student.name}
      </div>

      <div className="flex items-center ml-4 w-[180px]">
        <div className="h-2 bg-[#16284F] rounded-full flex-1 overflow-hidden mr-3 relative">
          <div
            className="h-full bg-emerald-500 rounded-full absolute left-0 top-0 transition-all duration-500 ease-out"
            style={{ width: `${student.percentage}%` }}
          ></div>
        </div>

        <span className="text-gray-700 font-medium text-sm w-8 text-right">
          {student.percentage}%
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
        className={`bg-white rounded-2xl shadow-lg p-6 w-full max-w-[420px] font-sans flex flex-col`}
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

        <div className="flex flex-col overflow-y-auto custom-scrollbar max-h-[355px]">
          {students.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
        </div>
      </div>
    </>
  );
}
