"use client";

import { useMemo, useState } from "react";
import { CaretDown, CaretLeft } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { PlacementDrive, PlacementStudentRow } from "./mockData";

type DriveStudentsScreenProps = {
  drive: PlacementDrive;
  onBack: () => void;
};

type PlacementDriveWithEducation = PlacementDrive & {
  educationType?: string | null;
  educationTypeName?: string | null;
  collegeEducationType?: string | null;
};

const rowsPerPage = 8;
const studentFilterOptions = [
  "All Students",
  "Eligible",
  "Applied",
  "Placed",
  "Rejected",
] as const;

type StudentFilter = (typeof studentFilterOptions)[number];

function getNormalizedStatus(student: PlacementStudentRow) {
  return student.status.trim().toLowerCase();
}

function matchesStudentFilter(
  student: PlacementStudentRow,
  filter: StudentFilter,
) {
  const status = getNormalizedStatus(student);

  if (filter === "All Students") return true;
  if (filter === "Eligible") {
    return !["rejected", "not eligible"].includes(status);
  }
  if (filter === "Applied") return status === "applied";
  if (filter === "Placed") return ["placed", "joined"].includes(status);
  return status === "rejected";
}

function getBranchLabel(drive: PlacementDriveWithEducation) {
  const educationText = [
    drive.educationType,
    drive.educationTypeName,
    drive.collegeEducationType,
    drive.branch,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return educationText.includes("degree") ? "Group" : "Branch";
}

export default function DriveStudentsScreen({
  drive,
  onBack,
}: DriveStudentsScreenProps) {
  const [studentFilter, setStudentFilter] =
    useState<StudentFilter>("All Students");
  const [branchFilter, setBranchFilter] = useState("All");
  const branchLabel = getBranchLabel(drive);

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: branchLabel, key: "branch" },
    { title: "Year", key: "year" },
    { title: "Role", key: "role" },
    { title: "Package", key: "package" },
  ];

  const branchOptions = useMemo(() => {
    return Array.from(
      new Set(drive.students.map((student) => student.branch).filter(Boolean)),
    );
  }, [drive.students]);

  const tableData = useMemo(() => {
    return drive.students
      .filter((student) => matchesStudentFilter(student, studentFilter))
      .filter(
        (student) => branchFilter === "All" || student.branch === branchFilter,
      )
      .slice(0, rowsPerPage)
      .map((student) => ({
        studentName: student.studentName,
        studentId: student.studentId,
        branch: student.branch,
        year: student.year,
        role: student.role,
        package: student.package,
      }));
  }, [branchFilter, drive.students, studentFilter]);

  return (
    <section className="min-h-screen overflow-y-auto px-2 pb-4">
      <div className="m-2 p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D7D7D7] text-[#333] hover:bg-gray-50"
            aria-label="Back"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <h2 className="text-lg font-semibold text-[#16284F]">
            Drive List in {drive.companyName}{" "}
            {/* <span className="text-[#43C17A]">(Total: 42)</span> */}
          </h2>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-[14px] text-[#5C5C5C]">
          <label className="flex items-center gap-2">
            <span>Filter :</span>
            <span className="relative">
              <select
                value={studentFilter}
                onChange={(event) =>
                  setStudentFilter(event.target.value as StudentFilter)
                }
                className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none"
              >
                {studentFilterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <CaretDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A]"
              />
            </span>
          </label>

          <label className="flex items-center gap-2">
            <span>{branchLabel} :</span>
            <span className="relative">
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none"
              >
                <option value="All">All {branchLabel}</option>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <CaretDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A]"
              />
            </span>
          </label>
        </div>

        <TableComponent columns={columns} tableData={tableData} height="70vh" />
      </div>
    </section>
  );
}
