"use client";
import React from "react";
import { CaretDown } from "@phosphor-icons/react";

export interface StudentRecord {
  sNo: string;
  rollNo: string;
  photo: string;
  name: string;
  attendance: "Present" | "Absent";
  percentage: number;
  reason: string;
  status: "Top" | "Good" | "Low";
}

export interface AttendanceTableProps {
  data: StudentRecord[];
  filters: {
    year: string;
    section: string;
    sem: string;
    subject: string;
    date: string;
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
      <CaretDown size={11} weight="bold" />
    </button>
  </div>
);

const Row = ({
  s,
  onViewDetails,
  onAttendanceChange,
}: {
  s: StudentRecord;
  onViewDetails: (id: string) => void;
  onAttendanceChange: (id: string, st: "Present" | "Absent") => void;
}) => {
  const present = s.attendance === "Present";

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

      <td className="py-2.5 px-3">
        <button
          onClick={() =>
            onAttendanceChange(s.rollNo, present ? "Absent" : "Present")
          }
          className={`mx-auto flex items-center justify-between gap-1.5 px-2 py-0.5 rounded-md w-24 text-xs font-bold ${
            present
              ? "bg-[#E1F7EC] text-[#3EAD6F]"
              : "bg-[#FFE5E5] text-[#FF5C5C]"
          }`}
        >
          {s.attendance}
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
  onViewDetails,
  onAttendanceChange,
}: AttendanceTableProps) {
  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 ml-1">
        {Object.entries(filters).map(([k, v]) => (
          <FilterBadge
            key={k}
            label={k[0].toUpperCase() + k.slice(1)}
            value={v}
          />
        ))}
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
                    className={`py-3 px-${
                      i === 0 ? 4 : 3
                    } text-[11px] font-bold uppercase tracking-wider ${
                      i > 3 ? "text-center" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((s) => (
                <Row
                  key={s.rollNo}
                  s={s}
                  onViewDetails={onViewDetails}
                  onAttendanceChange={onAttendanceChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
