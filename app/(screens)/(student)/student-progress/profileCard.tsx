"use client";

import { Avatar } from "@/app/utils/Avatar";
import { User } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export type ProfileCardProps = {
  name: string;
  department: string;
  studentId: string;
  avatarUrl: string | null;
  attendancePercentage: number;
  attendanceCount: number;
  absentCount: number;
  leaveCount: number;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  department,
  studentId,
  avatarUrl,
  attendancePercentage,
  attendanceCount,
  absentCount,
  leaveCount,
}) => {
  const t = useTranslations("Progress.student"); // Hook

  return (
    <div className="bg-white w-full max-w-5xl rounded-3xl p-5 max-md:p-3 max-md:rounded-2xl">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4 max-md:mb-4 max-md:flex-row max-md:gap-3">
        <Avatar
          src={avatarUrl}
          size={64}
          alt={name}
        />

        <div className="flex grow items-center flex-wrap gap-3 max-md:gap-1.5">
          <h1 className="text-2xl font-bold text-gray-800 max-md:text-[15px] max-md:w-full">
            {name}
          </h1>

          <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full max-md:px-2 max-md:py-0.5 max-md:text-[9px]">
            {department}
          </span>

          <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full md:ml-auto max-md:px-2 max-md:py-0.5 max-md:text-[9px]">
            {studentId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-md:grid-cols-3 max-md:gap-2">
        <div className="bg-green-50 rounded-xl p-5 flex items-center gap-5 max-md:p-2 max-md:gap-2 max-md:rounded-lg">
          <div className="bg-green-500 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm max-md:w-8 max-md:h-8 max-md:rounded-md max-md:shrink-0">
            <div className="hidden md:block">
              <User size={32} weight="fill" color="white" />
            </div>
            <div className="block md:hidden">
              <User size={16} weight="fill" color="white" />
            </div>
          </div>
          <div className="flex flex-col max-md:justify-center">
            <div className="flex items-center gap-2 max-md:gap-1">
              <p className="text-xl font-bold text-gray-800 max-md:text-[11px] max-md:leading-tight">
                {attendanceCount} Present
              </p>
              <p className="text-lg font-semibold text-[#43C17A] max-md:text-[10px] max-md:leading-tight">
                {attendancePercentage}%
              </p>
            </div>
            <p className="text-gray-600 text-sm font-medium max-md:text-[8px] max-md:leading-tight">
              {t("Total Attendance")}
            </p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-5 flex items-center gap-5 max-md:p-2 max-md:gap-2 max-md:rounded-lg">
          <div className="bg-orange-400 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm max-md:w-8 max-md:h-8 max-md:rounded-md max-md:shrink-0">
            <div className="hidden md:block">
              <User size={32} weight="fill" color="white" />
            </div>
            <div className="block md:hidden">
              <User size={16} weight="fill" color="white" />
            </div>
          </div>
          <div className="flex flex-col max-md:justify-center">
            <p className="text-xl font-bold text-gray-800 max-md:text-[11px] max-md:leading-tight">
              {absentCount} Absent
            </p>
            <p className="text-gray-600 text-sm font-medium max-md:text-[8px] max-md:leading-tight">
              {t("Total Absent")}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 flex items-center gap-5 max-md:p-2 max-md:gap-2 max-md:rounded-lg">
          <div className="bg-blue-400 w-14 h-14 rounded-lg flex items-center justify-center shadow-sm max-md:w-8 max-md:h-8 max-md:rounded-md max-md:shrink-0">
            <div className="hidden md:block">
              <User size={32} weight="fill" color="white" />
            </div>
            <div className="block md:hidden">
              <User size={16} weight="fill" color="white" />
            </div>
          </div>
          <div className="flex flex-col max-md:justify-center">
            <p className="text-xl font-bold text-gray-800 max-md:text-[11px] max-md:leading-tight">
              {leaveCount}
            </p>
            <p className="text-gray-600 text-sm font-medium max-md:text-[8px] max-md:leading-tight">
              {t("Total Leave")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
