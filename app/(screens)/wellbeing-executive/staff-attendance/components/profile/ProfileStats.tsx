import type { StaffAttendanceRecord } from "../../data";

type ProfileStatsProps = {
  staff: StaffAttendanceRecord;
};

export default function ProfileStats({ staff }: ProfileStatsProps) {
  const attendanceScore =
    staff.totalWorkingDays > 0
      ? Math.round((staff.presentDays / staff.totalWorkingDays) * 100)
      : 0;

  const stats = [
    {
      label: "Total Working Days",
      value: staff.totalWorkingDays,
      suffix: "days",
      className: "text-[#16284F]",
    },
    {
      label: "Present Days",
      value: staff.presentDays,
      suffix: "days",
      className: "text-[#18B978]",
    },
    {
      label: "Absent Days",
      value: staff.absentDays,
      suffix: "days",
      className: "text-[#EF4444]",
    },
    {
      label: "Attendance %",
      value: `${attendanceScore}%`,
      suffix: "score",
      className: "text-[#2B76D2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-md border border-[#D7DFEC] bg-white px-4 py-3"
        >
          <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#7D8CA5]">
            {stat.label}
          </p>
          <p className={`mt-2 text-[22px] font-extrabold leading-none ${stat.className}`}>
            {stat.value}
            <span className="ml-2 text-[12px] font-bold text-[#64748B]">{stat.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
