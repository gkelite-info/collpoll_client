"use client"
import { CalendarCheck } from "@phosphor-icons/react"

interface SemesterAttendanceCardProps {
  presentPercent?: number
  absentPercent?: number
  latePercent?: number
  overallPercent?: number
}

export default function SemesterAttendanceCard({
  presentPercent = 80,
  absentPercent = 15,
  latePercent = 5,
  overallPercent = 85,
}: SemesterAttendanceCardProps) {
  const bars = [
    {
      label: "Present",
      percent: presentPercent,
      bg: "#BFF5D2",
      fill: "#43C17A",
    },
    {
      label: "Absent",
      percent: absentPercent,
      bg: "#FFD6D6",
      fill: "#FF2020",
    },
    {
      label: "Late",
      percent: latePercent,
      bg: "#FFE7C2",
      fill: "#FFBB70",
    },
  ]

  return (
    <div className="h-32 flex-1 min-w-[16rem] rounded-lg p-3 bg-[#E9FFF0] flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex justify-between mb-2 items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#43C17A] w-9 h-8 rounded-sm flex items-center justify-center">
            <CalendarCheck size={24} color="#EFEFEF" weight="fill" />
          </div>
          <p className="text-[#282828] font-semibold">Semester Attendance</p>
        </div>
        <p className="text-[#43C17A] text-2xl font-bold">{overallPercent}%</p>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between mt-5 gap-2">
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
            <p className="text-xs mt-1 font-medium" style={{ color: bar.fill }}>
              {bar.percent}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
