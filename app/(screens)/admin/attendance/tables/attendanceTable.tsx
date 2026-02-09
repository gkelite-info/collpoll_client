"use client";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
export interface StudentRecord {
  sNo: string;
  rollNo: string;
  photo: string;
  name: string;
  attendance: | "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "CLASS_CANCEL" | "NA";
  percentage: number;
  reason: string;
  status: "Top" | "Good" | "Low";
}

const attendanceMeta = {
  PRESENT: { label: "Present", cls: "bg-[#E1F7EC] text-[#3EAD6F]" },
  LATE: { label: "Late", cls: "bg-[#FFF4D6] text-[#FFB800]" },
  ABSENT: { label: "Absent", cls: "bg-[#FFE5E5] text-[#FF5C5C]" },
  LEAVE: { label: "Leave", cls: "bg-[#E6F0FF] text-[#3B82F6]" },
  CLASS_CANCEL: { label: "Cancelled", cls: "bg-[#F1F1F1] text-[#6B7280]" },
  NA: { label: "N/A", cls: "bg-[#F1F1F1] text-[#6B7280]" },
} as const;

export interface AttendanceTableProps {
  data: StudentRecord[];
  loading: boolean;
  year: string | null;
  section : string | null;
  subjects: {
    collegeSubjectId: number;
    subjectName: string;
  }[];

  selectedSubjectId: number | null;
  onSubjectChange: (id: number | null) => void;
  filters: {
    year: string;
    section: string;
    // date: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onViewDetails: (id: string) => void;
  onAttendanceChange: (id: string, s: "Present" | "Absent") => void;
}

const statusCls = {
  Top: "text-[#3EAD6F]",
  Good: "text-[#FFB800]",
  Low: "text-[#FF5C5C]",
} as const;

const FilterBadge = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-gray-500 text-xs font-medium">{label}</span>
    <button className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E1F7EC] text-[#3EAD6F] hover:bg-[#d4f2e3] transition-colors">
      <span className="text-[11px] font-bold whitespace-nowrap">{value}</span>
      {/* <CaretDown size={11} weight="bold" /> */}
    </button>
  </div>
);

const Row = ({ s, onViewDetails, onAttendanceChange, }: { s: StudentRecord; onViewDetails: (id: string) => void; onAttendanceChange: (id: string, st: "Present" | "Absent") => void; }) => {
  const present = s.attendance === "PRESENT" || s.attendance === "LATE";
  const meta = attendanceMeta[s.attendance];

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="py-2.5 px-4 text-xs text-[#454545] font-medium">
        {s.sNo}
      </td>

      <td className="py-2.5 px-3 text-xs font-medium">
        <span className="text-[#3EAD6F] font-bold">ID</span>
        <span className=" text-[#454545]"> - {s.rollNo}</span>
      </td>

      <td className="py-2.5 px-3">
        <img
          src={s.photo}
          alt=""
          className="w-8 h-8 rounded-full object-cover shadow-sm"
        />
      </td>

      <td className="py-2.5 px-3 text-xs font-medium text-[#454545]">
        {s.name}
      </td>

      {/* <td className="py-2.5 px-3">
        <button
          onClick={() =>
            onAttendanceChange(s.rollNo, present ? "Absent" : "Present")
          }
          className={`mx-auto flex items-center justify-between gap-1.5 px-2 py-0.5 rounded-md w-24 text-xs font-bold ${present
              ? "bg-[#E1F7EC] text-[#3EAD6F]"
              : "bg-[#FFE5E5] text-[#FF5C5C]"
            }`}
        >
          {s.attendance}
          <CaretDown size={11} weight="bold" />
        </button>
      </td> */}

      <td className="py-2.5 px-3">
        <button
          className={`mx-auto flex items-center justify-between gap-1.5 px-2 py-0.5 rounded-md w-28 text-xs font-bold ${meta.cls}`}
        >
          {meta.label}
          <CaretDown size={11} weight="bold" />
        </button>
      </td>

      <td className="py-2.5 px-3 text-xs text-center font-medium text-[#454545]">
        {s.percentage}%
      </td>

      <td className="py-2.5 px-3 text-xs text-center text-[#454545] font-medium">
        {s.reason}
      </td>

      <td className="py-2.5 px-3 text-center">
        <span className={`text-xs font-bold ${statusCls[s.status]}`}>
          {s.status}
        </span>
      </td>

      <td className="py-2.5 px-3 text-center">
        <button
          onClick={() => onViewDetails(s.rollNo)}
          className="text-xs font-medium text-[#454545] hover:text-black hover:underline underline-offset-4"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};



/* ---------- Main ---------- */
export default function AttendanceTable({
  data,
  filters,
  year,
  section,
  onViewDetails,
  onAttendanceChange,
  loading,
  pagination,
  subjects,
  selectedSubjectId,
  onSubjectChange
}: AttendanceTableProps) {
  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 ml-1">
        {/* {Object.entries(filters).map(([k, v]) => (
          <FilterBadge
            key={k}
            label={k[0].toUpperCase() + k.slice(1)}
            value={v}
          />
        ))} */}
        {Object.entries(filters).map(([k, v]) => {
          if (k === "subject") {
            return (
              <div key={k} className="flex items-center gap-1.5">
                <span className="text-gray-500 text-xs font-medium">Subject</span>

                {/* 🔴 MARKED CHANGE */}
                <select
                  value={selectedSubjectId ?? ""}
                  onChange={(e) =>
                    onSubjectChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="px-2.5 py-0.5 outline-none rounded-full bg-[#E1F7EC] text-[#3EAD6F] text-[11px] font-bold"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option
                      key={s.collegeSubjectId}
                      value={s.collegeSubjectId}
                    >
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <FilterBadge
              key={k}
              label={k[0].toUpperCase() + k.slice(1)}
              value={v}
            />
          );
        })}

      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F9FB] text-gray-500">
                {[
                  "S.No",
                  "Roll No.",
                  "Photo",
                  "Name",
                  "Attendance",
                  "Attendance %",
                  "Reason",
                  "Status",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 px-${i === 0 ? 4 : 3
                      } text-[11px] font-bold uppercase tracking-wider ${i > 3 ? "text-center" : ""
                      }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* <tbody>
              {data.map((s) => (
                <Row
                  key={s.rollNo}
                  s={s}
                  onViewDetails={onViewDetails}
                  onAttendanceChange={onAttendanceChange}
                />
              ))}
            </tbody> */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-1 text-center">
                    <Loader />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    No students available for this section.
                  </td>
                </tr>
              ) : (
                data.map((s) => (
                  <Row
                    key={s.rollNo}
                    s={s}
                    onViewDetails={onViewDetails}
                    onAttendanceChange={onAttendanceChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4 px-2">
          <button
            onClick={() =>
              pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
            }
            disabled={pagination.currentPage === 1}
            className="p-2 cursor-pointer rounded-lg border bg-white disabled:opacity-40"
          >
            <CaretLeft size={16} />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => pagination.onPageChange(i + 1)}
              className={`w-8 h-8 cursor-pointer rounded-md text-sm font-semibold ${pagination.currentPage === i + 1
                ? "bg-[#16284F] text-white"
                : "bg-white border text-gray-600"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              pagination.onPageChange(
                Math.min(pagination.totalPages, pagination.currentPage + 1)
              )
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 cursor-pointer rounded-lg border bg-white disabled:opacity-40"
          >
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
