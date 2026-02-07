"use client";

import { useRouter } from "next/navigation";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { getStudentDashboardData } from "@/lib/helpers/attendance/studentAtendanceActions";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getStudentDashboardData } from "@/lib/helpers/student/attendance/subjectWiseStats";
import { Loader } from "../../(student)/calendar/right/timetable";

interface CardItem {
  id: number;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  style?: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
}


type DashboardData = Awaited<
  ReturnType<typeof getStudentDashboardData>
>;


export default function SubjectAttendance() {
  const router = useRouter();


  const { userId, loading: userLoading } = useUser();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    // ✅ HARD GUARD
    if (userId === null) {
      console.warn("User not logged in");
      return;
    }

    // ✅ freeze non-null userId for TS
    const safeUserId = userId;

    async function loadData() {
      setLoading(true);

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      // ✅ guaranteed number
      const data = await getStudentDashboardData(safeUserId, dateStr);
      setDashboardData(data);

      setLoading(false);
    }

    loadData();
  }, [userId, userLoading]);



  const cards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
        : "0/0",
      label: "Total Classes",
      style: "bg-[#FFEDDA] w-44",
      iconBgColor: "#FFBB70",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: "Semester wise Classes",
      style: "bg-[#CEE6FF] w-44",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
      totalPercentage: dashboardData
        ? `${dashboardData.cards.percentage}%`
        : "0%",
    },
  ];



  // const cards: CardItem[] = [
  //   {
  //     id: 1,
  //     icon: <UsersThree size={32} />,
  //     value: "8/10",
  //     label: "Total Classes",
  //     style: "bg-[#FFEDDA] w-44",
  //     iconBgColor: "#FFBB70",
  //     iconColor: "#EFEFEF",
  //   },
  //   {
  //     id: 2,
  //     icon: <Chalkboard size={32} />,
  //     value: "220/250",
  //     label: "Semester wise Classes",
  //     style: "bg-[#CEE6FF] w-44",
  //     iconBgColor: "#7764FF",
  //     iconColor: "#EFEFEF",
  //     totalPercentage: "85%",
  //   },
  // ];

  const columns = [
    { title: "Subject", key: "subject" },
    { title: "Total", key: "total" },
    { title: "Attended", key: "attended" },
    { title: "Missed", key: "missed" },
    { title: "Leave", key: "leave" },
    { title: "Percentage", key: "percentage" },
    { title: "Notes", key: "notes" },
    { title: "Actions", key: "actions" },
  ];

  const tableData =
    dashboardData?.subjectWiseStats?.map((row: any) => ({
      subject: row.subjectName,
      total: row.total,
      attended: row.attended,
      missed: row.missed,
      leave: row.leave,
      percentage: `${row.percentage}%`,
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
      actions: (
        <span
          className="text-[#525252] cursor-pointer hover:underline underline"
          onClick={() =>
            router.push(
              `/attendance?tab=subject-attendance-details&subjectId=${row.subjectId}`
            )
          }
        >
          View Details
        </span>
      ),
    })) || [];

  const handleCardClick = (cardId: number) => {
    if (cardId === 1) {
      router.push("/attendance");
    }
  };

  if (loading || userLoading) {
    return <div className="p-6 flext justify-center text-gray-500"><Loader/></div>;
  }


  return (
    <>
      <div className="flex flex-col pb-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col w-[50%]">
            <h1 className="text-[#282828] font-bold text-2xl mb-1">
              Attendance
            </h1>
            <p className="text-[#282828]">
              Track, Manage, and Maintain Your Attendance Effortlessly
            </p>
          </div>

          <div className="flex justify-end w-[32%]">
            <CourseScheduleCard style="w-[320px]" />
          </div>
        </div>

        <div className="w-full h-[170px] mt-4 flex items-start gap-3">
          {cards.map((card, index) => (
            <CardComponent
              key={index}
              style={card.style}
              icon={card.icon}
              value={card.value}
              label={card.label}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
              underlineValue={card.underlineValue}
              totalPercentage={card.totalPercentage}
              onClick={() => handleCardClick(card.id)}
            />
          ))}

          <SemesterAttendanceCard
            presentPercent={dashboardData?.semesterStats.present || 0}
            absentPercent={dashboardData?.semesterStats.absent || 0}
            latePercent={dashboardData?.semesterStats.late || 0}
            overallPercent={dashboardData?.cards.percentage || 0}
          />



          {/* <SemesterAttendanceCard
            presentPercent={80}
            absentPercent={15}
            latePercent={5}
            overallPercent={85}
          /> */}
          <WorkWeekCalendar style="w-[345px] mt-0" />
        </div>

        <div className="mt-4 flex flex-col items-start">
          <h4 className="text-[#282828] font-medium">
            Subject-Wise Attendance
          </h4>
          <p className="text-[#282828] text-sm mt-1">Subject-Wise Breakdown</p>
          <TableComponent columns={columns} tableData={tableData} />
        </div>
      </div>
    </>
  );
}
