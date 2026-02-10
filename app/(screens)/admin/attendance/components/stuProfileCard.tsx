"use client";

import { User } from "@phosphor-icons/react";

interface Props {
  name: string;
  department: string;
  studentId: string;
  phone: string;
  email: string;
  address: string;
  photo: string;
  attendanceDays: number;
  absentDays: number;
  leaveDays: number;
}

export default function StudentProfileCard({
  name,
  department,
  studentId,
  phone,
  email,
  address,
  photo,
  attendanceDays,
  absentDays,
  leaveDays,
}: Props) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm">
      {/* Top section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={photo}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#333333]">{name}</h2>
            <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-semibold text-[#4CAF50]">
              {department}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-[#E8F5E9] px-4 py-1 text-xs font-semibold text-[#4CAF50]">
          ID {studentId}
        </span>
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

      {/* Stats Section */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          bg="bg-[#E8F5E9]"
          iconBg="bg-[#4CAF50]"
          title="Total Attendance"
          value={`${attendanceDays} Days`}
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
    </div>
  );
}

function StatCard({
  bg,
  iconBg,
  title,
  value,
}: {
  bg: string;
  iconBg: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3.5 ${bg}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
      >
        <User size={20} weight="fill" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[#333333]">{value}</p>
        <p className="truncate text-xs font-medium text-[#666666]">{title}</p>
      </div>
    </div>
  );
}
