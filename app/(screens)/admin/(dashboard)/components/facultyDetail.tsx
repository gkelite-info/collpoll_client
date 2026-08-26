import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyCard, { FacultyData } from "../utils/facultyDetailCard";
import SessionTable from "./tables/facultyDetailclassesTable";
import { useFacultySessions } from "../../hooks/useFacultySessions";
import { getAttendanceMonthlyStats } from "@/lib/helpers/myAttendance/getAttendanceMonthlyStats";
import { CardValueShimmer } from "../utils/TableShimmer";

interface FacultyDetailProps {
  faculty: FacultyData;
  onBack: () => void;
  collegeEdu?: string | null;
}

const FacultyDetail: React.FC<FacultyDetailProps> = ({ faculty, onBack, collegeEdu }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facultyId = (faculty as any)?.facultyId ?? (faculty as any)?.raw?.facultyId;
  const userId = (faculty as any)?.raw?.userId ?? (faculty as any)?.raw?.users?.userId;
  const [attendance, setAttendance] = useState({ workingDays: 0, presentDays: 0, absentDays: 0 });
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthParam = searchParams.get("month");
  const selectedMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? "")
    ? monthParam!
    : currentMonth;
  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
  const { sessions, loading } = useFacultySessions(facultyId, selectedMonth);

  useEffect(() => {
    let mounted = true;
    if (!userId) return;
    getAttendanceMonthlyStats({ userId, month: selectedMonthNumber, year: selectedYear })
      .then((stats) => {
        if (!mounted) return;
        const workingDays = stats.totalWorkingDays ?? 0;
        const presentDays = stats.presentDays ?? 0;
        setAttendance({
          workingDays,
          presentDays,
          absentDays: stats.lopDays ?? 0,
        });
      })
      .catch((error) => console.error("Failed to load faculty attendance stats", error))
      .finally(() => {
        if (mounted) setAttendanceLoading(false);
      });
    return () => { mounted = false; };
  }, [userId, selectedMonthNumber, selectedYear]);

  const handleMonthChange = (value: string) => {
    if (!value) return;
    setAttendanceLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.replace(`?${params.toString()}`);
  };

  const cardData: CardProps[] = [
    { value: attendanceLoading ? <CardValueShimmer /> : String(attendance.workingDays), label: "Total Working Days", bgColor: "bg-[#E2DAFF]", icon: <UserCircle />, iconBgColor: "bg-[#FFFFFF]", iconColor: "text-[#6C20CA]" },
    { value: attendanceLoading ? <CardValueShimmer /> : String(attendance.presentDays), label: "Days Present", bgColor: "bg-[#FFEDDA]", icon: <UserCircle />, iconBgColor: "bg-[#FFFFFF]", iconColor: "text-[#FFBB70]" },
    { value: attendanceLoading ? <CardValueShimmer /> : String(attendance.absentDays), label: "Days Absent", bgColor: "bg-[#FFE6E6]", icon: <UserCircle />, iconBgColor: "bg-[#FFFFFF]", iconColor: "text-[#FF2020]" },
  ];

  return (
    <div className="px-1 w-[92.5vw] landscape:w-[95.5vw] md:w-full landscape:md:w-full lg:w-full min-h-screen pb-7 md:pb-0 lg:pb-0">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 w-fit">
            <CaretLeft
              onClick={onBack}
              size={24}
              weight="bold"
              className="text-[#2D3748] cursor-pointer hover:-translate-x-1 transition-transform"
            />
            <h1 className="text-2xl font-bold text-[#282828]">Faculty</h1>
          </div>
          <p className="text-[#282828] mt-1 ml-8 text-sm">
            Dynamic faculty profile, attendance, and teaching assignments
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
          Month
          <input
            type="month"
            value={selectedMonth}
            max={currentMonth}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#282828] outline-none transition focus:border-[#43C17A] focus:ring-2 focus:ring-[#43C17A]/20"
          />
        </label>
      </div>

      <article className="relative flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
      </article>

      <div className="mb-6">
        <FacultyCard data={faculty} collegeEdu={collegeEdu} />
      </div>

      <div>
        <h3 className="font-semibold text-lg text-[#282828] mb-1">
          Classes Teaching
        </h3>
        <p className="text-sm text-[#525252] mb-3">
          Showing what classes/sections the faculty teaches
        </p>
      </div>
      <SessionTable sessions={sessions} loading={loading} />
    </div>
  );
};

export default FacultyDetail;
