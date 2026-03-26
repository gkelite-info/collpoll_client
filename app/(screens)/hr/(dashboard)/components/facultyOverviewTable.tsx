"use client";
import { useRouter } from "next/navigation";

export interface FacultyRecord {
  name: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Late" | "Absent";
  classesTaken: number;
  attendance: string;
}

interface Props {
  records: FacultyRecord[];
}

export default function FacultyOverviewTable({ records }: Props) {
  const router = useRouter();

  const handleViewProfile = (name: string) => {
    // Correctly routes to the HR's view of the attendance page
    // Passing the faculty name so the page knows whose data to load
    router.push(
      `/hr/MyAttendance?main=attendance&faculty=${encodeURIComponent(name)}`,
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-[#282828] font-medium text-[15px] mb-2 px-2">
        Faculty Attendance Overview
      </h3>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#F6F6F6] text-[#282828]">
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Name
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Check-In
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Check-Out
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Status
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap text-center">
                Classes Taken
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Attendance %
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-50 last:border-none text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <td className="py-2.5 px-4 font-medium text-[#282828]">
                  {row.name}
                </td>
                <td className="py-2.5 px-4">{row.checkIn}</td>
                <td className="py-2.5 px-4">{row.checkOut}</td>
                <td className="py-2.5 px-4">{row.status}</td>
                <td className="py-2.5 px-4 text-center">{row.classesTaken}</td>
                <td className="py-2.5 px-4">{row.attendance}</td>
                <td
                  className="py-2.5 px-4 hover:text-emerald-500 cursor-pointer font-medium"
                  onClick={() => handleViewProfile(row.name)}
                >
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
