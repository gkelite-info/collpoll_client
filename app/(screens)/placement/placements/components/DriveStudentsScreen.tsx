"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { PlacementDrive, PlacementStudentRow } from "./mockData";
import {
  fetchAcademicYears,
  fetchBranches,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import { fetchPlacementDriveStudents } from "@/lib/helpers/placements/getPlacementDrives";

type DriveStudentsScreenProps = {
  drive: PlacementDrive;
  onBack: () => void;
};

type PlacementDriveWithEducation = PlacementDrive & {
  educationType?: string | null;
  educationTypeName?: string | null;
  collegeEducationType?: string | null;
};

type AcademicYearOption = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
};

type BranchOption = {
  collegeBranchId: number;
  collegeBranchType: string;
  collegeBranchCode: string;
};

const studentFilterOptions = [
  "All Students",
  "Eligible",
  "Applied",
  "Placed",
  "Rejected",
] as const;

type StudentFilter = (typeof studentFilterOptions)[number];

const rowsPerPage = 10;

const TableSkeleton = ({
  columns,
}: {
  columns: { title: string; key: string }[];
}) => (
  <div className="mt-2 w-full animate-pulse">
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-md">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4 text-left">
                <div className="h-4 w-24 rounded bg-gray-300" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              {columns.map((column, columnIndex) => (
                <td key={column.key} className="px-6 py-4">
                  <div
                    className={`h-4 rounded bg-gray-200 ${
                      columnIndex === 0 ? "w-3/4" : "w-1/2"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 mb-4 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
          currentPage === 1
            ? "border-gray-200 text-gray-300"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
      >
        <CaretLeft size={18} weight="bold" />
      </button>

      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPageChange(index + 1)}
          className={`h-10 w-10 rounded-lg font-semibold ${
            currentPage === index + 1
              ? "bg-[#16284F] text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-300"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
      >
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  );
}

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
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(drive.collegeAcademicYearId ?? null);
  const [students, setStudents] = useState<PlacementStudentRow[]>(
    drive.students,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(drive.eligibleStudents || 0);
  const branchLabel = getBranchLabel(drive);
  const canLoadDynamicStudents = Boolean(
    drive.collegeId &&
      drive.collegeEducationId &&
      drive.collegeBranchId &&
      drive.placementCompanyIds?.length,
  );
  const selectedBranchId =
    branchFilter === "All" ? drive.collegeBranchId ?? null : Number(branchFilter);

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: branchLabel, key: "branch" },
    { title: "Year", key: "year" },
    { title: "Role", key: "role" },
    { title: "Status", key: "status" },
    { title: "Package", key: "package" },
  ];

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [branchFilter, selectedAcademicYearId, studentFilter]);

  useEffect(() => {
    if (!drive.collegeId || !drive.collegeEducationId) {
      setBranches([]);
      setBranchFilter("All");
      return;
    }

    let isMounted = true;

    const loadBranches = async () => {
      try {
        const data = (await fetchBranches(
          drive.collegeId!,
          drive.collegeEducationId!,
        )) as BranchOption[];

        if (!isMounted) return;

        setBranches(data);
        setBranchFilter((current) => {
          if (
            current !== "All" &&
            data.some((branch) => branch.collegeBranchId === Number(current))
          ) {
            return current;
          }

          return "All";
        });
      } catch (error) {
        console.error("Failed to fetch placement drive branches:", error);
        if (isMounted) setBranches([]);
      }
    };

    void loadBranches();

    return () => {
      isMounted = false;
    };
  }, [drive.collegeEducationId, drive.collegeId]);

  useEffect(() => {
    if (!drive.collegeId || !drive.collegeEducationId || !drive.collegeBranchId) {
      setAcademicYears([]);
      return;
    }

    let isMounted = true;

    const loadAcademicYears = async () => {
      try {
        const data = (await fetchAcademicYears(
          drive.collegeId!,
          drive.collegeEducationId!,
          selectedBranchId!,
        )) as AcademicYearOption[];

        if (!isMounted) return;

        setAcademicYears(data);
        setSelectedAcademicYearId((current) => {
          if (current && data.some((year) => year.collegeAcademicYearId === current)) {
            return current;
          }

          if (
            drive.collegeAcademicYearId &&
            data.some(
              (year) => year.collegeAcademicYearId === drive.collegeAcademicYearId,
            )
          ) {
            return drive.collegeAcademicYearId;
          }

          return data[0]?.collegeAcademicYearId ?? null;
        });
      } catch (error) {
        console.error("Failed to fetch placement drive years:", error);
        if (isMounted) setAcademicYears([]);
      }
    };

    void loadAcademicYears();

    return () => {
      isMounted = false;
    };
  }, [
    drive.collegeAcademicYearId,
    drive.collegeEducationId,
    drive.collegeId,
    selectedBranchId,
  ]);

  useEffect(() => {
    if (!canLoadDynamicStudents || !selectedAcademicYearId || !selectedBranchId) {
      setStudents(drive.students);
      return;
    }

    let isMounted = true;

    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPlacementDriveStudents({
          collegeId: drive.collegeId!,
          collegeEducationId: drive.collegeEducationId!,
          collegeBranchId: selectedBranchId,
          collegeAcademicYearId: selectedAcademicYearId,
          placementCompanyIds: drive.placementCompanyIds!,
          companyName: drive.companyName,
          role: drive.role || drive.driveName,
          packageDetails: drive.packageDetails || "-",
          page: currentPage,
          limit: rowsPerPage,
        });

        if (isMounted) {
          setStudents(data.students);
          setTotalRecords(data.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch placement drive students:", error);
        if (isMounted) {
          setStudents([]);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadStudents();

    return () => {
      isMounted = false;
    };
  }, [
    canLoadDynamicStudents,
    currentPage,
    drive,
    selectedAcademicYearId,
    selectedBranchId,
  ]);

  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      id: String(branch.collegeBranchId),
      label: branch.collegeBranchCode || branch.collegeBranchType,
    }));
  }, [branches]);

  const tableData = useMemo(() => {
    return students
      .filter((student) => matchesStudentFilter(student, studentFilter))
      .filter(
        (student) =>
          branchFilter === "All" ||
          branchOptions.find((branch) => branch.id === branchFilter)?.label ===
            student.branch,
      )
      .map((student) => ({
        studentName: student.studentName,
        studentId: student.studentId,
        branch: student.branch,
        year: student.year,
        role: student.role,
        status: student.status,
        package: student.package,
      }));
  }, [branchFilter, branchOptions, students, studentFilter]);

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
            {/* <span className="text-[#43C17A]">(Total: {tableData.length})</span> */}
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
                  <option key={branch.id} value={branch.id}>
                    {branch.label}
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
            <span>Year :</span>
            <span className="relative">
              <select
                value={selectedAcademicYearId ?? ""}
                onChange={(event) =>
                  setSelectedAcademicYearId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                disabled={academicYears.length === 0}
                className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none disabled:opacity-60"
              >
                {academicYears.length === 0 && <option value="">Year</option>}
                {academicYears.map((year) => (
                  <option
                    key={year.collegeAcademicYearId}
                    value={year.collegeAcademicYearId}
                  >
                    {year.collegeAcademicYear}
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

        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <>
            <TableComponent columns={columns} tableData={tableData} height="70vh" />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
