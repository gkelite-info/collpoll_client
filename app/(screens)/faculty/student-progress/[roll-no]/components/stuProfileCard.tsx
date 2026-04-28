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
  attendancePercentage: number;
  absentPercentage: number;
  leavePercentage: number;
}

export default function StudentProfileCard({
  name,
  department,
  studentId,
  phone,
  email,
  address,
  photo,
  attendancePercentage,
  absentPercentage,
  leavePercentage,
}: Props) {
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm h-full font-sans">
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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[#666666]">Number</p>
          <p className="mt-1 text-base font-semibold text-[#333333]">{phone}</p>
        </div>
        <div>
          <p className="text-sm text-[#666666]">Email</p>
          <div className="mt-1 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <p className="inline-block text-base font-semibold text-[#333333]">
              {email}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-[#666666]">Address</p>
          <div className="mt-1 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <p className="inline-block text-base font-semibold text-[#333333]">
              {address}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          bg="bg-[#E8F5E9]"
          iconBg="bg-[#4CAF50]"
          title="Total Attendance"
          value={`${attendancePercentage}%`}
        />
        <StatCard
          bg="bg-[#FFEBEE]"
          iconBg="bg-[#F44336]"
          title="Total Absent"
          value={`${absentPercentage}%`}
        />
        <StatCard
          bg="bg-[#E3F2FD]"
          iconBg="bg-[#42A5F5]"
          title="Total Leave"
          value={`${leavePercentage}%`}
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
    <div className={`flex items-center gap-3 rounded-xl p-4 ${bg}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
      >
        <User size={20} weight="fill" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[#333333]">{value}</p>
        <p className="truncate text-sm font-medium text-[#666666]">{title}</p>
      </div>
    </div>
  );
}
