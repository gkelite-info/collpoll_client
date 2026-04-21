"use client";

import { useMemo } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { PlacementDrive } from "./mockData";

type DriveStudentsScreenProps = {
  drive: PlacementDrive;
  onBack: () => void;
};

const rowsPerPage = 8;

export default function DriveStudentsScreen({
  drive,
  onBack,
}: DriveStudentsScreenProps) {
  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "year", key: "year" },
    { title: "Role", key: "role" },
    { title: "Package", key: "package" },
    { title: "Joining Date", key: "joiningDate" },
    { title: "Status", key: "status" },
  ];

  const tableData = useMemo(() => {
    return Array.from({ length: rowsPerPage }, (_, index) => {
      const student = drive.students[index % drive.students.length];
      return {
        studentName: student.studentName,
        studentId: student.studentId,
        branch: student.branch,
        year: student.year,
        role: student.role,
        package: student.package,
        joiningDate: student.joiningDate,
        status: student.status,
      };
    });
  }, [drive.students]);

  return (
    <section className="min-h-screen overflow-y-auto px-2 pb-4">
      <div className="m-2 p-6">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D7D7D7] text-[#333] hover:bg-gray-50"
            aria-label="Back"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <h2 className="text-lg font-semibold text-[#16284F]">
            Students Placed in {drive.companyName}{" "}
            <span className="text-[#43C17A]">(Total: 42)</span>
          </h2>
        </div>

        <TableComponent columns={columns} tableData={tableData} height="70vh" />
      </div>
    </section>
  );
}
