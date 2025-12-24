"use client";

import { User } from "@phosphor-icons/react";

export type ProfileCardProps = {
  name: string;
  department: string;
  studentId: string;
  avatarUrl: string;
  attendanceDays: number;
  absentDays: number;
  leaveDays: number;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  department,
  studentId,
  avatarUrl,
  attendanceDays,
  absentDays,
  leaveDays,
}) => {
  return (
    <div className="bg-white w-full max-w-5xl rounded-3xl p-5 ">
      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
        <img
          src={avatarUrl}
          alt="Ananya Sharma"
          className="w-16 h-16 rounded-full object-cover shadow-sm"
        />

        <div className="flex flex-grow items-center flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{name}</h1>

          <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full">
            {department}
          </span>

          <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full md:ml-auto">
            {studentId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl p-5 flex items-center gap-5">
          <div className="bg-green-500 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm">
            <User size={32} weight="fill" color="white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">
              {attendanceDays} Days
            </p>
            <p className="text-gray-600 text-sm font-medium">
              Total Attendance
            </p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-5 flex items-center gap-5">
          <div className="bg-orange-400 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm">
            <User size={32} weight="fill" color="white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{absentDays} Day</p>
            <p className="text-gray-600 text-sm font-medium">Total Absent</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 flex items-center gap-5">
          <div className="bg-blue-400 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm">
            <User size={32} weight="fill" color="white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{leaveDays}</p>
            <p className="text-gray-600 text-sm font-medium">Total Leave</p>
          </div>
        </div>
      </div>
    </div>
  );
};
