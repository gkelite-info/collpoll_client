"use client";

import { Avatar } from "@/app/utils/Avatar";
import { calculateAttendancePercentage } from "@/lib/helpers/attendance/attendancePolicyMessage";
import { User, Laptop } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface Props {
  name: string;
  department: string;
  studentId: string;
  phone: string;
  email: string;
  address: string;
  photo: string;

  attendanceDays?: number;
  absentDays?: number;
  leaveDays?: number;
  attendancePercentage?: number;

  isSubjectMode?: boolean;
  subjectSummary?: {
    total: number;
    present: number;
    absent: number;
    leave: number;
  };
  activeFilter?: "ALL" | "Present" | "Absent" | "Leave";
  onFilterChange?: (filter: "ALL" | "Present" | "Absent" | "Leave") => void;
}

export default function StudentProfileCard({
  name,
  department,
  studentId,
  phone,
  email,
  address,
  photo,
  attendanceDays = 0,
  absentDays = 0,
  leaveDays = 0,
  attendancePercentage,
  isSubjectMode = false,
  subjectSummary,
  activeFilter,
  onFilterChange,
}: Props) {
  const countedDays = attendanceDays + absentDays;

  const attendancePercent =
    attendancePercentage ??
    calculateAttendancePercentage(attendanceDays, countedDays);

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar src={photo} size={64} alt={name} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#333333]">
              {name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#4CAF50]">
                {department}
              </span>
              <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#4CAF50]">
                ID {studentId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="mt-6 flex flex-row overflow-x-auto sm:grid sm:grid-cols-3 gap-4 sm:gap-6 justify-between hide-scrollbar">
        <div className="flex-1 min-w-[120px]">
          <p className="text-[10px] sm:text-sm text-[#666666]">Number</p>
          <p className="mt-0.5 text-xs sm:text-base font-semibold text-[#333333] truncate">
            {phone}
          </p>
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-[10px] sm:text-sm text-[#666666]">Email</p>
          <p className="mt-0.5 text-xs sm:text-base font-semibold text-[#333333] truncate">
            {email}
          </p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-[10px] sm:text-sm text-[#666666]">Address</p>
          <p className="mt-0.5 text-xs sm:text-base font-semibold text-[#333333] truncate">
            {address}
          </p>
        </div>
      </div>

      {isSubjectMode && subjectSummary && onFilterChange ? (
        <div className="mt-6 flex overflow-x-auto sm:grid sm:grid-cols-4 gap-2 sm:gap-4 pb-2 hide-scrollbar pt-1.5 px-1.5">
          <div className="flex-1 min-w-[110px] sm:min-w-0">
            <FilterTile
              label="Total Classes"
              value={subjectSummary.total}
              active={activeFilter === "ALL"}
              onClick={() => onFilterChange("ALL")}
              color="purple"
            />
          </div>
          <div className="flex-1 min-w-[110px] sm:min-w-0">
            <FilterTile
              label="Attendance"
              value={subjectSummary.present}
              active={activeFilter === "Present"}
              onClick={() => onFilterChange("Present")}
              color="green"
            />
          </div>
          <div className="flex-1 min-w-[110px] sm:min-w-0">
            <FilterTile
              label="Absent"
              value={subjectSummary.absent}
              active={activeFilter === "Absent"}
              onClick={() => onFilterChange("Absent")}
              color="red"
            />
          </div>
          <div className="flex-1 min-w-[110px] sm:min-w-0">
            <FilterTile
              label="Leave"
              value={subjectSummary.leave}
              active={activeFilter === "Leave"}
              onClick={() => onFilterChange("Leave")}
              color="blue"
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 flex overflow-x-auto sm:grid sm:grid-cols-3 gap-2 sm:gap-4 pb-2 hide-scrollbar">
          <div className="flex-1 min-w-[140px] sm:min-w-0">
            <StatCard
              bg="bg-[#E8F5E9]"
              iconBg="bg-[#4CAF50]"
              title="Total Attendance"
              value={`${attendanceDays} Days`}
              percent={attendancePercent}
            />
          </div>
          <div className="flex-1 min-w-[140px] sm:min-w-0">
            <StatCard
              bg="bg-[#FFEBEE]"
              iconBg="bg-[#F44336]"
              title="Total Absent"
              value={`${absentDays} Days`}
            />
          </div>
          <div className="flex-1 min-w-[140px] sm:min-w-0">
            <StatCard
              bg="bg-[#E3F2FD]"
              iconBg="bg-[#42A5F5]"
              title="Total Leave"
              value={leaveDays}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  bg,
  iconBg,
  title,
  value,
  percent,
}: {
  bg: string;
  iconBg: string;
  title: string;
  value: string | number;
  percent?: number;
}) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3.5 ${bg} h-full`}
    >
      <div
        className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
      >
        <User size={16} className="sm:hidden" weight="fill" />
        <User size={20} className="hidden sm:block" weight="fill" />
      </div>

      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1 sm:gap-2">
          <p className="truncate text-xs sm:text-base font-bold text-[#333333]">
            {value}
          </p>
          {percent !== undefined && (
            <p className="text-[#43C17A] text-[10px] sm:text-xs font-bold">{`${percent}%`}</p>
          )}
        </div>
        <p className="truncate text-[10px] sm:text-xs font-medium text-[#666666]">
          {title}
        </p>
      </div>
    </div>
  );
}

function FilterTile({
  label,
  value,
  active,
  onClick,
  color,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  color: "purple" | "green" | "red" | "blue";
}) {
  const styles = {
    purple: { bg: "bg-[#F3E8FF]", iconBg: "bg-[#7E22CE]", icon: "text-white" },
    green: { bg: "bg-[#DCFCE7]", iconBg: "bg-[#22C55E]", icon: "text-white" },
    red: { bg: "bg-[#FEE2E2]", iconBg: "bg-[#EF4444]", icon: "text-white" },
    blue: { bg: "bg-[#DBEAFE]", iconBg: "bg-[#3B82F6]", icon: "text-white" },
  };

  const s = styles[color];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "tween",
        duration: 0.08,
        ease: "easeOut",
      }}
      animate={{
        boxShadow: active
          ? "0px 0px 0px 2px rgba(107,114,128,0.6)"
          : "0px 0px 0px 0px rgba(0,0,0,0)",
        opacity: active ? 1 : 0.85,
      }}
      className={`cursor-pointer flex items-center rounded-md p-2 h-18 transition-all w-full ${s.bg}`}
    >
      <div className="flex gap-3 justify-start sm:justify-evenly items-center w-full">
        <div
          className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.icon}`}
        >
          <Laptop size={16} className="sm:hidden" weight="fill" />
          <Laptop size={20} className="hidden sm:block" weight="fill" />
        </div>
        <div className="flex flex-col justify-center text-left">
          <p className="text-xs sm:text-sm font-bold text-[#282828] leading-tight">
            {value < 10 ? `0${value}` : value}
          </p>
          <p className="text-[10px] sm:text-xs text-[#282828] leading-tight">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
