import { Avatar } from "@/app/utils/Avatar";
import { User } from "@phosphor-icons/react";

interface ProfileProps {
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
}: ProfileProps) {
  return (
    <div className="rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm h-full font-sans flex flex-col justify-between">
      <div className="flex items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar src={photo} size={48} alt={name} />
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base md:text-xl font-bold text-[#333333] leading-tight">
              {name}
            </h2>
            <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-semibold text-[#4CAF50]">
              {department}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#E8F5E9] px-2 py-0.5 md:px-4 md:py-1 text-[9px] md:text-xs font-semibold text-[#4CAF50] mt-1 md:mt-0">
          ID {studentId}
        </span>
      </div>

      <div className="mt-5 md:mt-8 grid grid-cols-3 gap-2 md:gap-6 mb-3">
        <div>
          <p className="text-[10px] md:text-sm text-[#666666] font-medium">
            Number
          </p>
          <p
            className="mt-0.5 md:mt-1 text-[11px] md:text-base font-semibold text-[#333333] truncate"
            title={phone}
          >
            {phone}
          </p>
        </div>
        <div>
          <p className="text-[10px] md:text-sm text-[#666666] font-medium">
            Email
          </p>
          <p
            className="mt-0.5 md:mt-1 text-[11px] md:text-base font-semibold text-[#333333] truncate"
            title={email}
          >
            {email}
          </p>
        </div>
        <div>
          <p className="text-[10px] md:text-sm text-[#666666] font-medium">
            Address
          </p>
          <p
            className="mt-0.5 md:mt-1 text-[11px] md:text-base font-semibold text-[#333333] truncate"
            title={address}
          >
            {address}
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 mt-auto">
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
    <div
      className={`flex flex-col lg:flex-row items-start lg:items-center gap-1.5 md:gap-3 rounded-lg md:rounded-xl p-2 md:p-4 ${bg}`}
    >
      <div
        className={`flex h-6 w-6 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-[4px] md:rounded-lg text-white ${iconBg}`}
      >
        <User size={16} className="md:w-5 md:h-5" weight="fill" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] md:text-base font-bold text-[#333333] leading-none mb-0.5 md:mb-1">
          {value}
        </p>
        <p className="text-[8px] md:text-sm font-medium text-[#666666] leading-none truncate">
          {title}
        </p>
      </div>
    </div>
  );
}
