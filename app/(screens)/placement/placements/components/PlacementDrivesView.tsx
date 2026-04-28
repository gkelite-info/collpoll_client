"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Buildings,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { PlacementDrive, PlacementDriveStat } from "./mockData";
import {
  fetchBranches,
  fetchEducations,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  filterPlacementDrives,
  getPlacementDriveStats,
  PlacementDriveStatusFilter,
} from "@/lib/helpers/placements/getPlacementDrives";

type EducationOption = {
  collegeEducationId: number;
  collegeEducationType: string;
};

type BranchOption = {
  collegeBranchId: number;
  collegeBranchType: string;
  collegeBranchCode: string;
};

type PlacementDrivesViewProps = {
  drives: PlacementDrive[];
  collegeId: number | null;
  isLoading?: boolean;
  // onCreateDrive is kept for easy restore when Create New Drive is enabled again.
  onCreateDrive?: () => void;
  onDriveClick: (driveId: number) => void;
};

const driveStatusOptions: PlacementDriveStatusFilter[] = [
  "All",
  "Active",
  "Completed",
];

const rowsPerPage = 10;

const CardSkeleton = () => (
  <div className="h-[120px] w-full animate-pulse rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm">
    <div className="mb-4 h-8 w-10 rounded bg-gray-200" />
    <div className="h-7 w-16 rounded bg-gray-300" />
    <div className="mt-3 h-4 w-28 rounded bg-gray-200" />
  </div>
);

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
          {Array.from({ length: 6 }).map((_, rowIndex) => (
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

export default function PlacementDrivesView({
  drives,
  collegeId,
  isLoading = false,
  onDriveClick,
}: PlacementDrivesViewProps) {
  const [driveStatus, setDriveStatus] =
    useState<PlacementDriveStatusFilter>("Active");
  const [educations, setEducations] = useState<EducationOption[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    { title: "Company Name", key: "companyName" },
    { title: "Drive Date", key: "date" },
    { title: "Branch", key: "branch" },
    { title: "All Students", key: "allStudents" },
    { title: "Action", key: "actions" },
  ];

  useEffect(() => {
    if (!collegeId) {
      setEducations([]);
      setSelectedEducationId(null);
      return;
    }

    let isMounted = true;

    const loadEducations = async () => {
      try {
        const data = (await fetchEducations(collegeId)) as EducationOption[];

        if (!isMounted) return;

        setEducations(data);
        setSelectedEducationId((current) => {
          if (current && data.some((item) => item.collegeEducationId === current)) {
            return current;
          }

          return data[0]?.collegeEducationId ?? null;
        });
      } catch (error) {
        console.error("Failed to fetch placement drive educations:", error);
        if (isMounted) {
          setEducations([]);
          setSelectedEducationId(null);
        }
      }
    };

    void loadEducations();

    return () => {
      isMounted = false;
    };
  }, [collegeId]);

  useEffect(() => {
    if (!collegeId || !selectedEducationId) {
      setBranches([]);
      setSelectedBranchId(null);
      return;
    }

    let isMounted = true;

    const loadBranches = async () => {
      try {
        const data = (await fetchBranches(
          collegeId,
          selectedEducationId,
        )) as BranchOption[];

        if (!isMounted) return;

        setBranches(data);
        setSelectedBranchId((current) => {
          if (current && data.some((item) => item.collegeBranchId === current)) {
            return current;
          }

          return null;
        });
      } catch (error) {
        console.error("Failed to fetch placement drive branches:", error);
        if (isMounted) {
          setBranches([]);
          setSelectedBranchId(null);
        }
      }
    };

    void loadBranches();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedEducationId]);

  const visibleDrives = useMemo(() => {
    return filterPlacementDrives({
      drives,
      educationId: selectedEducationId,
      branchId: selectedBranchId,
      status: driveStatus,
    });
  }, [driveStatus, drives, selectedBranchId, selectedEducationId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [driveStatus, selectedBranchId, selectedEducationId]);

  const totalPages = Math.ceil(visibleDrives.length / rowsPerPage);
  const paginatedDrives = useMemo(() => {
    const from = (currentPage - 1) * rowsPerPage;
    return visibleDrives.slice(from, from + rowsPerPage);
  }, [currentPage, visibleDrives]);

  const stats = useMemo<PlacementDriveStat[]>(
    () =>
      getPlacementDriveStats(
        filterPlacementDrives({
          drives,
          educationId: selectedEducationId,
          branchId: selectedBranchId,
          status: "All",
        }),
      ),
    [drives, selectedBranchId, selectedEducationId],
  );

  const tableData = useMemo(() => {
    return paginatedDrives.map((drive) => ({
      companyName: drive.companyName,
      date: drive.date,
      branch: drive.branch,
      allStudents: drive.eligibleStudents,
      actions: (
        <button
          type="button"
          onClick={() => onDriveClick(drive.id)}
          className="cursor-pointer border-b border-[#00A94A] font-medium text-[#00A94A]"
        >
          View
        </button>
      ),
    }));
  }, [onDriveClick, paginatedDrives]);

  const statIconStyles = [
    {
      icon: <Briefcase size={18} weight="fill" />,
      iconBg: "#FED7AA",
      iconColor: "#F97316",
    },
    {
      icon: <Buildings size={18} weight="fill" />,
      iconBg: "#A7F3D0",
      iconColor: "#059669",
    },
    {
      icon: <CheckCircle size={18} weight="fill" />,
      iconBg: "#BFDBFE",
      iconColor: "#2563EB",
    },
  ];

  const selectedEducation = educations.find(
    (education) => education.collegeEducationId === selectedEducationId,
  );

  return (
    <div className="space-y-4 mb-5">
      {/* Create New Drive button and query-routing functionality are commented out for now. */}
      {/* <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateDrive}
          disabled={isCreatingDrive}
          className="h-8 min-w-[132px] cursor-pointer rounded-lg bg-[#16284F] px-3 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCreatingDrive ? "Loading..." : "Create New Drive"}
        </button>
      </div> */}

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          stats.map((stat, index) => (
            <CardComponent
              key={stat.note}
              style={`w-full ${stat.cardClass}`}
              icon={statIconStyles[index]?.icon}
              value={
                <span className="text-[28px] font-semibold leading-none text-[#282828]">
                  {stat.value}
                </span>
              }
              label={stat.note}
              iconBgColor={statIconStyles[index]?.iconBg ?? "#A7F3D0"}
              iconColor={statIconStyles[index]?.iconColor ?? "#059669"}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#5C5C5C]">
        <label className="flex items-center gap-2">
          <span>Drive Status :</span>
          <span className="relative">
            <select
              value={driveStatus}
              onChange={(event) =>
                setDriveStatus(event.target.value as PlacementDriveStatusFilter)
              }
              className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none"
            >
              {driveStatusOptions.map((option) => (
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
          <span>Education Type :</span>
          <span className="relative">
            <select
              value={selectedEducationId ?? ""}
              onChange={(event) => {
                setSelectedEducationId(
                  event.target.value ? Number(event.target.value) : null,
                );
                setSelectedBranchId(null);
              }}
              className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none"
            >
              {educations.length === 0 && <option value="">Education</option>}
              {educations.map((education) => (
                <option
                  key={education.collegeEducationId}
                  value={education.collegeEducationId}
                >
                  {education.collegeEducationType}
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
          <span>Branch :</span>
          <span className="relative">
            <select
              value={selectedBranchId ?? ""}
              onChange={(event) =>
                setSelectedBranchId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              disabled={!selectedEducation}
              className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none disabled:opacity-60"
            >
              <option value="">All Branch</option>
              {branches.map((branch) => (
                <option key={branch.collegeBranchId} value={branch.collegeBranchId}>
                  {branch.collegeBranchCode || branch.collegeBranchType}
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
          <TableComponent columns={columns} tableData={tableData} height="43vh" />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
