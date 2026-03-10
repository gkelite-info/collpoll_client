import { CaretDown, CaretLeft } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface FacultyDetailRecord {
  name: string;
  presentDays: number;
  absentDays: number;
  leaves: number;
  attendancePercent: number;
  lateCheckIns: number;
  status: string;
}

interface Props {
  month: string;
  months: string[];
  onMonthChange: (month: string) => void;
  onBack?: () => void;
}

const mockDetailsData: FacultyDetailRecord[] = [
  {
    name: "Dr. Meera Sharma",
    presentDays: 19,
    absentDays: 1,
    leaves: 0,
    attendancePercent: 95,
    lateCheckIns: 1,
    status: "Excellent",
  },
  {
    name: "Mr. Rahul Menon",
    presentDays: 17,
    absentDays: 2,
    leaves: 1,
    attendancePercent: 89,
    lateCheckIns: 3,
    status: "Needs Improvement",
  },
  {
    name: "Ms. Divya Rao",
    presentDays: 15,
    absentDays: 3,
    leaves: 2,
    attendancePercent: 84,
    lateCheckIns: 2,
    status: "Low Attendance",
  },
  {
    name: "Dr. Meera Sharma",
    presentDays: 20,
    absentDays: 0,
    leaves: 0,
    attendancePercent: 100,
    lateCheckIns: 0,
    status: "Perfect",
  },
  {
    name: "Mr. Rahul Menon",
    presentDays: 19,
    absentDays: 1,
    leaves: 0,
    attendancePercent: 95,
    lateCheckIns: 1,
    status: "Excellent",
  },
  {
    name: "Ms. Divya Rao",
    presentDays: 17,
    absentDays: 2,
    leaves: 1,
    attendancePercent: 89,
    lateCheckIns: 3,
    status: "Needs Improvement",
  },
  {
    name: "Dr. Meera Sharma",
    presentDays: 15,
    absentDays: 3,
    leaves: 2,
    attendancePercent: 84,
    lateCheckIns: 2,
    status: "Low Attendance",
  },
  {
    name: "Dr. Meera Sharma",
    presentDays: 20,
    absentDays: 0,
    leaves: 0,
    attendancePercent: 100,
    lateCheckIns: 0,
    status: "Perfect",
  },
];

export default function FacultyMonthDetailTable({
  month,
  months,
  onMonthChange,
  onBack,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAttendanceColor = (percent: number) => {
    if (percent >= 95) return "text-[#00B050]";
    if (percent >= 88) return "text-[#FFC000]";
    return "text-[#FF0000]";
  };

  return (
    <div className="w-full bg-[#F5F5F7] min-h-screen p-2 font-sans">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className=" cursor-pointer">
              <CaretLeft size={22} className="text-[#282828] font-bold" />
            </button>
          )}
          <h1 className="text-[20px] font-bold text-[#282828]">
            Faculty Attendance Table
          </h1>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#43C17A] cursor-pointer text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium text-[13px] shadow-sm hover:bg-[#3baf6d] transition-colors"
          >
            {month === "Jan" ? "January" : month}
            <CaretDown size={14} weight="bold" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-100 shadow-lg rounded-md py-1 z-50 max-h-48 overflow-y-auto">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onMonthChange(m);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 cursor-pointer py-1.5 text-[13px] transition-colors ${
                    month === m
                      ? "bg-[#e8f8ef] text-[#43C17A] font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {m === "Jan" ? "January" : m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FAFAFA] rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-300">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[850px]">
            <thead>
              <tr className="bg-[#EFEFEF] text-[#454545] text-[13px]">
                <th className="py-2.5 px-4 font-semibold sticky left-0 bg-[#EFEFEF] z-20 shadow-[1px_0_0_0_#e5e7eb]">
                  Name
                </th>
                <th className="py-2.5 px-4 font-semibold">Present Days</th>
                <th className="py-2.5 px-4 font-semibold">Absent Days</th>
                <th className="py-2.5 px-4 font-semibold">Leaves</th>
                <th className="py-2.5 px-4 font-semibold">Attendance %</th>
                <th className="py-2.5 px-4 font-semibold">Late Check-ins</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockDetailsData.map((row, idx) => (
                <tr
                  key={idx}
                  className="text-[#454545] text-[13px] hover:bg-white transition-colors border-b border-gray-100 last:border-none"
                >
                  <td className="py-2 px-4 font-medium sticky left-0 bg-[#FAFAFA] z-10 shadow-[1px_0_0_0_#e5e7eb]">
                    {row.name}
                  </td>
                  <td className="py-2 px-4">{row.presentDays}</td>
                  <td className="py-2 px-4">{row.absentDays}</td>
                  <td className="py-2 px-4">{row.leaves}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${getAttendanceColor(row.attendancePercent)}`}
                  >
                    {row.attendancePercent}%
                  </td>
                  <td className="py-2 px-4">{row.lateCheckIns}</td>
                  <td className="py-2 px-4">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
