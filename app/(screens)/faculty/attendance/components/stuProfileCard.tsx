"use client";

import { User, Chalkboard, Laptop } from "@phosphor-icons/react";
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
  isSubjectMode = false,
  subjectSummary,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-indigo-500 text-4xl font-medium text-white">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#333333]">{name}</h2>
            <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-semibold text-[#4CAF50]">
              {department}
            </span>
            <span className="rounded-full bg-[#E8F5E9] px-4 py-1 text-xs font-semibold text-[#4CAF50]">
              ID {studentId}
            </span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[#666666]">Number</p>
          <p className="mt-0.5 text-base font-semibold text-[#333333]">
            {phone}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#666666]">Email</p>
          <p className="mt-0.5 text-base font-semibold text-[#333333]">
            {email}
          </p>
        </div>
        {/* <div>
          <p className="text-sm text-[#666666]">Address</p>
          <p className="mt-0.5 text-base font-semibold text-[#333333]">
            {address}
          </p>
        </div> */}
      </div>

      {isSubjectMode && subjectSummary && onFilterChange ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FilterTile
            label="Total Classes"
            value={subjectSummary.total}
            active={activeFilter === "ALL"}
            onClick={() => onFilterChange("ALL")}
            color="purple"
          />
          <FilterTile
            label="Attended"
            value={subjectSummary.present}
            active={activeFilter === "Present"}
            onClick={() => onFilterChange("Present")}
            color="green"
          />
          <FilterTile
            label="Absent"
            value={subjectSummary.absent}
            active={activeFilter === "Absent"}
            onClick={() => onFilterChange("Absent")}
            color="red"
          />
          <FilterTile
            label="Leave"
            value={subjectSummary.leave}
            active={activeFilter === "Leave"}
            onClick={() => onFilterChange("Leave")}
            color="blue"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            bg="bg-[#E8F5E9]"
            iconBg="bg-[#4CAF50]"
            title="Total Attendance"
            value={`${attendanceDays} Days`}
            percent={80}
          />
          <StatCard
            bg="bg-[#FFEBEE]"
            iconBg="bg-[#F44336]"
            title="Total Absent"
            value={`${absentDays} Days`}
          />
          <StatCard
            bg="bg-[#E3F2FD]"
            iconBg="bg-[#42A5F5]"
            title="Total Leave"
            value={leaveDays}
          />
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
    <div className={`flex items-center gap-3 rounded-xl p-3.5 ${bg}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
      >
        <User size={20} weight="fill" />
      </div>

      <div className="min-w-0">
        <div className="flex gap-2">
          <p className="truncate text-base font-bold text-[#333333]">{value}</p>
          {percent && (
            <p className="text-[#43C17A] font-medium">{`${percent}%`}</p>
          )}
        </div>
        <p className="truncate text-xs font-medium text-[#666666]">{title}</p>
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
      className={`cursor-pointer flex items-center rounded-md p-2 h-18 transition-all ${s.bg}`}
    >
      <div className="flex gap-3 justify-center items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.icon}`}
        >
          <Laptop size={20} weight="fill" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#282828]">{value}</p>
          <p className="text-sm text-[#282828]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
