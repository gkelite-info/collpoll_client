"use client";

import { useMemo } from "react";
import { CaretDown } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { PlacementStudentRow } from "./mockData";

type StudentApplicationsViewProps = {
  students: PlacementStudentRow[];
};

export default function StudentApplicationsView({
  students,
}: StudentApplicationsViewProps) {
  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "year", key: "year" },
    { title: "Company", key: "company" },
    { title: "Role", key: "role" },
    { title: "Package", key: "package" },
    { title: "Joining Date", key: "joiningDate" },
  ];

  const tableData = useMemo(() => {
    return students.map((student) => ({
      studentName: student.studentName,
      studentId: student.studentId,
      branch: student.branch,
      year: student.year,
      company: student.company,
      role: student.role,
      package: student.package,
      joiningDate: student.joiningDate,
    }));
  }, [students]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[16px] font-semibold text-[#1A3765]">
          Total Students : 4,620
        </p>

        {/* Add Selected Student button and query-routing functionality are commented out for now. */}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#5C5C5C]">
        <div className="flex items-center gap-2">
          <span>Education Type :</span>
          <button className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            B Tech
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Branch :</span>
          <button className="flex items-center gap-1 rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            CSE <CaretDown size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Year :</span>
          <button className="flex items-center gap-1 rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            3rd Year <CaretDown size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Company :</span>
          <button className="flex items-center gap-1 rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            All <CaretDown size={14} />
          </button>
        </div>
      </div>

      <TableComponent columns={columns} tableData={tableData} height="48vh" />
    </div>
  );
}
