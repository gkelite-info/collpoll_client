// "use client";
// import { CalendarCheck } from "@phosphor-icons/react";
// import { useTranslations } from "next-intl";

// interface SemesterAttendanceCardProps {
//   presentPercent?: number;
//   absentPercent?: number;
//   leavePercent?: number;
//   overallPercent?: number;
// }

// export default function SemesterAttendanceCard({
//   presentPercent = 0,
//   absentPercent = 0,
//   leavePercent = 0,
//   overallPercent = 0,
// }: SemesterAttendanceCardProps) {
//   const t = useTranslations("Attendance.student");

//   const bars = [
//     {
//       label: t("Present"),
//       percent: presentPercent,
//       bg: "#BFF5D2",
//       fill: "#43C17A",
//     },
//     {
//       label: t("Absent"),
//       percent: absentPercent,
//       bg: "#FFD6D6",
//       fill: "#FF2020",
//     },
//     {
//       label: t("Leave"),
//       percent: leavePercent,
//       bg: "#FFE7C2",
//       fill: "#FFBB70",
//     },
//   ];

//   return (
//     <div className="h-32 flex-1 min-w-[16rem] rounded-lg p-3 bg-[#E9FFF0] flex flex-col justify-between shadow-sm">
//       <div className="flex justify-between mb-2 items-center">
//         <div className="flex items-center gap-2">
//           <div className="bg-[#43C17A] w-9 h-8 rounded-sm flex items-center justify-center">
//             <CalendarCheck size={24} color="#EFEFEF" weight="fill" />
//           </div>
//           <p className="text-[#282828] font-semibold">
//             {t("Semester Attendance")}
//           </p>
//         </div>
//         <p className="text-[#43C17A] text-2xl font-bold">{overallPercent}%</p>
//       </div>

//       <div className="bg-red-00 flex items-end justify-between gap-2">
//         {bars.map((bar, index) => (
//           <div key={index} className="flex-1">
//             <div
//               className="h-2 w-full rounded-full relative overflow-hidden"
//               style={{ backgroundColor: bar.bg }}
//             >
//               <div
//                 className="h-full rounded-full transition-all duration-500"
//                 style={{
//                   width: `${bar.percent}%`,
//                   backgroundColor: bar.fill,
//                 }}
//               ></div>
//             </div>
//             <p className="text-xs mt-1 font-medium" style={{ color: bar.fill }}>
//               {bar.percent}%
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-red-00 w-[100%] grid grid-cols-3 ">
//         <div className="bg-gray-00 flex justify-start items-center gap-1">
//           <div className="h-3 w-3 bg-[#43C17A] rounded-xs"></div>
//           <p className="text-xs text-black">{t("Present")}</p>
//         </div>
//         <div className="bg-orange-00 flex justify-start items-center gap-1">
//           <div className="h-3 w-3 bg-[#FF2020] rounded-xs"></div>
//           <p className="text-xs text-black">{t("Absent")}</p>
//         </div>
//         <div className="bg-red-00 flex justify-start items-center gap-1">
//           <div className="h-3 w-3 bg-[#FFBB70] rounded-xs"></div>
//           <p className="text-xs text-black">{t("Leave")}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { CalendarCheck } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

interface SemesterAttendanceCardProps {
  presentPercent?: number;
  absentPercent?: number;
  leavePercent?: number;
  overallPercent?: number;
}

export default function SemesterAttendanceCard({
  presentPercent = 0,
  absentPercent = 0,
  leavePercent = 0,
  overallPercent = 0,
}: SemesterAttendanceCardProps) {
  const t = useTranslations("Attendance.student");

  const bars = [
    {
      label: t("Present"),
      percent: presentPercent,
      bg: "#BFF5D2",
      fill: "#43C17A",
    },
    {
      label: t("Absent"),
      percent: absentPercent,
      bg: "#FFD6D6",
      fill: "#FF2020",
    },
    {
      label: t("Leave"),
      percent: leavePercent,
      bg: "#FFE7C2",
      fill: "#FFBB70",
    },
  ];

  return (
    <>
      {/* 🖥️ DESKTOP VIEW */}
      <div className="hidden md:flex h-32 flex-1 min-w-[16rem] rounded-lg p-3 bg-[#E9FFF0] flex-col justify-between shadow-sm">
        <div className="flex justify-between mb-2 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#43C17A] w-9 h-8 rounded-sm flex items-center justify-center">
              <CalendarCheck size={24} color="#EFEFEF" weight="fill" />
            </div>
            <p className="text-[#282828] font-semibold">
              {t("Semester Attendance")}
            </p>
          </div>
          <p className="text-[#43C17A] text-2xl font-bold">{overallPercent}%</p>
        </div>

        <div className="flex items-end justify-between gap-2">
          {bars.map((bar, index) => (
            <div key={index} className="flex-1">
              <div
                className="h-2 w-full rounded-full relative overflow-hidden"
                style={{ backgroundColor: bar.bg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${bar.percent}%`,
                    backgroundColor: bar.fill,
                  }}
                ></div>
              </div>
              <p
                className="text-xs mt-1 font-medium"
                style={{ color: bar.fill }}
              >
                {bar.percent}%
              </p>
            </div>
          ))}
        </div>

        <div className="w-[100%] grid grid-cols-3">
          <div className="flex justify-start items-center gap-1">
            <div className="h-3 w-3 bg-[#43C17A] rounded-xs"></div>
            <p className="text-xs text-black">{t("Present")}</p>
          </div>
          <div className="flex justify-start items-center gap-1">
            <div className="h-3 w-3 bg-[#FF2020] rounded-xs"></div>
            <p className="text-xs text-black">{t("Absent")}</p>
          </div>
          <div className="flex justify-start items-center gap-1">
            <div className="h-3 w-3 bg-[#FFBB70] rounded-xs"></div>
            <p className="text-xs text-black">{t("Leave")}</p>
          </div>
        </div>
      </div>

      {/* 📱 MOBILE VIEW (Stacked horizontal bars matching screenshot) */}
      <div className="flex md:hidden w-full rounded-lg p-3 bg-[#E9FFF0] flex-col shadow-sm gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="bg-[#43C17A] w-7 h-7 rounded flex items-center justify-center">
              <CalendarCheck size={18} color="#EFEFEF" weight="fill" />
            </div>
            <p className="text-[#282828] font-semibold text-sm">
              {t("Semester Attendance")}
            </p>
          </div>
        </div>

        {/* Dynamic Horizontal Stacked Bars */}
        <div className="flex flex-col gap-2">
          {/* Main Attendance Percentage */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 h-2.5 rounded-full relative overflow-hidden bg-[#BFF5D2]">
              <div
                className="h-full rounded-full bg-[#43C17A] transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-[#43C17A] text-xs font-semibold w-8 text-right">
              {overallPercent}%
            </p>
          </div>
          {/* Absent Percentage */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 h-2.5 rounded-full relative overflow-hidden bg-[#FFD6D6]">
              <div
                className="h-full rounded-full bg-[#FF2020] transition-all duration-500"
                style={{ width: `${absentPercent}%` }}
              />
            </div>
            <p className="text-[#FF2020] text-xs font-semibold w-8 text-right">
              {absentPercent}%
            </p>
          </div>
          {/* Leave Percentage */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 h-2.5 rounded-full relative overflow-hidden bg-[#FFE7C2]">
              <div
                className="h-full rounded-full bg-[#FFBB70] transition-all duration-500"
                style={{ width: `${leavePercent}%` }}
              />
            </div>
            <p className="text-[#FFBB70] text-xs font-semibold w-8 text-right">
              {leavePercent}%
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
